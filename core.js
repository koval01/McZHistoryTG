$(document).ready(function() {
  function get_channel_html_data(callback, bef_ = null) {
    $.ajax({
        url: `https://t.me/s/zalupa_history?before=${bef_}`,
        type: "POST",
        headers: {
          "Origin": "https://t.me",
          "Referer": "https://t.me/s/zalupa_history",
          "Host": "t.me",
        },
        success: function(o) {
            if (o.length != 0) {
                callback(o)
            } else {
                console.log("Error get channel data!")
            }
        },
        error: function() {
            console.log("Error! Failed to query Telegram API and get channel information.")
        }
    })
  }
})
