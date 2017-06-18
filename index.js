// Load environmental variables
require('dotenv').config({path: './config/.env'})

// Setup for express server
let express = require('express')
let app = express()
let bodyParser = require('body-parser')
app.use(bodyParser.json())

// API Routes
var router = express.Router();

router.route('/echo').post(require('./endpoints/echo.js'));
router.route('/coord').post(require('./endpoints/coord.js'));

app.use('/', router);

app.listen(process.env.PORT || 3000, function(){
  console.log('running like a bauss on 3000')
})