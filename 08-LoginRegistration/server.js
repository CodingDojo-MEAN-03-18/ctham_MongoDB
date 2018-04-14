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
mongoose.connect('mongodb://localhost/users');
mongoose.connection.on('connected', () => console.log('Connected to mongodb @ users table'));

// define Schema variable
var Schema = mongoose.Schema;

// define Post Schema
var UserSchema = new mongoose.Schema({
    user_email: {
        type: String,
        required: [true, "Email address is required"],
        // trim: true,
        minlength: 8,
        maxlength: 32,
        unique: true,
    },
    // user_name: {
    //     first: {
    //         type: String,
    //         trim: true,
    //     }, last: {
    //         type: String,
    //         trim: true
    //     },
    // },
    user_namefirst: {
            type: String,
            required: [true, "First name is required"],
            // trim: true,
    },
    user_namelast: {
            type: String,
            required: [true, "Last name is required"],
            // trim: true,
    },
    user_password: {
        type: String,
        minlength: 8,
        maxlength: 32,
        required: [true, "Password is required"],
        // validate: {
        //     validator: function( value ) {
        //         return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,32}/.test( value );
        //     },
        //     message: "Password failed validation, you must have at least 1 number, uppercase and special character"
        // }
    },
    user_birthday: {
        type: Date,
        required: [true, "Date of birth is required"],
    },
}, { 
    timestamps: true
});

UserSchema.virtual( 'name.full' ).get( function () {
    return this.name.first + " " + this.name.last;
    // return `${ this.name.first } ${ this.name.last}`;
});

// set our models by passing them their respective Schemas
mongoose.model('User', UserSchema);
var User = mongoose.model('User');

// set session
var session = require('express-session');
app.use(session({
    secret: "login-registration",
    resave: true,
    saveUninitialized: false,
}));


// Routes

app.get('/', function(req, res) {
    console.log("*** GET @ /");
    res.render('index');
});

app.post('/registration', function(req, res) {
    console.log("*** POST @ /registration");
    if (req.body.form_password == req.body.form_password_confirm) {
        var usr = new User({
            user_email: req.body.form_email,
            user_namefirst: req.body.form_namefirst,
            user_namelast: req.body.form_namelast,
            user_password: req.body.form_password,
            user_birthday: req.body.form_birthday,
        });
        usr.save(function(err) {
            if (err) {
                console.log('error @ /registration');
                // console.log(err);
                // console.log(JSON.stringify(err, ["message"]));
                res.render('index', { errors: err.message });
            } else { 
                console.log('successfully @ /registration');
                req.session.ID = usr._id;
                console.log(req.session.ID);
                console.log(usr);
                res.redirect('/dashboard');
            }
        })
    } else {
        res.render('index', { errors: 'Both password does not match!' });
    }
});

app.get('/dashboard', function(req, res) {
    console.log("*** GET @ /dashboard");
    if (req.session.ID) {
        User.find({})
            .then( all_users => {
                console.log(all_users);
                res.render('dashboard', { all_users });
            })
            .catch(err => {
                console.log('error', err);
                console.log(JSON.stringify(err, ["message"]));
            });
    } else {
        console.log('Not login!');
        res.redirect('/');
    }
});

app.post('/login', function(req, res) {
    console.log("*** POST @ /login");
    console.log(req.body);
    if (req.body.log_email || req.body.login_password) {
        // User.findOne({user_email:"mary@king.com"})
        var tmp=req.body.log_email;
        User.findOne({user_email: req.body.log_email})
        .then( login_user => {
            console.log(login_user);
            if (login_user != null) {
                User.find({})
                .then( all_users => {
                    console.log(all_users);
                    res.render('dashboard', { all_users });
                })
                .catch(err => {
                    console.log('error', err);
                    // console.log(JSON.stringify(err, ["message"]));
                });
            } else {
                console.log('Email not found! (1)');
                res.render('index', { errors: 'Please enter correct email! (1)' });
            };
        })
        .catch(err => {
            console.log('Email not found! (2)');
            res.render('index', { errors: 'Please enter correct email! (2)' });
        });
    } else {
        console.log('Not email or password!');
        res.render('index', { errors: 'Please enter email and password!' });
    }
});

app.get('/logoff', function(req, res) {
    console.log("*** GET @ /logoff");
    if (req.session.ID) {
        req.session.destroy();
        res.redirect('/');
    } else {
        console.log('Not login!');
        res.redirect('/');
    }
});

// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})
