var mongo = require('./connectToMongo');
var queries = require('./queries');
var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.get('/form', function (req, res) {
    res.render('form')
    //res.send('this is myPicsArt host');
})

app.post('/catch', function (req, res) {
    console.log(req.body.name);
    if (req.body.name == 'Vahram')
        res.redirect('/users/1')
})


app.post('/users', function (req, res) {

    var user = new mongo.users();
    var imgPath = req.body.imgUrl;
    var contentType = imgPath.substring(req.body.imgUrl.lastIndexOf(".") + 1);

    user.name = req.body.name;
    user.sname = req.body.sname;
    user.email = req.body.email + "";
    user.password = req.body.password;
    user.photos.push({data: fs.readFileSync(imgPath), contentType: contentType});


    mongo.users.findOne({}, {}, {sort: {'id': -1}}, function (err, last_data) {
        if (last_data == null) {
            user.id = 1;
            queries.add(user, function (err, message) {
                if (err) {
                    return res.send('Error = ' + err);
                }
                if (message) {
                    return res.send(message);
                }
                return res.send(user.name + '  your account is successfully created');
            });
        } else {
            user.id = last_data.id + 1;
            queries.add(user, function (err, message) {
                if (err) {
                    return res.send('Error = ' + err)
                }
                if (message) {
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

app.put('/users/:id', function (req, res) {

    var imgPath = req.body.imgUrl;
    var contentType = imgPath.substring(req.body.imgUrl.lastIndexOf(".") + 1);

    var user = {
        id: req.params.id,
        photo: {data: fs.readFileSync(imgPath), contentType: contentType}
    };

    queries.update(user, function (err) {
        if (err) {
            return res.send('Error = ' + err);
        }
        return res.send('User successfully updated');
    });

})


app.put('/users/:id/following', function (req, res) {

    console.log("mtav")

    var userId = req.params.id;
    var followingId = req.body.followingId;

    queries.addFollowing(userId, followingId, function (err, messege) {
        if (err) {
            return res.send('Error = ' + err);
        }
        if (messege) {
            return res.send(messege);
        }
        return res.send('success');
    })

})


app.delete('/users/:id/following', function (req, res) {

    var userId = req.params.id;
    var followingId = req.body.followingId;

    queries.removeFollowing(userId, followingId, function (err, message) {
        if (err) {
            return res.send('Error = ' + err);
        }
        if (message) {
            return res.send(message);
        }
        return res.send('success');
    })

})

app.get('/users/:id', function (req, res) {

    //var user_id = req.params.id;
    //var user_id = req.query.id;
    var user_id = req.param('id');

    //console.log(req.headers);


    queries.getUser(user_id, function (err, user) {
        if (err) {
            return res.send("Error + " + err);
        }

        //console.log(user);

        //res.write("id: " + user.id + "\n");
        //res.write("name: " + user.name + "\n");
        //res.write("surname: " + user.sname + "\n");
        //   //res.write(user.sname);
        //res.write("email: " + user.email + "\n");
        //   //res.write(user.email + "");
        //res.write("followers: " + user.followers.toString() + "\n");
        //res.write("followings: " + user.followings.toString() + "\n");

        // res.contentType(user.photos[1].contentType);
        res.contentType('jpg');
        res.write(user.photos[1].data);
        //res.contentType('text/plain');
        //  res.write("svaav");

        //res.write(user.photos[1].data);


        res.end()
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


