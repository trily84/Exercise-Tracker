var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/api/:datestring?', (req, res) => {
    let datestring = req.params.datestring
    let date
    console.log("hello")

    // if datestring is empty
    if (!datestring) {
        date = new Date()
    }
    // if datestring is not empty
    else {
        // if datestring is a number string
        if (!isNaN(datestring)) {
            // convert it to interger
            datestring = parseInt(datestring)
            date = new Date(datestring)
            // res.json({datestring: datestring, typeofdatestring: typeof(datestring), date: typeof(date)})
        }
        // if datestring is a string like 2020-01-01
        else {
            date = new Date(datestring)
            // res.json({datestring: datestring, typeofdatestring: typeof(datestring), date: typeof(date)})
        }
    }     

    // determine if date is a string or an integer 
    if (date.toString() === "Invalid Date") {
        res.json({error: date.toString()})
    }
    else {
        res.json({Unix: date.getTime(), UTC: date.toUTCString()})
    }
})

var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

// create environment variable to listen to dynamic hosting port
// const port = process.env.PORT || 3000
// app.listen(port, () => console.log("Listening on port " + port + "..."))