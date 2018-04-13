// Require the Express Module
var express = require('express');
// Create an Express App
var app = express();
// Require body-parser (to receive post data from clients)

var bodyParser = require('body-parser');
// Integrate body-parser with our App
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 

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
mongoose.connect('mongodb://localhost/1955api');
mongoose.connection.on('connected', () => console.log('Connected to mongodb'));


// define Schema variable
var Schema = mongoose.Schema;

// define Post Schema
var PostSchema = new mongoose.Schema({
    name: {
        type: String, required: true, minlength: 4
    },
}, {
    timestamps: true 
});


// set our models by passing them their respective Schemas
mongoose.model('Post', PostSchema);

// store our models in variables
var Post = mongoose.model('Post');

app.get('/', function(req, res) {
    Post.find({})
        .then( all_posts => {
            // res.json( all_posts );
            res.render('index', { all_posts });
        })
        .catch(err => {
            console.log('error', err);
        });
});

app.get('/new/:name', function(req, res) {
    console.log('*** new @ ', req.params.name);
    Post.create({ name: req.params.name })
        .then( all_posts => {
            console.log(all_posts);
            res.redirect('/');
        })
        .catch(err => {
            console.log('error', err);
        });
});

app.get('/remove/:name', function(req, res) {
    console.log('*** remove @ ', req.params.name);
    Post.remove({ name: req.params.name })
        .then( all_posts => {
            console.log(all_posts);
            res.redirect('/');
        })
        .catch(err => {
            console.log('error', err);
        });
});


app.get('/:name', function(req, res) {
    console.log('*** / @ ', req.params.name);
    Post.find({ name: req.params.name })
        .then( all_posts => {
            console.log(all_posts);
            // res.json(all_posts);
            res.render('index', { all_posts });
            // res.redirect('/');
        })
        .catch(err => {
            console.log('error', err);
        });
});

// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})
