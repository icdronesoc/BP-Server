// Load Async Pkg
let async = require('async')

// Setup for AWS-SDK
let AWS = require('aws-sdk')
AWS.config.loadFromPath('config/aws.json')

// Setup for DynamoDB
let docClient = new AWS.DynamoDB.DocumentClient()

// Firebase Setup for FCM
let admin = require("firebase-admin")
let firebaseConfig = require('../config/firebase.js')

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig.service_account),
  databaseURL: "https://british-pelican.firebaseio.com"
})

module.exports = exports = function(req, res) {
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
        if (err) {
          res.sendStatus(503)
          dbWriteCb(err)
        }
        else {
          dbWriteCb(null)
        }
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
          res.sendStatus(503)
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
      let acceptedMsgs = ["TestIntent", "TakeOffIntent", "LandIntent", "GoHomeIntent", "SingIntent"]
      if (acceptedMsgs.find(i => i === msg) != undefined) {
        let payload = {
          data: {
            msg,
            lat: item.lat,
            lon: item.lon
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
          res.sendStatus(503)
          FCMCb(error)
        })
      }
      else {
        res.sendStatus(404)
        FCMCb("Invalid Message")
      }
    }],
    function (err, result) {
      if (err) {
        console.error(err)
      }
      else {
        console.log("All tasks completed.")
        res.sendStatus(200)
      }
    })
}