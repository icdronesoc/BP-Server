var AWS = require('aws-sdk')
AWS.config.loadFromPath('./config.json')

var docClient = new AWS.DynamoDB().DocumentClient();


let table = 'coordinates'
let lat = 51.498800
let lon = -0.174877

var params = {
    TableName:table,
    Item:{
        time: new Date,
        lat,
        lon
    }
};

console.log("Adding a new item...");
docClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
    }
});