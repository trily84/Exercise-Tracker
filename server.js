var express = require('express')
var mongoose = require('mongoose')
MONGO_URI = "mongodb+srv://trily:aiai@cluster0.vvdsu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
mongoose.connect(MONGO_URI || "mongodb://localhost/trily")
mongoose.connection.on("connected", () => {
  console.log("Mongoose is connected")
})
var TinyURL = require('tinyurl')
var dns = require('dns');
var app = express()

const Schema = mongoose.Schema
const urlSchema = new Schema({
  original_url: String,
  short_url: String,
  id: Number
})
const url = mongoose.model("url", urlSchema)

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors')
app.use(cors({ optionsSuccessStatus: 200 })) // some legacy browsers choke on 204

// This is a body-parser that parse the body from post/fetch request EXCEPT from HTML post form
app.use(express.json())
// This is a body parser for html post form
app.use(express.urlencoded({ extended: false }))

app.use(express.static('public'))

// create an array to store url from post request
// let linkArray = []
let id = 0

app.get("/", function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.post('/api/shorturl', async (req, res) => {

  console.log(req.body)
  let original_url = req.body.url
  console.log("original_url:", original_url)

  var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");

  if (regex.test(original_url)) {
    async function storeURL() {
      let short_url = await TinyURL.shorten(original_url);
      console.log("short_url:", short_url)
      id++

      // create a model ready to save to mongoDB
      var link = new url({
        original_url,
        short_url,
        id
      })

      // save to mongoDB database
      link.save(function (err, data) {
        if (err) return console.error(err);
        // done(null, data)
      })
      return res.json(link)
    }
    (storeURL())
  }
  else {
    return res.json({ error: "invalid URL" })
  }

  // let urlNoHTTP = original_url.replace(/^https?:\/\//, "")
  // console.log("urlNoHTTP:", urlNoHTTP)

  // dns.lookup(urlNoHTTP, (err, address, family) => {
  // console.log("error:", err)
  // console.log("address:", address)
  // console.log("family:", family)

  // if (err) {
  //   console.log("err:", err)
  //   return res.json({error: "invalid URL"})
  // }

  // else {
  //   async function storeURL() {
  //   let short_url = await TinyURL.shorten(original_url);
  //   console.log("short_url:", short_url)
  //   id ++

  //   // create a model ready to save to mongoDB
  //   var link = new url({
  //     original_url,
  //     short_url,
  //     id
  //   })  

  //   // save to mongoDB database
  //   link.save(function(err, data) {
  //     if (err) return console.error(err);
  //     // done(null, data)
  //   })
  //   return res.json(link)  
  //   }
  //   (storeURL())
  // }
  // })

})

app.get("/api/shorturl/:id", function (req, res) {
  let id = req.params.id

  url.findOne({ id }, function (err, result) {
    if (err) throw err;
    if (result) {
      // res.send(result)
      res.redirect(result.short_url)

    }
    else {
      res.send(JSON.stringify({
        error: 'Error'
      }))
    }
  })

})

var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port)
})
