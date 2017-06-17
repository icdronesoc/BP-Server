let app = require('express')()
let bodyParser = require('body-parser')
app.use(bodyParser.json())  

let AWS = require('aws-sdk')
AWS.config.loadFromPath('./config.json')

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
  console.log(req.body.message)
  res.sendStatus(200)
})

app.listen(process.env.PORT || 3000, function(){
  console.log('running like a bauss on 3000');
});