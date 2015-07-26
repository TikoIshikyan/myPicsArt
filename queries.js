var mongo = require('./connectToMongo');

module.exports.add=function(user, done) {

    user.save(function(err, user, att){
       if(err){
           return done(err);
       }
        return done(null);
    });
}

module.exports.update = function(user_data, done){

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

module.exports.addFollowing = function(u_id, f_id, done){
    mongo.users.findOne({id: u_id}, function(err, user){
        if(err){
            return done(err);
        }else{
            user.followings.push(f_id, function(err){
                if(err){
                    return done(err);
                }
                mongo.users.findOne({id: f_id}, function(err, user) {
                    if (err) {
                        return done(err);
                    } else {
                        user.followers.push(id, function (err) {
                            if (err) {
                                return done(err);
                            }
                            return done(null);
                        });

                    }
                });       // return done(null);
            });
        }
    });
}

module.exports.removeFollowing = function(u_id, f_id, done){
    mongo.users.findOne({id: u_id}, function(err, user){
        if(err){
            return done(err);
        }else{
            user.followings.forEach(function(following, index, array){
                if(following==f_id){
                    array.splice(index, 1, function(err){
                        if(err){
                            return done(err);
                        }
                        return done(null);
                    });
                }
            });
        }
    })
}

module.exports.getUser = function(user_id, done){
    mongo.users.findOne({id: user_id}, function(err, user){
        if(err){
           return done(err);
        }
        return user;
    })
}




