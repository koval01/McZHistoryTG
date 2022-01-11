var notify_hidden = !0,
    server_update_active = !0,
    first_load = !1,
    load_freeze = !1,
    last_post = null;
const reply_enabled = !1,
    reply_post_link_icon =
        '\n    <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="24.000000pt" height="24.000000pt" \n        viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet" class="reply_post_link">\n        <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">\n            <path d="M1895 4672 c-16 -11 -443 -421 -949 -912 -601 -584 -923 -904 -932 -926 -20 -48 -17 -93 9 -136 12 -21 \n                437 -440 945 -933 1001 -970 953 -929 1041 -905 21 5 50 19 65 31 57 45 56 37 56 555 l0 477 283 -6 c217 -4 \n                314 -10 421 -26 803 -124 1502 -586 1916 -1267 36 -58 76 -119 89 -135 68 -85 187 -78 255 14 66 89 0 643 -120 \n                1012 -336 1030 -1186 1806 -2234 2038 -141 32 -296 55 -415 62 -49 3 -114 8 -142 11 l-53 5 0 471 c0 519 0 515 \n                -63 560 -43 31 -132 36 -172 10z">\n            </path>\n        </g>\n    </svg>\n';
function mediaError(e) {
    return (e.onerror = ""), (e.src = ""), !0;
}
function notify(e) {
    const t = $(".error_box"),
        o = $(".error_text");
    let n = !1;
    notify_hidden ? (n = !0) : (t.css("margin-bottom", "-50px"), (n = !0)),
        n &&
            (o.text(e),
            t.css("margin-bottom", "0"),
            setTimeout(function () {
                t.css("margin-bottom", "-50px");
            }, 2500));
}
$(document).ready(function () {
    function e() {
        try {
            (e = function (e) {
                $("#neuro_text_continue_").text(e);
            }),
                $.ajax({
                    url: "https://api.zalupa.world/neuro",
                    type: "GET",
                    success: function (t) {
                        t.success ? e(t.body) : (console.log("Check error! (get_neuro_continue)"), notify("Ошибка! Не удалось получить ответ от нейросети (get_neuro_continue)"));
                    },
                    error: function () {
                        console.log("Error get server data!"), notify("Не удалось получить ответ от нейросети");
                    },
                });
        } catch (e) {
            console.log(e);
        }
        var e;
    }
    function t() {
        console.log("Update server data");
        try {
            server_update_active &&
                ((e = function (e) {
                    $("#server_motd").html(e.motd.html), $("#server_players").text(`${e.players.online}/${e.players.max}`);
                }),
                $.ajax({
                    url: "https://api.zalupa.world/server",
                    type: "GET",
                    success: function (t) {
                        t.success ? e(t.body) : (console.log("Check error! (get_game_server_data)"), notify("Ошибка проверки данных (get_game_server_data)"));
                    },
                    error: function () {
                        console.log("Error get server data!"), notify("Не удалось загрузить данные сервера");
                    },
                }));
        } catch (e) {
            console.log(e), (server_update_active = !1);
        }
        var e;
    }
    function o(e) {
        const t = Date.parse(e),
            o = new Date().getTimezoneOffset(),
            n = 60 * Math.abs(o) * 1e3 + t;
        return new Date(n).toLocaleString();
    }
    function n(e) {
        var t = [];
        function o(e, o) {
            t.push({ m_type: o, m_url: e });
        }
        function n(e, t) {
            for (let n = 0; n < e.length; n++) {
                let r = null;
                const s = $("<div></div>");
                s.html(e[n]),
                    "image" == t
                        ? (r = $(".tgme_widget_message_photo_wrap", s)
                              .css("background-image")
                              .replace(/url\(\"/g, "")
                              .replace(/\"\)/g, ""))
                        : "video" == t && (r = $(".tgme_widget_message_video", s).attr("src")),
                    o(r, t);
            }
        }
        try {
            n($(".tgme_widget_message_photo_wrap", e), "image");
        } catch (e) {
            console.log(`Images extract catch: ${e}`);
        }
        try {
            n($(".tgme_widget_message_video", e), "video");
        } catch (e) {
            console.log(`Videos extract catch: ${e}`);
        }
        return console.log(t), t;
    }
    function r(e) {
        const t = e.media.data,
            o = e.meta.views,
            n = e.meta.time,
            r = e.data_post,
            s = e.reply_post_id,
            l = e.post_id;
        let a = e.post_text,
            i = (function (e) {
                let t = "";
                for (let o = 0; o < e.length; o++)
                    e[o].m_url &&
                        ("image" == e[o].m_type
                            ? (t = `${t}\n${`\n                    <img src="${e[o].m_url}" onerror="mediaError(this);" class="bd-placeholder-img card-img-top" \n                        width="100%" height="100%" role="img" title="Фото" aria-label="Фото" \n                        style="margin-bottom:0.4em;border-radius:3px!important">`}`)
                            : "video" == e[o].m_type &&
                              (t = `${t}\n${`\n                    <video src="${e[o].m_url}" controls loop onerror="mediaError(this);" class="bd-placeholder-img card-img-top" \n                        width="100%" height="100%" title="Видео" aria-label="Видео" \n                        style="margin-bottom:0.4em;border-radius:3px!important"></video>`}`));
                return t;
            })(t),
            c = "block",
            d = "block",
            p = "block";
        a || (a = ""), s || (c = "none"), reply_enabled || (d = "none"), s && !reply_enabled && (p = "none");
        const _ = `\n            <div class="col post_style_set" id="post_${l}" style="display:${p}">\n                \x3c!-- reply_post_id: ${s}; reply_enabled: ${reply_enabled} --\x3e\n                <div class="card shadow-sm" style="transition:background-color 1s ease">\n                    ${i}\n                    <div class="card-body">\n                        <div id="post_reply_button_" style="display:${d}"> \n                            \x3c!-- reply_enabled: ${reply_enabled} --\x3e\n                            <a href="#post_${s}" class="scroll-to" style="display:${c}">\n                                ${reply_post_link_icon}\n                            </a>\n                        </div>\n                        <p class="card-text" style="margin-top:-0.8em">${a}</p>\n                        <div class="d-flex justify-content-between align-items-center">\n                            <small class="text-muted">\n                                <span class="post_views">${o}</span> | \n                                ${n} | \n                                <a href="https://t.me/${r}" target="_blank">В TG</a>\n                                <br/>by Elon Tusk\n                            </small>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        `;
        (last_post = l),
            console.log(`Result pattern: ${_}`),
            (a.length || i.length) &&
                (function (e) {
                    const t = [" pinned «", "Channel photo updated"];
                    for (let o = 0; o < t.length; o++) if (e.includes(t[o])) return !1;
                    return !0;
                })(a) &&
                $(".row-global-block").append(_);
    }
    function s(e = null) {
        !(function (e, t = null) {
            $.ajax({
                url: `https://api.zalupa.world/channel?before=${t}&choice=0`,
                type: "GET",
                success: function (t) {
                    t.success && t.body.length > 128
                        ? e(t.body.toString().replace(/\\n/g, "").replace(/\\"/g, '"').replace(/\\/g, ""))
                        : (console.log("Check error! (get_channel_html_data)"), notify("Ошибка проверки данных (get_channel_html_data)"));
                },
                error: function () {
                    console.log("Error get channel data!"), notify("Не удалось загрузить посты");
                },
            });
        })(function (e) {
            const t = $("<div></div>");
            t.html(e);
            const s = (function (e) {
                console.log(`Len els: ${e.length}`);
                let t = [];
                for (let s = 0; s < e.length; s++) {
                    console.log(e[s]);
                    try {
                        const l = $("<div></div>");
                        l.html(e[s]);
                        const a = $(".js-message_text", l).html(),
                            i = $(".tgme_widget_message_views", l).html(),
                            c = $(".tgme_widget_message", l).attr("data-post"),
                            d = parseInt(c.match(/\/\d+/g)[0].slice(1)),
                            p = o($(".time", l).attr("datetime")),
                            _ = $(".tgme_widget_message_reply", l);
                        var r = null;
                        _.html() && ((r = _.attr("href")), (r = parseInt(r.match(/\/\d+/g)[0].slice(1))), console.log(`Message ${d} is reply for message ${r}`));
                        const g = n(l);
                        t.push({ post_text: a, meta: { views: i, time: p }, media: { data: g }, data_post: c, post_id: d, reply_post_id: r });
                    } catch (e) {
                        console.log(e);
                    }
                }
                return t.reverse();
            })($(".tgme_widget_message_wrap", t));
            for (let e = 0; e < s.length; e++) console.log(s[e]), r(s[e]);
            (load_freeze = !1), (first_load = !0);
        }, (bef_ = e));
    }
    $("a.scroll-to").on("click", function (e) {
        e.preventDefault();
        var t = $(this).attr("href");
        console.log(t),
            $("html, body")
                .stop()
                .animate({ scrollTop: $(t).offset().top - 80 }, 800);
    }),
        $(window).scroll(function () {
            const e = window.pageYOffset,
                t = window.innerHeight,
                o = document.documentElement.scrollHeight;
            Math.max(o - (e + t), 0) < 450 && first_load && !load_freeze && last_post > 1 && ((load_freeze = !0), notify("Подгружаем посты..."), s(last_post));
        }),
        s(),
        t(),
        setInterval(t, 1e3),
        e(),
        setInterval(e, 1e4);
});

