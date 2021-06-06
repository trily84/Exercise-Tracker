var express = require('express')
var app = express()

const requestIp = require('request-ip');
 
// inside middleware handler
const ipMiddleware = function(req, res, next) {
    const clientIp = requestIp.getClientIp(req); 
    next();
};
//As Connect Middleware
app.use(requestIp.mw())

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors')
app.use(cors({optionsSuccessStatus: 200})) // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'))

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.get('/api/:whoami', (req, res) => {
    const ipaddress = req.clientIp
    const language = req.acceptsLanguages()
    const software = req.get("User-Agent")
    res.json({
        ipaddress: ipaddress,
        language: language[0],
        software: software,
    })
})

var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port)
})