var mongoose = require('mongoose');
var dbUrl = 'mongodb://localhost/myPicsArt';
var con = mongoose.createConnection(dbUrl);


var mySchema = mongoose.Schema;

var userSchema = new mySchema({
    id: Number,
    name: {type: String, index: true},
    sname: String,
    email: String,
    username: String,
    password: String,
    profPhoto: String,
    followers: [Number],
    followings: [Number],
    photos: [{
        data: Buffer, contentType: String, title: String, id: Number,
        tags: [String],
        comments: [{body: String, id: Number, auther: Number, date: {type: Date, default: Date.now}}]
    }]
});

var users = con.model('users', userSchema);

module.exports.users = users;

