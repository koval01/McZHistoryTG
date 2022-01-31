var notify_hidden = true, server_update_active = true, first_load = false, load_freeze = false, last_post = null, last_notify_text = null
const loading_posts = "Подгружаем посты...", re_pub = "6LcHlUUeAAAAAMVppNFdbltrVdZzpRHH4HUU9nPJ"

function mediaError(e) {
    return e.onerror = "", e.src = "", !0
}

function hide_splash() {
    document.getElementById("splash_screen").style.display = "none"
    document.getElementById("main_screen").style.display = null
    setTimeout(function () {
        document.getElementById("main_screen").style.top = "0vh"
    }, 50)
}

function notify(text) {
    const error_box = $(".error_box")
    const error_text = $(".error_text")
    if (notify_hidden && (last_notify_text != text || loading_posts == text)) {
        if (loading_posts != text) { last_notify_text = text }
        notify_hidden = false
        error_text.text(text)
        error_box.css("margin-bottom", "0")
        setTimeout(function () {
            error_box.css("margin-bottom", "-150px")
            notify_hidden = true
        }, 2500)
    }
}

$(document).ready(function () {
    function clear_str_(string_) {
        return string_.toString().replace(/\\n/g, '').replace(/\\"/g, '"').replace(/\\/g, '')
    }

    $("a.scroll-to").on("click", function (e) {
        e.preventDefault()
        var anchor = $(this).attr('href')

        if (!anchor) {
            notify("Не удалось найти запись")
        }

        $('html, body').stop().animate({
            scrollTop: $(anchor).offset().top - 80
        }, 800)
    })
    
    function check_ip_() {
        grecaptcha.ready(function () {
            grecaptcha.execute(re_pub, {action: "submit"}).then(function (i) {
                $.ajax({
                    url: "https://testapp39.herokuapp.com/check",
                    type: "POST",
                    data: JSON.stringify({"token": i}),
                    contentType: "application/json",
                    success: function (r) {
                        if (r.success) {
                            notify("Твой IP добавлен в белый список (check_ip_)")
                        } else {
                            notify("Твой IP не прошел проверку (check_ip_)")
                        }
                    },
                    error: function (err) {
                        console.log(`Error ajax (check_ip_): ${err}`)
                    },
                    statusCode: {
                        429: function(response) {
                            notify(`${response.responseText} (check_ip_)`)
                        }
                    }
                })
            })
        })
    }

    function get_channel_html_data(callback, source, bef_ = null) {
        const sources = ["Elon Tusk", "Канал Zalupa.Online"]
        $.ajax({
            url: `https://api.zalupa.world/channel?before=${bef_}&choice=${source}`,
            type: "GET",
            success: function (r) {
                if (r.success && r.body.length > 128) {
                    callback({ "data": clear_str_(r.body), "source": sources[source] })
                } else {
                    notify("Ошибка проверки данных (get_channel_html_data)")
                }
            },
            error: function () {
                notify("Не удалось загрузить посты")
            }
        })
    }

    function get_game_server_data(callback) {
        $.ajax({
            url: `https://api.zalupa.world/server`,
            type: "GET",
            success: function (r) {
                if (r.success) {
                    callback(r.body)
                } else {
                    notify("Ошибка проверки данных (get_game_server_data)")
                }
            },
            error: function () {
                notify("Не удалось загрузить данные сервера")
            }
        })
    }

    function monitoring_game_server_update() {
        try {
            if (server_update_active) {
                get_game_server_data(function (data) {
                    $("#server_motd").html(data.motd.html)
                    $("#server_players").text(`${data.players.online}/${data.players.max}`)
                })
            }
        } catch {
            server_update_active = false
        }
    }

    function time_processing(time) {
        const date_ = Date.parse(time)
        const date = new Date()
        const offset = date.getTimezoneOffset()
        const timezone_ = Math.abs(offset) * 60 * 1000 + date_
        const date_obj = new Date(timezone_)

        return date_obj.toLocaleString()
    }

    function get_media(jq_object) {
        var array_ = []

        function media_struct(url, type_) {
            array_.push({
                "m_type": type_,
                "m_url": url
            })
        }

        function extract_media_url(obj, type_) {
            var prev_link = null
            for (let i = 0; i < obj.length; i++) {
                let media_obj = null

                const el = $('<div></div>')
                el.html(obj[i])

                if (type_ == "image") {
                    media_obj = $(".tgme_widget_message_photo_wrap", el).css("background-image")
                        .replace(/url\(\"/g, "").replace(/\"\)/g, "")
                } else if (type_ == "video") {
                    media_obj = $(".tgme_widget_message_video", el).attr("src")
                    if (prev_link == media_obj) { media_obj = null }
                    else { prev_link = media_obj }
                }

                media_struct(media_obj, type_)
            }
        }

        try {
            extract_media_url($(".tgme_widget_message_photo_wrap", jq_object), "image")
        } catch { }

        try {
            extract_media_url($(".tgme_widget_message_video", jq_object), "video")
        } catch { }

        return array_
    }

    function struct_els(els) {
        let array_ = []

        for (let i = 0; i < els.length; i++) {

            try {
                const el = $('<div></div>')
                el.html(els[i])

                const text_post = $(".js-message_text", el).html()
                const views = $(".tgme_widget_message_views", el).html()

                const data_post = $(".tgme_widget_message", el).attr("data-post")
                const post_id = parseInt(data_post.match(/\/\d+/g)[0].slice(1))

                const time_ = time_processing($(".time", el).attr("datetime"))

                const media_ = get_media(el)

                array_.push({
                    "post_text": text_post,
                    "meta": {
                        "views": views,
                        "time": time_
                    },
                    "media": {
                        "data": media_
                    },
                    "data_post": data_post,
                    "post_id": post_id
                })
            } catch { }
        }

        return array_.reverse()
    }

    function format_media(media) {
        let media_pattern = ""

        for (let i = 0; i < media.length; i++) {
            if (media[i].m_url) {
                if (media[i].m_type == "image") {
                    const image_pattern = `
                    <img src="${media[i].m_url}" onerror="mediaError(this);" class="bd-placeholder-img card-img-top" 
                        width="100%" height="100%" role="img" title="Фото" aria-label="Фото" 
                        style="margin-bottom:0.4em;border-radius:3px!important">`

                    media_pattern = `${media_pattern}\n${image_pattern}`

                } else if (media[i].m_type == "video") {
                    const video_pattern = `
                    <video src="${media[i].m_url}" controls loop onerror="mediaError(this);" class="bd-placeholder-img card-img-top" 
                        width="100%" height="100%" title="Видео" aria-label="Видео" 
                        style="margin-bottom:0.4em;border-radius:3px!important"></video>`

                    media_pattern = `${media_pattern}\n${video_pattern}`

                }
            }
        }

        return media_pattern
    }

    function check_sys_msg(text) {
        const frgs = [" pinned «", "Channel photo updated", "Channel name was changed to «", "Channel created"]

        for (let i = 0; i < frgs.length; i++) {
            if (text.includes(frgs[i])) {
                return false
            }
        }

        return true
    }

    function add_post(post_data, source) {
        const media = post_data.media.data,
            views = post_data.meta.views,
            time_ = post_data.meta.time,
            data_post = post_data.data_post,
            post_id = post_data.post_id

        let post_text = post_data.post_text,
            media_pattern = format_media(media)

        if (!post_text) {
            post_text = ""
        }

        const pattern = `
        <div class="col post_style_set" id="post_${post_id}">
            <div class="card shadow-sm" style="transition:background-color 1s ease">
                ${media_pattern}
                <div class="card-body">
                    <p class="card-text" style="margin-top:-0.8em">${post_text}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                            <span class="post_views">${views}</span> | 
                            ${time_} | 
                            <a href="https://t.me/${data_post}" target="_blank">В TG</a>
                            <br/>with ${source}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    `

        last_post = post_id

        if (!post_text.length && !media_pattern.length || !check_sys_msg(post_text)) {
            return
        }

        $(".row-global-block").append(pattern)
    }

    function loads_posts(before = null) {
        get_channel_html_data(function (data_) {
            data = data_.data
            const el = $('<div></div>')
            el.html(data)

            const parsed_els = $('.tgme_widget_message_wrap', el)
            const struct = struct_els(parsed_els)

            for (let i = 0; i < struct.length; i++) {
                add_post(struct[i], data_.source)
            }

            load_freeze = false
            first_load = true

        }, 1, bef_ = before)
    }

    $(window).scroll(function () {
        const scrollPosition = window.pageYOffset
        const windowSize = window.innerHeight
        const bodyHeight = document.documentElement.scrollHeight
        const trigger = Math.max(bodyHeight - (scrollPosition + windowSize), 0)

        if (trigger < 450 && first_load && !load_freeze && last_post > 1) {
            load_freeze = true
            notify(loading_posts)
            loads_posts(last_post)
        }
    })
    
    $( "#check_ip_button" ).click(function() {
      check_ip_()
    })

    // splash screen
    setTimeout(hide_splash, 3 * 1000)

    // init first posts
    loads_posts()

    // init gaming server monitoring
    monitoring_game_server_update()
    setInterval(monitoring_game_server_update, 800)
})
