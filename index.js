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

app.post('/echo', function(req, res) {
  console.log('Message: ', req.body.message)
  console.log('Customer Id: ', req.body.customerId)
  res.sendStatus(200)
})

app.post('/coord', function(req, res) {
  let lat = req.body.lat
  let lon = req.body.lon
  let table = 'coordinates'
  let CustomerId = 'drone1'

  var params = {
    TableName:table,
    Item:{
      CustomerId,
      Time: toString(new Date),
      lat,
      lon
    }
  };

  console.log("Adding a new coord(",lat,lon,")...");
  docClient.put(params, function(err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
    }
  })

  res.sendStatus(200)
})

app.listen(process.env.PORT || 3000, function(){
  console.log('running like a bauss on 3000');
});