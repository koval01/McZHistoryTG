var notify_hidden = true, server_update_active = true, first_load = false, load_freeze = false, last_post = null, last_notify_text = null
const reply_enabled = false, loading_posts = "Подгружаем посты..."

const reply_post_link_icon = `
    <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="24.000000pt" height="24.000000pt" 
        viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet" class="reply_post_link">
        <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
            <path d="M1895 4672 c-16 -11 -443 -421 -949 -912 -601 -584 -923 -904 -932 -926 -20 -48 -17 -93 9 -136 12 -21 
                437 -440 945 -933 1001 -970 953 -929 1041 -905 21 5 50 19 65 31 57 45 56 37 56 555 l0 477 283 -6 c217 -4 
                314 -10 421 -26 803 -124 1502 -586 1916 -1267 36 -58 76 -119 89 -135 68 -85 187 -78 255 14 66 89 0 643 -120 
                1012 -336 1030 -1186 1806 -2234 2038 -141 32 -296 55 -415 62 -49 3 -114 8 -142 11 l-53 5 0 471 c0 519 0 515 
                -63 560 -43 31 -132 36 -172 10z">
            </path>
        </g>
    </svg>
`

function mediaError(e) {
    return e.onerror = "", e.src = "", !0
}

function hide_splash() {
    document.getElementById("splash_screen").style.display = "none"
    document.getElementById("main_screen").style.display = null
    setTimeout(function() {
        document.getElementById("main_screen").style.top = "0vh"
    }, 50)
}

function notify(text) {
    const error_box = $(".error_box")
    const error_text = $(".error_text")
    if (notify_hidden && (last_notify_text != text || loading_posts == text)) {
        last_notify_text = text
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

    function get_neuro_continue(callback) {
        $.ajax({
            url: `https://api.zalupa.world/neuro`,
            type: "GET",
            success: function (r) {
                if (r.success) {
                    callback(r.body)
                } else {
                    notify("Ошибка! Не удалось получить ответ от нейросети (get_neuro_continue)")
                }
            },
            error: function () {
                notify("Не удалось получить ответ от нейросети")
            }
        })
    }

    function get_chat_data(callback) {
        $.ajax({
            url: `https://api.zalupa.world/gamechat`,
            type: "GET",
            success: function (r) {
                if (r.success) {
                    callback(r.body)
                } else {
                    notify("Ошибка! Не удалось получить данные чата (get_chat_data)")
                }
            },
            error: function () {
                notify("Ошибка API (get_chat_data)")
            }
        })
    }

    function chat_colors_parse(color_) {
        const colors = {
            "white": "FFFFFF",
            "gray": "AAAAAA",
            "black": "000000",
            "dark_red": "AA0000",
            "red": "FF5555",
            "gold": "FFAA00",
            "yellow": "FFFF55",
            "dark_green": "00AA00",
            "green": "55FF55",
            "aqua": "55FFFF",
            "dark_aqua": "00AAAA",
            "dark_blue": "0000AA",
            "blue": "5555FF",
            "light_purple": "FF55FF",
            "dark_purple": "AA00AA",
            "dark_gray": "555555"
        }
        if (color_.slice(0, 1) != "#") {
            return `#${colors[color_]}`
        }
        return color_
    }

    function chatdata_parse(msg) {
        let message_struct = ""
        let messages_array = ""

        for (let i = 0; i < msg.length; i++) {
            for (let j = 0; j < msg[i]['raw_msg'].length; j++) {
                const j_body = msg[i]['raw_msg'][j]
                let patt = `<span style="color:${chat_colors_parse(j_body.color)};display:inline">${j_body.text}</span>`
                message_struct = message_struct + patt
            }
            // post-update
            message_struct = message_struct + "<br/>"
            messages_array = messages_array + message_struct
            message_struct = ""
        }
        return messages_array
    }

    function chat_update_() {
        try {
            get_chat_data(function (data) {
                data = chatdata_parse(data)
                $("#gamechat_server").html(data)
            })
        } catch {}
    }

    function neuro_text_update() {
        try {
            get_neuro_continue(function (data) {
                $("#neuro_text_continue_").text(data)
            })
        } catch {}
    }

    function monitoring_game_server_update() {
        try {
            if (server_update_active) {
                get_game_server_data(function (data) {
                    $("#server_motd").html(data.motd.html)
                    $("#server_players").text(`${data.players.online}/${data.players.max}`)
                    // $("#server_version").text(data.server.protocol)
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
        } catch {}

        try {
            extract_media_url($(".tgme_widget_message_video", jq_object), "video")
        } catch {}

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

                const reply_get = $(".tgme_widget_message_reply", el)
                var reply_msg_id = null

                if (reply_get.html()) {
                    reply_msg_id = reply_get.attr("href")
                    reply_msg_id = parseInt(reply_msg_id.match(/\/\d+/g)[0].slice(1))
                }

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
                    "post_id": post_id,
                    "reply_post_id": reply_msg_id,
                })
            } catch {}
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
        const frgs = [" pinned «", "Channel photo updated"]

        for (let i = 0; i < frgs.length; i++) {
            if (text.includes(frgs[i])) {
                return false
            }
        }

        return true
    }

    function add_post(post_data, source) {
        const media = post_data.media.data
        const views = post_data.meta.views
        const time_ = post_data.meta.time
        const data_post = post_data.data_post
        const reply_post_id = post_data.reply_post_id
        const post_id = post_data.post_id

        let post_text = post_data.post_text
        let media_pattern = format_media(media)
        let reply_ = "block"
        let reply_enb = "block"
        let reply_post = "block"

        if (!post_text) {
            post_text = ""
        }
        if (!reply_post_id) {
            reply_ = "none"
        }
        if (!reply_enabled) {
            reply_enb = "none"
        }
        if (reply_post_id && !reply_enabled) {
            reply_post = "none"
        }

        const pattern = `
        <div class="col post_style_set" id="post_${post_id}" style="display:${reply_post}">
            <!-- reply_post_id: ${reply_post_id}; reply_enabled: ${reply_enabled} -->
            <div class="card shadow-sm" style="transition:background-color 1s ease">
                ${media_pattern}
                <div class="card-body">
                    <div id="post_reply_button_" style="display:${reply_enb}"> 
                        <!-- reply_enabled: ${reply_enabled} -->
                        <a href="#post_${reply_post_id}" class="scroll-to" style="display:${reply_}">
                            ${reply_post_link_icon}
                        </a>
                    </div>
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
    
    // splash screen
    setTimeout(hide_splash, 3 * 1000)

    // init first posts
    loads_posts()

    // init gaming server monitoring
    monitoring_game_server_update()
    setInterval(monitoring_game_server_update, 800)

    // init chat
    // chat_update_()
    // setInterval(chat_update_, 800)

    // init neuro text updater
    neuro_text_update()
    setInterval(neuro_text_update, 1000 * 10)
})

