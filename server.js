var express = require('express')
var mongoose = require('mongoose')
MONGO_URI = "mongodb+srv://trily:aiai@cluster0.vvdsu.mongodb.net/Exercise_Tracker?retryWrites=true&w=majority"
mongoose.connect(MONGO_URI || "mongodb://localhost/trily")
mongoose.connection.on("connected", () => {
  console.log("Mongoose is connected")
})

var app = express()

const Schema = mongoose.Schema
const usernameSchema = new Schema({
  username: String,
  count: { type: Number },
  log: [
    {
      description: { type: String },
      duration: { type: Number },
      date: { type: String, required: false }
    }
  ]
})

const username = mongoose.model("username", usernameSchema)

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors')
app.use(cors({ optionsSuccessStatus: 200 })) // some legacy browsers choke on 204

// This is a body-parser that parse the body from post/fetch request EXCEPT from HTML post form
app.use(express.json())
// This is a body parser for html post form
app.use(express.urlencoded({ extended: false }))

// app.use(express.static('public'))

app.get("/", function (req, res) {
  console.log("test GET method at / - working")
  res.sendFile(__dirname + '/public/index.html')
})

app.post('/api/users', async (req, res) => {

  console.log(req.body)
  let body_username = req.body.username
  console.log("username:", body_username)

  // create a model ready to save to mongoDB
  var username_model = new username({
    "username": body_username,
    "count": 0
  })

  // save to mongoDB database
  username_model.save(function (err, data) {
    if (err) return console.error(err);
    // done(null, data)
  })
  return res.json(username_model)
})

app.post('/api/users/:_id/exercises', async (req, res) => {

  let user_id = req.body._id || req.params._id
  let query = { _id: user_id }

  // var regex = new RegExp("(\d{4})\-(\d{2})\-(\d{4})")

  var regex = /^\d{4}[-]\d{2}[-]\d{2}$/
  dateST = req.body.date
  console.log(regex.test(dateST))

  if (regex.test(dateST)) {
    console.log("correct date format")
    date = new Date(dateST)
  }
  else {
    console.log("incorrect date format")
    date = new Date()
  }

  const exObj = { 
    description: req.body.description,
    duration: req.body.duration,
    date: date
  }

  username.findOneAndUpdate(query, { $inc: { count: 1 } , $push: { log: exObj } }, {new: true} , (err, result) => {
    if (err) return err
    res.send(result)
  })

})

app.get("/api/users", function (req, res) {

  username.find({}, function (err, result) {
    if (err) throw err;
    if (result) {
      res.send(result)

    }
    else {
      res.send(JSON.stringify({
        error: 'Error'
      }))
    }
  })
})

app.get("/api/users/:_id/logs", function (req, res) {

  console.log(req.params._id)
  console.log(req.query.from)
  console.log(req.query.to)
  console.log(req.query.limit)

  let _id = req.params._id
  let from = req.query.from
  let to = req.query.to
  let limit = req.query.limit

  username.findOne({_id: req.params._id}, function (err, result) {
    if (err) res.send("invalid _id");
    if (result) {

      let log = result.log
      
      if (from) {
        const fromDate = new Date(from);
        log = log.filter(exe => new Date(exe.date) > fromDate) 
      }
      
      if (to) {
        const toDate = new Date(to);
        log = log.filter(exe => new Date(exe.date) < toDate)
      }
      
      if (limit) {
        log = log.slice(0, limit)
      }             

    console.log(log)  
    res.send(log)
    
  }
  })
  
})

var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port)
})
