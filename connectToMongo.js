
var mongoose = require('mongoose');
var dbUrl='mongodb://localhost/myPicsArt';
var con = mongoose.createConnection(dbUrl);


var mySchema=mongoose.Schema;

var userSchema=new mySchema({
    id: Number,
    name: {type: String, index: true},
    sname: String,
    email: String,
    password: String,
    profPhoto: String,
    followers: [Number],
    followings:[Number],
    photos: [{ data: Buffer, contentType: String }]
});

var users = con.model('users', userSchema);

module.exports.users = users;

