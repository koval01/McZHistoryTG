var notify_hidden = true
var server_update_active = true

function mediaError(e) {
    return e.onerror = "", e.src = "", !0
}

function notify(text) {
    const error_box = $(".error_box")
    const error_text = $(".error_text")
    
    let ready = false
    
    if (notify_hidden) { ready = true } 
    else { error_box.css("margin-bottom", "-50px"), ready = true }
    
    if (ready) {
        error_text.text(text)
        error_box.css("margin-bottom", "0")
        setTimeout(function() { error_box.css("margin-bottom", "-50px") }, 2500)
    }
}

$(document).ready(function () {
    function clear_str_(string_) {
        return string_.toString().replace(/\\n/g, '').replace(/\\"/g, '"').replace(/\\/g, '')
    }

    function get_channel_html_data(callback, bef_ = null) {
        $.ajax({
            url: `https://api.zalupa.world/channel?before=${bef_}&choice=0`,
            type: "GET",
            success: function (r) {
                if (r.success && r.body.length > 128) {
                    callback(clear_str_(r.body))
                } else { 
                    console.log("Check error! (get_channel_html_data)")
                    notify("Ошибка проверки данных (get_channel_html_data)")
                }
            },
            error: function () {
                console.log("Error get channel data!")
                notify("Не удалось загрузить посты")
            }
        })
    }

    function get_game_server_data(callback) {
        $.ajax({
            url: `https://api.zalupa.world/server`,
            type: "GET",
            success: function (r) {
                if (r.success && r.data.toString().length > 0) {
                    callback(r.body)
                } else { 
                    console.log("Check error! (get_game_server_data)")
                    notify("Ошибка проверки данных (get_game_server_data)")
                }
            },
            error: function () {
                console.log("Error get server data!")
                notify("Не удалось загрузить данные сервера")
            }
        })
    }

    function monitoring_game_server_update() {
        console.log("Update server data")
        try {
            if (server_update_active) {
                get_game_server_data(function(data) {
                    $("#server_motd").text(data.motd.html)
                    $("#server_players").text(`${data.players.online}/${data.players.max}`)
                    // $("#server_version").text(data.server.protocol)
                })
            }
        } catch (e) {
            console.log(e)
            server_update_active = false
        }
    }

    function time_processing(time) {
        const date_ = Date.parse(time)
        const date = new Date();
        const offset = date.getTimezoneOffset();
        const timezone_ = Math.abs(offset) * 60 * 1000 + date_
        const date_obj = new Date(timezone_)

        return date_obj.toLocaleString()
    }

    function get_media(jq_object) {
        var array_ = []

        function media_struct(url, type_) {
            array_.push({
                "m_type": type_, "m_url": url
            })
        }

        function extract_media_url(obj, type_) {
            for (let i = 0; i < obj.length; i++) {
                let media_obj = null

                const el = $('<div></div>')
                el.html(obj[i])

                if (type_ == "image") {
                    media_obj = $(".tgme_widget_message_photo_wrap", el).css("background-image")
                        .replace(/url\(\"/g, "").replace(/\"\)/g, "")
                } else if (type_ == "video") {
                    media_obj = $(".tgme_widget_message_video", el).attr("src")
                }

                media_struct(media_obj, type_)
            }
        }

        try {
            extract_media_url($(".tgme_widget_message_photo_wrap", jq_object), "image")
        } catch (e) {
            console.log(`Images extract catch: ${e}`)

        }

        try {
            extract_media_url($(".tgme_widget_message_video", jq_object), "video")
        } catch (e) {
            console.log(`Videos extract catch: ${e}`)
        }

        console.log(array_)
        return array_
    }

    function struct_els(els) {
        console.log(`Len els: ${els.length}`)
        let array_ = []

        for (let i = 0; i < els.length; i++) {
            console.log(els[i])
            const el = $('<div></div>')
            el.html(els[i])
  
            const text_post = $(".tgme_widget_message_text", el).html()
            const views = $(".tgme_widget_message_views", el).html()
            const data_post = $(".tgme_widget_message", el).attr("data-post")
            const time_ = time_processing($(".time", el).attr("datetime"))

            const media_ = get_media(el)

            array_.push({
                "post_text": text_post,
                "meta": {
                    "views": views, "time": time_
                }, "media": {
                    "data": media_
                }, "data_post": data_post
            })
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

    function add_post(post_data) {
        const media = post_data.media.data
        const views = post_data.meta.views
        const time_ = post_data.meta.time
        const data_post = post_data.data_post

        let post_text = post_data.post_text
        let media_pattern = format_media(media)

        if (!post_text) {post_text = ""}

        const pattern = `
            <div class="col" style="margin-bottom:0.7em;padding-right:8px!important;padding-left:8px!important">
                <div class="card shadow-sm">
                    ${media_pattern}
                    <div class="card-body">
                        <p class="card-text" style="margin-top:-0.8em">${post_text}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <span class="post_views">${views}</span> | 
                                ${time_} | 
                                <a href="https://t.me/${data_post}" target="_blank">В TG</a>
                                <br/>by Elon Tusk
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `

        console.log(`Result pattern: ${pattern}`)
        $(".row-global-block").append(pattern)
    }

    function loads_posts(before = null) {
        get_channel_html_data(function (data) { 
            const el = $('<div></div>')
            el.html(data)

            const parsed_els = $('.tgme_widget_message_wrap', el)
            const struct = struct_els(parsed_els)

            for (let i = 0; i < struct.length; i++) {
                console.log(struct[i])
                add_post(struct[i])
            }

        }, bef_ = before)
    }

    // init
    loads_posts()

    monitoring_game_server_update()
    setInterval(monitoring_game_server_update, 3000)
})
