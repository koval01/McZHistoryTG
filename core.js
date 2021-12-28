$(document).ready(function() {
  function get_channel_html_data(callback, bef_ = null) {
    $.ajax({
        url: `https://zlpnews.herokuapp.com/?before=${bef_}`,
        type: "GET",
        success: function(o) {
            if (o["success"]) {
                callback(o["body"].replace("\\", "").replace("\n", ""))
            } else {
                console.log("Check error! (get_channel_html_data)")
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
