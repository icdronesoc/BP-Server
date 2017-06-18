// Load environmental variables
require('dotenv').config({path: './config/.env'})

// Load Async Pkg
let async = require('async')

// Setup for express server
let app = require('express')()
let bodyParser = require('body-parser')
app.use(bodyParser.json())  

// Setup for AWS-SDK
let AWS = require('aws-sdk')
AWS.config.loadFromPath('./config/aws.json')

// Setup for DynamoDB
let docClient = new AWS.DynamoDB.DocumentClient()

// Firebase Setup for FCM
let admin = require("firebase-admin")
let firebaseConfig = require("./config/firebase.js")

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig.service_account),
  databaseURL: "https://british-pelican.firebaseio.com"
})

app.post('/echo', function(req, res) {
  let msg = req.body.message
  let CustomerId = req.body.customerId
  let table = 'status'

  console.log('Message: ', msg)
  console.log('Customer Id: ', CustomerId)

  async.waterfall([
    // Save to DynamoDB
    function(dbWriteCb) {
      let params = {
        TableName:table,
        Item:{
          CustomerId,
          Time: toString(new Date),
          msg
        }
      }
      docClient.put(params, function(err, data) {
        dbWriteCb(null)
      })
    },
    // Read latest waypoint from DynamoDB
    function(dbReadCb) {
      let params = {
        TableName: 'coordinates',
        Key:{
          "CustomerId": "drone1",
        }
      }
      docClient.get(params, function(err, data) {
        if (err) {
          dbReadCb(err)
        }
        else {
          console.log("data",data.Item)
          dbReadCb(null, data.Item)
        }
      })
    },
    // Push Latest msg and waypoint to phone via FCM
    function(item, FCMCb) {
      let payload = {
        notification: {
          title: msg,
          body: item.lat + item.lon
        }
      }
      let registrationToken = "crINtbOga1o:APA91bGgg3kCKAGvF-wAP4D2UDps4bJ6xdJmXrr90YifwDEgV8QulvHokANzyzynU6xwY5r1NvUbr7iqddRZBa8XzeeZAlCKnvhrwKYGdPqw39V4xq_vo3JpQ6s8-5UbxDdOJRhLtrAS"
      admin.messaging().sendToDevice(registrationToken, payload)
      .then(function(response) {
          // See the MessagingDevicesResponse reference documentation for
          // the contents of response.
          console.log("Successfully sent message:", response)
          FCMCb(null)
        })
      .catch(function(error) {
        FCMCb(error)
      })
    }],
    function (err, result) {
      if (err) {
        console.error(err)
        res.sendStatus(503)
      }
      else {
        console.log("All tasks completed.")
        res.sendStatus(200)
      }
    })
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
  }

  console.log("Adding a new coord(",lat,lon,")...")
  docClient.put(params, function(err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2))
      res.sendStatus(503)
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2))
      res.sendStatus(200)
    }
  })

})

app.listen(process.env.PORT || 3000, function(){
  console.log('running like a bauss on 3000')
})