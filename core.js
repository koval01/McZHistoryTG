function mediaError(e){return e.onerror="",e.src="",!0}$(document).ready(function(){function e(e){const t=Date.parse(e),n=(new Date).getTimezoneOffset(),o=60*Math.abs(n)*1e3+t;return new Date(o).toLocaleString()}function t(e){var t=[];function n(e,n){t.push({m_type:n,m_url:e})}try{n($(".tgme_widget_message_photo_wrap",e).css("background-image").replace(/url\(\"/g,"").replace(/\"\)/g,""),"image")}catch(e){console.log(`Images extract catch: ${e}`)}try{n($(".tgme_widget_message_video",e).attr("src"),"video")}catch(e){console.log(`Videos extract catch: ${e}`)}return console.log(t),t}function n(e){const t=e.media.data,n=e.meta.views,o=e.meta.time,a=e.data_post;let s=e.post_text;console.log(function(e){let t="";for(let n=0;n<e.length;n++)"image"==e[n].m_type?t=`${t}\n${`\n                <img src="${e[n].m_url}" onerror="mediaError(this);" class="bd-placeholder-img card-img-top" \n                    width="100%" height="225" role="img" title="Фото" aria-label="Фото">`}`:"video"==e[n].m_type&&(t=`${t}\n${`\n                <video src="${e[n].m_url}" onerror="mediaError(this);" class="bd-placeholder-img card-img-top" \n                    width="100%" height="225" role="img" title="Видео" aria-label="Видео"></video>`}`);return t}(t));s||(s="");const r=`\n            <div class="col" style="margin-bottom:0.7em">\n                <div class="card shadow-sm">\n                    \n                    <div class="card-body">\n                        <p class="card-text">${s}</p>\n                        <div class="d-flex justify-content-between align-items-center">\n                            <small class="text-muted">\n                                <span class="post_views">${n}</span> | \n                                ${o} | \n                                <a href="https://t.me/${a}" target="_blank">В TG</a> | \n                                by Elon Tusk\n                            </small>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        `;console.log(`Result pattern: ${r}`),$(".row-global-block").append(r)}!function(o=null){!function(e,t=null){$.ajax({url:`https://zlpnews.herokuapp.com/?before=${t}`,type:"GET",success:function(t){t.success?e(t.body.toString().replace(/\\n/g,"").replace(/\\"/g,'"').replace(/\\/g,"")):console.log("Check error! (get_channel_html_data)")},error:function(){console.log("Error get channel data!")}})}(function(o){const a=$("<div></div>");a.html(o);const s=function(n){console.log(`Len els: ${n.length}`);let o=[];for(let a=0;a<n.length;a++){console.log(n[a]);const s=$("<div></div>");s.html(n[a]);const r=$(".tgme_widget_message_text",s).html(),l=$(".tgme_widget_message_views",s).html(),c=$(".tgme_widget_message",s).attr("data-post"),i=e($(".time",s).attr("datetime")),g=t(s);o.push({post_text:r,meta:{views:l,time:i},media:{data:g},data_post:c})}return o.reverse()}($(".tgme_widget_message_wrap",a));for(let e=0;e<s.length;e++)console.log(s[e]),n(s[e])},bef_=o)}()});
