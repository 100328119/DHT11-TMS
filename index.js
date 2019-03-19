const awsIot = require('aws-iot-device-sdk');
const express = require('express');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars').create({defaultLayout:'main'});
const app = express();

app.set('port', process.env.PORT || 4000);
var server = app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' +
  app.get('port') + '; press Ctrl-C to terminate');
})
const io = require('socket.io').listen(server);
const cors = require('cors');
//
// Replace the values of '<YourUniqueClientIdentifier>' and '<YourCustomEndpoint>'
// with a unique client identifier and custom host endpoint provided in AWS IoT.
// NOTE: client identifiers must be unique within your AWS account; if a client attempts
// to connect with a client identifier which is already in use, the existing
// connection will be terminated.
//
const device = awsIot.device({
   keyPath: '/Users/kunhuang/KPU/INFO 4381 Internet of Thing Apps/IoT Project/cc9ebcc769-private.pem.key',
  certPath: '/Users/kunhuang/KPU/INFO 4381 Internet of Thing Apps/IoT Project/cc9ebcc769-certificate.pem.crt',
    caPath: '/Users/kunhuang/KPU/INFO 4381 Internet of Thing Apps/IoT Project/CA.pem',
  clientId: 'TemperatureMonitor',
      host: 'a39keex8gmhhx-ats.iot.us-west-2.amazonaws.com'
});

//handlebars front end framework
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//frontend middleware
app.use(express.static(__dirname + '/public'));
app.use(cors());

app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.render('index')
})

//api link
app.post('/control', (req, res, nex)=>{
  device.publish('DHT11/control', req.body.message);
  return res.status(200).json(req.body);
})


// test setInterval
let count = 1370044800;

setInterval(function(){
  var currentTime = parseInt(new Date().getTime() / 1000);
  let temp = Math.floor(Math.random() * 100) + 1;
  let hum = Math.floor(Math.random() * 100) + 1;
  io.sockets.emit('new_message', {time: currentTime, temp: temp, hum:hum})
}, 1500);
//
// Device is an instance returned by mqtt.Client(), see mqtt.js for full
// documentation.
//
device
  .on('connect', function() {
    console.log('connect');
    device.subscribe('DHT11/info');
    device.subscribe('DHT11/control');
  });

device
  .on('message', function(topic, payload) {
    console.log("topic",topic);
    console.log("mqtt patload",payload.toString());
    // io.sockets.emit('new_message', {message : payload.toString()})
    //if or switch case to route topics 
  });

io.on('connection', (socket)=>{
  console.log("user connected");

   socket.on('control_message', (data) => {
        //broadcast the new message
        device.publish('DHT11/control', data.message);
    })
});
