var mongo = require('./connectToMongo');

module.exports.add = function (user, done) {
   /*
    var email = user.email;
    if(!~email.indexOf('@')){
        return done(null, "incorrect email format");
    }
    var afterAtSign = email.substring(email.indexOf("@"));
    if(afterAtSign.inde)

//  user.email.forEach(function(char, index, email){
//        if(~)
//  })
*/
    user.save(function (err, user, att) {
        if (err) {
            return done(err);
        }
        return done(null);
    });
}

module.exports.update = function (user_data, done) {

    mongo.users.findOne({id: user_data.id}, function (err, user) {
        if (err) {
            return done(err);
        }
        user.name = user_data.name;
        user.save(function (err) {
            if (err) {
                return done(err);
            }
            return done(null);
        });
    });
    /*
     monbgo.users.update({id: req.body.id},{$set: {name: req.body.name}},function(err, row){
     if(err){
     res.write('error');
     }
     else
     {
     res.write(req.body.name);
     }
     res.end();
     });*/
}

module.exports.addFollowing = function (u_id, f_id, done) {
    var isExist = false;

    if(u_id == f_id){
        return done(null, "oops");
    }

    mongo.users.findOne({id: u_id}, function (err, user) {
        if (err) {
            return done(err,null);
        } else {
            user.followings.forEach(function (following, index, array) {
                if (following == f_id) {
                    isExist = true;
                }
            })
            if(isExist){
                return done(null, "you are already following this user");
            }
            user.followings.push(f_id);
            user.save(function (err, user, att) {
                if (err) {
                    return done(err, null);
                }
            });
            mongo.users.findOne({id: f_id}, function (err, user) {
                if (err) {
                    return done(err,null);
                } else {
                    user.followers.push(u_id);
                    user.save(function (err, user, att) {
                        if (err) {
                            return done(err,null);
                        }
                        return done(null,null);
                    });

                }
            });
        }
    });
}

module.exports.removeFollowing = function (u_id, f_id, done) {

    var isExist = false;
    mongo.users.findOne({id: u_id}, function (err, user) {
        if (err) {
            return done(err, null);
        } else {
            user.followings.forEach(function (following, index, array) {
                if (following == f_id) {
                    isExist = true;
                    array.splice(index, 1);
                }
            });
            if(!isExist){
                return done(null, "this user is not in your followings");
            }else{
                user.save(function(err, user, att){
                    if(err){
                        return done(err, null);
                    }
                })
                mongo.users.findOne({id: f_id},function(err, user){
                    if(err){
                        return done(err, null);
                    }
                    user.followers.forEach(function(follower, index, array){
                        if(follower == u_id){
                            array.splice(index, 1);
                        }
                    })
                    user.save(function(err){
                        if(err){
                            return done(err, null);
                        }
                        return done(null, null);
                    })
                })
            }
        }
    })
}

module.exports.getUser = function (user_id, done) {
    mongo.users.findOne({id: user_id}, function (err, user) {
        if (err) {
            return done(err, null);
        }
        return done(null, user);
    })
}




