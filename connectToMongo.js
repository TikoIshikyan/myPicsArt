
var mongoose = require('mongoose');
var dbUrl='mongodb://localhost/test';
mongoose.connect(dbUrl);


var mySchema=mongoose.Schema;

var userSchema=new mySchema({
    name: String,
    sname: String,
    email: String,
    password: String,
    profPhoto: String,
    followers: [Number],
    followings:[Number],
    //photos: [{data: buffer,contentType: String}]
});

var myModel = mongoose.model('users',userSchema);

module.exports.myModel=myModel

