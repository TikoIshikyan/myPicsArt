var mongo = require('./connectToMongo');
var queries = require('./queries');
var express=require('express');
var bodyParser=require('body-parser');
var app=express();

app.use(bodyParser.urlencoded({ extended: true }));

//console.log(Date.now())

app.get('/',function(req,res){
    res.send('this is myPicsArt host');
})

app.post('/createUser',function(req,res){


    var user=new mongo.users();
    user.name=req.body.name;
    user.sname=req.body.sname;
    user.email=req.body.email;
    user.password=req.body.password;

    mongo.users.findOne({}, {}, { sort: { 'id' : -1 } }, function(err, last_data) {
        if(last_data == null){
            user.id = 1;
            queries.add(user, function(err){
                if(err){
                    return res.send('Error = ' + err);
                }
                return res.send(user.name + '  your acount is successfully created');
            });
        }else{
            user.id = last_data.id+1;
            queries.add(user, function(err){
                if(err){
                    return res.send('Error = ' + err)
                }
                return res.send(user.name + '  your acount is successfully created');
            });
        }
    });
    /*
    user.id=Date.now();
    queries.add(user, function(err){
        if(err){
            return res.send('Error = ' + err)
        }
        return res.send(user.name + '  your acount is successfully created');
    });
    */

})

app.post('/updateUser',function(req,res){

    var user = {
        id: req.body.id,
        name: req.body.name
    };

    queries.update(user, function (err) {
        if (err) {
            return res.send('Error = ' + err);
        }
        return res.send('User successfully updated');
    });

})

app.post('/addFollower',function(req, res){

    var userId = req.body.id;
    var followerId = req.body.followerId;


})





app.listen(3000);


