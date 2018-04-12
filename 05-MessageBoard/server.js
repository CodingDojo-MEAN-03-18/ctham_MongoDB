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
mongoose.connect('mongodb://localhost/message_board');
mongoose.connection.on('connected', () => console.log('Connected to mongodb'));


// define Schema variable
var Schema = mongoose.Schema;

// define Post Schema
var PostSchema = new mongoose.Schema({
    name: {
        type: String, required: true, minlength: 4
    },
    text: {
        type: String, required: true 
    }, 
    comments: [{
        type: Schema.Types.ObjectId, 
        ref: 'Comment'
    }]
}, {
    timestamps: true 
});
// define Comment Schema
var CommentSchema = new mongoose.Schema({
    _post: {
        type: Schema.Types.ObjectId, 
        ref: 'Post'
    },
    name: {
        type: String, required: true, minlength: 4
    },
    text: {
        type: String, required: true 
    }, 
}, {
    timestamps: true 
});

// set our models by passing them their respective Schemas
mongoose.model('Post', PostSchema);
mongoose.model('Comment', CommentSchema);

// store our models in variables
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

app.get('/', function(req, res) {
    Post.find({})
        .populate('comments')
        .then( all_posts => {
            res.render('index', { all_posts });
        })
        .catch(err => {
            console.log('error', err);
        });
});

app.post('/message', function(req, res) {
    console.log("*** POST DATA @ /message");
    var msg = new Post(req.body);
    msg.save(function(err) {
        if (err) {
            console.log('error @ /message');
        } else { 
            console.log('successfully @ /message');
            console.log(req.body);
            res.redirect('/');
        }
    })
});

// route for creating one comment with the parent post id
app.post('/comment/:id', function (req, res){
    console.log("*** POST DATA @ /comment");
    Post.findOne({_id: req.params.id}, function(err, post){
        var comm = new Comment(req.body);
        comm._post = post._id;
        post.comments.push(comm);
        comm.save(function(err){
            post.save(function(err){
                if(err) { 
                    console.log('Error  @ /comment/:id');
                } else {
                    console.log('successfully @ /comment/:id');
                    res.redirect('/'); 
                };
            });
        });
   });
});

// route for getting a particular post and comments
// app.get('/posts/:id', function (req, res){
//     Post.findOne({_id: req.params.id})
//         .populate('comments')
//         .exec(function(err, post) {
//             res.render('post', {post: post});
//     });
// });

// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})
