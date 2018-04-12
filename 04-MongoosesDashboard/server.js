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
mongoose.connect('mongodb://localhost/pet');
mongoose.connection.on('connected', () => console.log('Connected to mongodb'));

// Setting our Mongoose Schemas
var PetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    }
}, {
        timestamps: true
    }
);

mongoose.model('Pet', PetSchema);
var Pet = mongoose.model('Pet')

// Use native promises
mongoose.Promise = global.Promise;

// Routes
app.get('/', function(req, res) {
    console.log("*** GET DATA @ /");
    Pet.find({}, function(err, all_pets) {
        if (err) {
            console.log('error @ /');
        } else {
            console.log('successfully @ /');
            console.log(all_pets);
            res.render('index', { all_pets });
        }
    })
});

app.get('/pets/new', function(req, res) {
    console.log("*** GET DATA @ /pets/new");
    res.render('new');
});

app.get('/pets/:id', function(req, res) {
    console.log("*** GET DATA @ /pets/:id");
    console.log('ID:',req.params.id);
    Pet.findOne({ _id: req.params.id }, function(err, mypet) {
        if (err) {
            console.log('error @ /pets/:id');
        } else {
            console.log('successfully @ /pets/:id');
            console.log(mypet);
            res.render('showOne', { mypet });
        }
    })
    // Pet.findOne({ _id: req.params.id })
    //     .then( mypet => {
    //         console.log('successfully @ /pets/:id');
    //         console.log(mypet);
    //         res.render('showOne', { mypet });
    //     })
    //     .catch(err => {
    //         console.log('error @ /pets/:id', err);
    //     });
});

app.post('/pets', function(req, res) {
    console.log("*** POST DATA");
    var pet = new Pet(req.body);
    pet.save(function(err) {
        if (err) {
            console.log('error @ /pets', err);
        } else { 
            console.log('successfully @ /pets');
            console.log(req.body);
            res.redirect('/');
        }
    })
});

app.get('/pets/destroy/:id', function(req, res) {
    console.log("*** GET DATA @ /pets/destroy/:id");
    console.log('ID:',req.params.id);
    Pet.remove({ _id: req.params.id }, function(err, mypet) {
        if (err) {
            console.log('error @ /pets/destroy/:id', err);
        } else {
            console.log('successfully @ /pets/destroy/:id');
            console.log(mypet);
        }
        res.redirect('/');
    })
});

app.get('/pets/edit/:id', function(req, res) {
    console.log("*** GET DATA @ /pets/edit/:id");
    console.log('ID:',req.params.id);
    Pet.findOne({ _id: req.params.id }, function(err, mypet) {
        if (err) {
            console.log('error @ /pets/edit/:id', err);
        } else {
            console.log('successfully @ /pets/edit/:id');
            console.log(mypet);
            res.render('edit', { mypet });
        }
    })
});

app.post('/pets/:id', function(req, res) {
    console.log("*** POST DATA @ /pets/:id");
    console.log('ID:',req.params.id);
    console.log('Data:',req.body);
    Pet.update({ _id: req.params.id }, 
        {  name: req.body.name, age: req.body.age }, 
        {upsert: true}, function(err, mypet) {
        // mypet.name = req.body.name;
        // mypet.age = req.body.age;
        if (err) {
            console.log('error @ /pets/:id', err);
        } else {
            console.log('successfully @ /pets:id');
            console.log(mypet);
            res.redirect('/');
        }
    })
});

// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})
