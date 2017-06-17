// Load environmental variables
require('dotenv').config({path: 'config/.env'})

// Setup for express server
let app = require('express')()
let bodyParser = require('body-parser')
app.use(bodyParser.json())  

// Setup for AWS-SDK
let AWS = require('aws-sdk')
AWS.config.loadFromPath('config/aws.json')

// Setup for DynamoDB
let docClient = new AWS.DynamoDB.DocumentClient();

let table = 'coordinates'
let CustomerId = 'drone1'
let lat = 51.498800
let lon = -0.174877

var params = {
  TableName:table,
  Item:{
    CustomerId,
    Time: toString(new Date),
    lat,
    lon
  }
};

app.post('/echo', function(req, res) {
  console.log('Message: ', req.body.message)
  console.log('Customer Id: ', req.body.customerId)
  res.sendStatus(200)
})

app.post('/coord', function(req, res) {
  console.log('Lat: ', req.body.lat)
  console.log('Lon: ', req.body.lon)
  res.sendStatus(200)
})

app.listen(process.env.PORT || 3000, function(){
  console.log('running like a bauss on 3000');
});