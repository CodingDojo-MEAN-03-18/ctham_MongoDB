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
mongoose.connect('mongodb://localhost/restfulTaskAPI');
mongoose.connection.on('connected', () => console.log('Connected to mongodb'));


// define Schema variable
var Schema = mongoose.Schema;

// define Post Schema
var TaskSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true,
    },
    description: {
        type: String, 
        default: '',
    },
    completed: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true 
});


// set our models by passing them their respective Schemas
mongoose.model('Task', TaskSchema);

// store our models in variables
var Task = mongoose.model('Task');

app.get('/tasks', function(req, res) {
    // console.log('*** retrieve all task @ /tasks');
    Task.find({})
        .then( all_tasks => {
            res.json({
                message: "retrieve all task successful.",
                data: all_tasks 
            });
            // res.render('index', { all_tasks });
        })
        .catch(err => {
            console.log('error', err);
        });
});

app.get('/tasks/:id', function(req, res) {
    // console.log('*** retrieve a task by ID @ /tasks/:id', req.params.id);
    Task.findOne({ _id: req.params.id })
        .then( all_tasks => {
            // console.log(all_tasks);
            res.json({
                message: "retrieve a task successful.",
                data: all_tasks 
            });
            // res.redirect('/');
        })
        .catch(err => {
            console.log('error', err);
        });
});

app.post('/tasks', function(req, res) {
    // console.log('*** create a task @ /tasks/:id');
    Task.create(req.body)
        .then( all_tasks => {
            // console.log(all_tasks);
            res.json({
                message: "created a task successful.",
                data: all_tasks 
            });
            // res.redirect('/');
        })
        .catch(err => {
            console.log('error', err);
        });
});

app.put('/tasks/:id', function(req, res) {
    // console.log('*** update a task by ID @ /tasks/:id', req.params.id);
    Task.update({ _id: req.params.id }, 
            { 
                title: req.body.title,
                description: req.body.description,
                completed: req.body.completed,
             }, 
            { upsert: true },
        )
        .then( all_tasks => {
            // console.log(all_tasks);
            res.json({
                message: "update a task successful.",
                data: all_tasks 
            });
            // res.redirect('/');
        })
        .catch(err => {
            console.log('error', err);
        });
});

app.delete('/tasks/:id', function(req, res) {
    // console.log('*** delete a task by ID @ /tasks/:id', req.params.id);
    Task.remove({ _id: req.params.id })
        .then( all_tasks => {
            // console.log(all_tasks);
            res.json({
                message: "delete a task successful.",
                data: all_tasks 
            });
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
