// Require the Express Module
var express = require('express');
// Create an Express App
var app = express();
// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));
// Require path
var path = require('path');
// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');


// Setting our Mongoose
var mongoose = require('mongoose');
// This is how we connect to the mongodb database using mongoose -- "quoting_dojo" is the name of
//   our db in mongodb -- this should match the name of the db you are going to use for your project.
mongoose.connect('mongodb://localhost/quoting_dojo');

// Setting our Mongoose Schemas
var QuoteSchema = new mongoose.Schema({
    quote_name : {
        type: String,
        required: true,
    },
    quote_msg : {
        type: String,
        required: true,
    }
}, { 
    timestamps: true 
})

// We are setting this Schema in our Models as 'Quote'
mongoose.model('Quote', QuoteSchema);
// We are retrieving this Schema from our Models, named 'Quote'
var Quote = mongoose.model('Quote')

// Use native promises
// mongoose.Promise = global.Promise;

// Routes

app.get('/', function(req, res) {
    // This is where we will retrieve the records from the database and include them in the view page we will be rendering.
    res.render('index');
})

app.get('/get_quote', function(req, res) {
    console.log("GET DATA");
    Quote.find({}, function(err, all_quotes) {
      // This is the method that finds all of the records from the database
      // Notice how the first parameter is the options for what to find and the second is the
      //   callback function that has an error (if any) and all of the records
      // Keep in mind that everything you want to do AFTER you get the records from the database must
      //   happen inside of this callback for it to be synchronous 
      // Make sure you handle the case when there is an error, as well as the case when there is no error
        if (err){
            console.log('something went wrong @ GET quote');
        } else {
            console.log('successfully list all data in the DB: ');
            console.log(all_quotes);
            res.render('quotes', { all_quotes });
        }
    })
})

app.post('/form_quote', function(req, res) {
    console.log("POST DATA");
    console.log(req.body);
    // create a new User with the name and age corresponding to those from req.body
    var qq = new Quote(req.body);
    // Try to save that new user to the database (this is the method that actually inserts into the db) and run a callback function with an error (if any) from the operation.
    qq.save(function(err) {
      // if there is an error console.log that something went wrong!
      if(err) {
        console.log('something went wrong @ POST quote');
        res.redirect('/');
      } else { // else console.log that we did well and then redirect to the root route
        console.log('successfully added a record!');
        res.redirect('/get_quote');
      }
    })
  })



// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})
