var mongo = require('./connectToMongo');

module.exports.add = function (user, done) {

    user.save(function (err, user, att) {
        if (err) {
            return done(err);
        }
        return done(null);
    });
}

module.exports.addPhoto = function (user_data, done) {

    mongo.users.findOne({id: user_data.id}, function (err, user) {
        if (err) {
            return done(err);
        }

        user.photos.push(user_data.photo);

        user.save(function (err) {
            if (err) {
                return done(err);
            }
            return done(null);
        });
    });
}

module.exports.updatePhoto = function (user_data, done) {

    mongo.users.findOne({id: user_data.id}, function (err, user) {
        if (err) {
            return done(err);
        }

        for (var i = 0; i < user.photos.length; i++) {
            if (user.photos[i].id == user_data.photo.id) {
                user.photos[i].title = user_data.photo.title;
                user.photos[i].tags = user_data.photo.tags;
                break;
            }
        }

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

module.exports.getComments = function (p_id, owner_id, done) {
    mongo.users.findOne({id: owner_id}, {}, function (err, user) {

        if (err) {
            return done(err, null);
        }

        for (var i = 0; i < user.photos.length; i++) {
            if (user.photos[i].id == p_id) {
                return done(null, user.photos[i].comments);
            }
        }
    })
}

module.exports.addComment = function (comment, p_id, owner_id, done) {
    mongo.users.findOne({id: owner_id}, {}, function (err, user) {

        if (err) {
            return done(err);
        }

        for (var i = 0; i < user.photos.length; i++) {
            if (user.photos[i].id == p_id) {
                user.photos[i].comments.push(comment);
                break;
            }
        }

        user.save(function (err) {
            if (err) {
                return done(err);
            }
            return done(null);
        });
    })
}

module.exports.updateComment = function (comment, p_id, owner_id, c_id, done) {
    mongo.users.findOne({id: owner_id}, {}, function (err, user) {

        if (err) {
            return done(err);
        }

        for (var i = 0; i < user.photos.length; i++) {
            if (user.photos[i].id == p_id) {
                for (var j = 0; j < user.photos[i].comments.length; j++) {
                    if (user.photos[i].comments[j].id == c_id) {
                        if (user.photos[i].comments[j].author == comment.author) {
                            user.photos[i].comments[j].body = comment.body;
                            break;
                        }else{
                            return done(null, "you can not edit this comment");
                        }
                    }
                }
            }
            break;
        }

        user.save(function (err) {
            if (err) {
                return done(err);
            }
            return done(null);
        });
    })
}

module.exports.deleteComment = function(p_id, owner_id, c_id, author, done){
    mongo.users.findOne({id: owner_id}, {}, function (err, user) {

        if (err) {
            return done(err);
        }

        for (var i = 0; i < user.photos.length; i++) {
            if (user.photos[i].id == p_id) {
                for (var j = 0; j < user.photos[i].comments.length; j++) {
                    if (user.photos[i].comments[j].id == c_id) {
                        if (user.photos[i].comments[j].author == author) {
                            user.photos[i].comments.slice(j, 1);
                            break;
                        }else{
                            return done(null, "you can not delete this comment");
                        }
                    }
                }
            }
            break;
        }

        user.save(function (err) {
            if (err) {
                return done(err);
            }
            return done(null);
        });
    })
}

module.exports.addFollowing = function (u_id, f_id, done) {
    var isExist = false;

    if (u_id == f_id) {
        return done(null, "oops");
    }

    mongo.users.findOne({id: u_id}, function (err, user) {
        if (err) {
            return done(err, null);
        } else {
            user.followings.forEach(function (following, index, array) {
                if (following == f_id) {
                    isExist = true;
                }
            })
            if (isExist) {
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
                    return done(err, null);
                } else {
                    user.followers.push(u_id);
                    user.save(function (err, user, att) {
                        if (err) {
                            return done(err, null);
                        }
                        return done(null, null);
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
            if (!isExist) {
                return done(null, "this user is not in your followings");
            } else {
                user.save(function (err, user, att) {
                    if (err) {
                        return done(err, null);
                    }
                })
                mongo.users.findOne({id: f_id}, function (err, user) {
                    if (err) {
                        return done(err, null);
                    }
                    user.followers.forEach(function (follower, index, array) {
                        if (follower == u_id) {
                            array.splice(index, 1);
                        }
                    })
                    user.save(function (err) {
                        if (err) {
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




