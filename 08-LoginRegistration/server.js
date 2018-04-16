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

// define bcrypt
var bcrypt = require('bcrypt-as-promised');

// define Post Schema
var UserSchema = new mongoose.Schema({
    user_email: {
        type: String,
        required: [true, "Email address is required"],
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
    },
    user_namelast: {
            type: String,
            required: [true, "Last name is required"],
    },
    user_password: {
        type: String,
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

// UserSchema.virtual( 'name.full' ).get( function () {
//     return this.name.first + " " + this.name.last;
//     // return `${ this.name.first } ${ this.name.last}`;
// });

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
        bcrypt.hash(req.body.form_password, 10)
        .then( hashed_form_password => {
            var usr = new User({
                user_email: req.body.form_email,
                user_namefirst: req.body.form_namefirst,
                user_namelast: req.body.form_namelast,
                // user_password: req.body.form_password,
                user_password: hashed_form_password,
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
                    req.session.Name = usr.user_namefirst;
                    console.log(req.session.ID, req.session.Name );
                    console.log(usr);
                    res.redirect('/dashboard');
                }
            })
        })
        .catch( hashed_error => {
            res.render('index', { errors: 'Hashing password error!' });
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
                res.render('dashboard', { ID: req.session.ID, name: req.session.Name, all_users });
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
    User.findOne({user_email: req.body.login_email})
    .then( resOne => {
        if (resOne) {
            console.log(resOne.user_namefirst);
            console.log(req.body.login_password, resOne.user_password);
            bcrypt.compare(req.body.login_password, resOne.user_password)
            .then( hashReq => {
                req.session.ID = resOne._id;
                req.session.Name = resOne.user_namefirst;
                res.redirect('/dashboard');
            })
            .catch( hashErr => {
                res.render('index', { errors: 'Please enter valid email and password! Code:3' });
            })
        } else {
            res.render('index', { errors: 'Please enter valid email and password! Code:2' });
        }
    })
    .catch ( errOne => {
        console.log('errOne', errOne);
        console.log(JSON.stringify(errOne, ["message"]));
        res.render('index', { errors: 'Please enter valid email and password! Code:1' })
    });
});

app.get('/delete/:id', function(req, res) {
    console.log("*** POST @ /delete/:id");
    if (req.session.ID) {
        User.remove({_id: req.params.id })
        .then( remOk => {
            res.redirect('/dashboard',  { errors: 'Succesfull removed the record!' });
        })
        .catch( remErr => {
            res.redirect('/dashboard', { errors: 'Error removing the record!' });
        })
        res.redirect('/dashboard');
    } else {
        console.log('Not login!');
        res.redirect('/');
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
