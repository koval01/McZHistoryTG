$(document).ready(function() {
  function get_channel_html_data(callback, bef_ = null) {
    $.ajax({
        url: `https://t.me/s/zalupa_history?before=${bef_}`,
        type: "POST",
        crossDomain: true,
        dataType: 'jsonp',
        headers: {
          "Origin": "https://t.me",
          "Referer": "https://t.me/s/zalupa_history",
          "Host": "t.me",
        },
        success: function(o) {
            if (o.length != 0) {
                callback(o)
            } else {
                console.log("Len check error! (get_channel_html_data)")
            }
        },
        error: function() {
            console.log("Error get channel data!")
        }
    })
  }
  
  // test
  get_channel_html_data(function(data) {console.log(data)})
})
