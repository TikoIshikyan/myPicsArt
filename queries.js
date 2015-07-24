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





