var mongo = require('./connectToMongo');
var queries = require('./queries');
var express = require('express');
var fs = require('fs');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: "shhhh",
    rolling: true,
    saveUninitialized: true, passReqToCallback: true,
    resave: true,
    cookie: {maxAge: 30000}
}));
app.use(passport.initialize());
app.use(passport.session());


var encoding = function (password) {
    return crypto.createHash('md5').update(password).digest('hex');
}

var isValidPassword = function (user, password) {
    return encoding(password) == user.password;
}

var titleToTags = function (title) {
    var arrSplitedBySharp = title.split('#');
    var tags = [];
    if (arrSplitedBySharp.length > 1) {
        arrSplitedBySharp.forEach(function (elem, index, arr) {
            if (index != 0) {
                tags.push(elem.split(" ")[0]);
            }
        })
    }
    return tags;
}

passport.use('login', new LocalStrategy(function (username, password, done) {
        mongo.users.findOne({username: username}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: 'Incorrect username.'});
            }
            if (!isValidPassword(user, password)) {
                return done(null, false, {message: "Incorrect password."});
            }

            return done(null, user);
        });
    }
));

passport.use('register', new LocalStrategy({
        passReqToCallback: true
    },
    function (req, username, password, done) {

        mongo.users.findOne({username: username}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (user) {
                return done(null, false, {message: "user with this username is already exist"});
            } else {

                var image = req.files.img;
                var contentType = image.name.substring(image.name.lastIndexOf(".") + 1);
                var title = req.body.title;

                var newUser = new mongo.users();
                newUser.name = req.body.name;
                newUser.sname = req.body.sname;
                newUser.email = req.body.email;
                newUser.username = username;
                newUser.password = encoding(password);
                newUser.photos.push({
                    data: fs.readFileSync(image.path),
                    contentType: contentType,
                    title: title,
                    tags: titleToTags(title),
                    id: 0,
                });
                newUser.id = 1;
                newUser.photos[0].owner_id = newUser.id;

                mongo.users.findOne({}, {}, {sort: {'id': -1}}, function (err, last_data) {
                    if (last_data != null) {
                        newUser.id = last_data.id + 1;
                        newUser.photos[0].owner_id = newUser.id;
                    }
                    queries.add(newUser, function (err, message) {
                        if (err) {
                            return done(err);
                        }
                        if (message) {
                            return done(null, false, {message: message});
                        }
                        return done(null, newUser);
                    });
                });
            }
        })
    }))

app.set('view engine', 'ejs');

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    mongo.users.findOne({id: id}, function (err, user) {
        done(err, user);
    });
});

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next(

        );
    }
    res.redirect('/login');
}


app.get('/login', function (req, res) {
    res.render('log');
})

app.post('/login', function (req, res) {

    passport.authenticate('login', function (err, user, info) {
        if (err) {
            return res.statusCode(400);
        }
        if (!user) {
            console.log('message: ' + info.message);
            return res.redirect('/login')
        }

        req.logIn(user, function (err) {
            if (err) {
                return console.log("Error");
            }
            return res.redirect('/users/' + user.id);
        });
    })(req, res)
});

app.get('/register', function (req, res) {
    res.render('reg');
})

app.post('/register', multipartMiddleware, function (req, res) {
    passport.authenticate('register', function (err, user, info) {
        if (err) {
            return res.statusCode(400);
        }
        if (!user) {
            console.log('message: ' + info.message);
            return res.redirect('/register');
        }
        req.logIn(user, function (err) {
            if (err) {
                return console.log("Error");
            }
            console.log(user.name + '  your account is successfully created');
            return res.redirect('/users/' + user.id);
        });
    })(req, res)
});

//app.post('/users', function (req, res) {
//
//    var user = new mongo.users();
//    var imgPath = req.body.imgUrl;
//    var contentType = imgPath.substring(imgPath.lastIndexOf(".") + 1);
//    var title = req.body.title;
//
//
//    user.name = req.body.name;
//    user.sname = req.body.sname;
//    user.email = req.body.email + "";
//    user.username = req.body.username;
//    user.password = encoding(req.body.password);
//    user.photos.push({
//        data: fs.readFileSync(imgPath),
//        contentType: contentType,
//        title: title,
//        tags: titleToTags(title),
//        id: 0,
//    });
//    user.id = 1;
//    user.photos[0].owner_id = user.id;
//
//    mongo.users.findOne({}, {}, {sort: {'id': -1}}, function (err, last_data) {
//        if (last_data != null) {
//            user.id = last_data.id + 1;
//            user.photos[0].owner_id = user.id;
//        }
//        queries.add(user, function (err, message) {
//            if (err) {
//                return res.send('Error = ' + err)
//            }
//            if (message) {
//                return res.send(message);
//            }
//            return res.send(user.name + '  your account is successfully created');
//        });
//
//    });
//})

app.get('/users/:id/photos', isAuthenticated, function (req, res) {
    req.user.photos.forEach(function (photo) {
        if (photo.tags.indexOf(req.query.tags) != -1) {
            res.write(photo.title + "\n");
        }
    })
    res.end();
})

app.post('/users/:id/photos', function (req, res) {

    var userId = req.user.id;
    var imgPath = req.body.imgUrl;
    var contentType = imgPath.substring(imgPath.lastIndexOf(".") + 1);
    var title = req.body.title;
    var photoId = 0;

    mongo.users.findOne({id: userId}, {}, function (err, user) {
        if (err) {
            return res.send(err);
        }
        if (user.photos.length > 0) {
            photoId = user.photos[user.photos.length - 1].id + 1;
        }

        var user = {
            id: userId,
            photo: {
                data: fs.readFileSync(imgPath),
                contentType: contentType,
                title: title,
                tags: titleToTags(title),
                id: photoId,
                owner_id: userId
            }
        };

        queries.addPhoto(user, function (err) {
            if (err) {
                return res.send('Error = ' + err);
            }
            return res.send('photo successfully added');
        });
    })
})

app.put('/users/:id/photos/:p_id', function (req, res) {

    var title = req.body.title;

    var user = {
        id: req.user.id,
        photo: {id: req.params.p_id, title: title, tags: titleToTags(title)}
    };

    queries.updatePhoto(user, function (err) {
        if (err) {
            return res.send('Error = ' + err);
        }
        return res.send('photo successfully updated');
    });
})

app.get('/users/:id/photos/:p_id/comments', isAuthenticated, function (res, req) {

    var p_id = req.params.p_id;
    var owner_id = req.params.p_id;

    queries.getComments(p_id, owner_id, function (err, comments) {
        if (err) {
            return res.send('Error = ' + err);
        }
        comments.forEach(function (comment) {
            res.write(comment + "\n");
        })
        res.end();
    })
})

app.post('/users/:id/photos/:p_id/comments', function (req, res) {

    var p_id = req.params.p_id;
    var owner_id = req.params.id;
    var comment = {body: req.body.text, author: req.user.id};

    queries.addComment(comment, p_id, owner_id, function (err) {
        if (err) {
            return res.send('Error = ' + err);
        }
        return res.send('comment successfully added');
    })

})

app.put('/users/:id/photos/:p_id/comments/:c_id', isAuthenticated, function (req, res) {
    var p_id = req.params.p_id;
    var owner_id = req.params.id;
    var c_id = req.params.c_id;
    var comment = {body: req.body.text, author: req.user.id};

    queries.updateComment(comment, p_id, owner_id, c_id, function (err, message) {
        if (err) {
            return res.send('Error = ' + err);
        }
        return res.send('comment successfully updated');
    })

})

app.delete('/users/:id/photos/:p_id/comments/:c_id', isAuthenticated, function (req, res) {

    var p_id = req.params.p_id;
    var owner_id = req.params.id;
    var c_id = req.params.c_id;

    queries.deleteComment(p_id, owner_id, c_id, req.user.id, function (err, message) {
        if (err) {
            return res.send('Error = ' + err);
        }
        return res.send('comment successfully deleted');
    })
})

app.post('/users/:id/following', isAuthenticated, function (req, res) {

    var userId = req.user.id;
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


app.delete('/users/:id/following', isAuthenticated, function (req, res) {

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

app.get('/users/:id', isAuthenticated, function (req, res) {

    res.render('home', {name: req.user.name, sname: req.user.sname, id: req.user.id, photo: req.user.photos[0].data});

    console.log("in users");
    console.log("sessions == " + req.sessionID + " " + JSON.stringify(req.session));
    console.log("cookies == " + JSON.stringify(req.cookies));
    console.log("headers == " + JSON.stringify(req.headers));

    //var user_id = req.params.id;
    //var user_id = req.query.id;
    //var user_id = req.param('id');
    var user_id = req.user.id;
    //if(user_id != req.user.id){
    //
    //}
    /*
     queries.getUser(user_id, function (err, user) {
     if (err) {
     return res.send("Error + " + err);
     }

     //console.log(user);
     res.write("id: " + user.id + "\n");
     res.write("name: " + user.name + "\n");
     res.write("surname: " + user.sname + "\n");
     //res.write(user.sname);
     res.write("email: " + user.email + "\n");
     //res.write(user.email + "");
     res.write("followers: " + user.followers.toString() + "\n");
     res.write("followings: " + user.followings.toString() + "\n");
     //res.contentType('jpg');
     //res.write(user.photos[1].data);
     //res.write(user.photos[1].data);
     res.end()
     });
     */
})

app.get('/logout', function (req, res) {
    req.logout();
    req.session.destroy();
    console.log("after logout");
    console.log("sessions == " + req.sessionID + " " + JSON.stringify(req.session));
    console.log("cookies == " + JSON.stringify(req.cookies));
    console.log("headers == " + JSON.stringify(req.headers));
    res.redirect('/login');
});

/*
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


