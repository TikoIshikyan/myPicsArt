var mongo = require('./connectToMongo');
var queries = require('./queries');
var express=require('express');
var bodyParser=require('body-parser');
var app=express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',function(req,res){
    res.send('this is myPicsArt host');
})

app.post('/createUser',function(req,res){


    var user=new mongo.users();
    user.name=req.body.name;
    user.sname=req.body.sname;
    user.email=req.body.email + "";
    user.password=req.body.password;

    mongo.users.findOne({}, {}, { sort: { 'id' : -1 } }, function(err, last_data) {
        if(last_data == null){
            user.id = 1;
            queries.add(user, function(err, message){
                if(err){
                    return res.send('Error = ' + err);
                }
                if(message){
                    return res.send(message);
                }
                return res.send(user.name + '  your account is successfully created');
            });
        }else{
            user.id = last_data.id+1;
            queries.add(user, function(err, message){
                if(err){
                    return res.send('Error = ' + err)
                }
                if(message){
                    return res.send(message);
                }
                return res.send(user.name + '  your account is successfully created');
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



app.post('/addFollowing',function(req, res){

    var userId = req.body.id;
    var followingId = req.body.followingId;

    queries.addFollowing(userId, followingId, function(err,messege){
        if(err){
            return res.send('Error = ' + err);
        }
        if(messege){
            return res.send(messege);
        }
        return res.send('success');
    })

})


app.post('/removeFollowing',function(req, res){

    var userId = req.body.id;
    var followingId = req.body.followingId;

    queries.removeFollowing(userId, followingId, function(err, message){
        if(err){
            return res.send('Error = '+ err);
        }
        if(message){
            return res.send(message);
        }
        return res.send('success');
    })

})

app.get('/getUser', function(req, res){
    var user_id = req.query.id;

    queries.getUser(user_id, function(err, user){
        if(err){
            return res.send("Error + " + err);
        }
        res.write("id: " + user.id + "\n");
        res.write("name: " + user.name + "\n");
        res.write("surname: " + user.sname + "\n");
     //   res.write(user.sname);
        res.write("email: " + user.email + "\n");
      //  res.write(user.email + "");
        res.write("followers: " + user.followers.toString() + "\n");
        res.write("followings: " + user.followings.toString() + "\n");
        res.end();
    });
})





/*

app.post('/addFollower',function(req, res){

    var userId = req.body.id;
    var followerId = req.body.followerId;

    queries.addFollower(userId, followerId, function(err1,err2){
        if(err){
            return res.send('Error = '+ err);
        }
        return res.send('success');
    })

})


app.post('/removeFollower',function(req, res){

    var userId = req.body.id;
    var followerId = req.body.followerId;

    queries.removeFollower(userId, followerId, function(err){
        if(err){
            return res.send('Error = '+ err);
        }
        return res.send('success');
    })

})
*/

app.listen(3000);


