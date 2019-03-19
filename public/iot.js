
$(function(){

  var nextTime = (function() {
      var currentTime = parseInt(new Date().getTime() / 1000);
      return function() { return currentTime++; }
  })();
//make connection
var socket = io.connect('http://localhost:4000')

var lineChartData = [
  {
   label: "Series 1",
   values: []
 },
 // The second series
 {
   label: "Series 2",
   values: []
 }
];

var Range = [0, 100];

// $('#lineChart').epoch({
//     type: 'time.line',
//     data: lineChartData
//   });

var lineChart = $('#lineChart').epoch({
    type: 'time.line',
    data: lineChartData,
    axes: ['left', 'right', 'bottom']
  });

var hum_chart = $('#test-3 .epoch').epoch({
                type: 'time.gauge',
                value: 0.0
            });

var temp_chart = $('#temp_gauge .epoch').epoch({
            type: 'time.gauge',
            value: 0.0
          });
//buttons and inputs
var message = $("#message")
var username = $("#username")
var send_message = $("#send_message")
var send_username = $("#send_username")
var chatroom = $("#chatroom")
var feedback = $("#feedback")


socket.on('new_message',(data)=>{
  var time = nextTime();
  data.time = time;
  // console.log(data);
  // lineChartData[0].values.push(data);
  // console.log(data);
  lineChart.push([{time:data.time,y:data.temp},{time:data.time,y:data.hum}]);
  hum_chart.update(data.hum/100);
  temp_chart.update(data.temp/100);
  // console.log(lineChart);
})

// lineChart.push(lineChartData);
var defaultValue = 0;
var pre_value = defaultValue
//slider control
$("#ex6").slider({step: 1, min: 0, max: 10, value: defaultValue});
$("#ex6").on("change", function(slideEvt) {
  var newValue = slideEvt.value.newValue;
  var oldValue = slideEvt.value.oldValue;
  if(newValue > oldValue){
    var steps = newValue - oldValue;
    var control_message = {
      message: "r"+steps
    };
    pre_value = slideEvt.value;
    $.ajax({
      type: "POST",
      url: "/control",
      data: JSON.stringify(control_message),
      contentType: "application/json; charset=utf-8",
      dataType: "json"
    }).then(response=>{
      console.log(response)
    });
  }else{
    var steps = oldValue - newValue;
    var control_message = {
      message: "l"+steps
    };
    pre_value = slideEvt.value;
    $.ajax({
      type: "POST",
      url: "/control",
      data: JSON.stringify(control_message),
      contentType: "application/json; charset=utf-8",
      dataType: "json"
    }).then(response=>{
      console.log(response)
    });
  }
	$("#ex6SliderVal").text(slideEvt.value.newValue);
});



//Listen on new_message
// socket.on("new_message", (data) => {
// feedback.html('');
// message.val('');
// chatroom.append("<p class='message'>" +data.message + "</p>")
// })


//Emit a username
send_username.click(function(){
socket.emit('change_username', {username : username.val()})
})

//Emit typing
message.bind("keypress", () => {
socket.emit('typing')
})

//Listen on typing
socket.on('typing', (data) => {
feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
})

});
