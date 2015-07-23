var toMongo=require('./connectToMongo');
var express=require('express');
var bodyParser=require('body-parser');
var app=express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',function(req,res){
    res.send('this is myPicsArt host');
})

app.post('/createUser',function(req,res){

    console.log(req.body.name);
    var user=new toMongo.myModel();
    user.name=req.body.name;
    console.log(user.name);

    user.save(function(err,user,att){
        if(err) {
            res.write('something is wrong,try again');
        }else{
            res.write(user.name+'  your acount is successfully created')
        }
        res.end()
    });
})



app.listen(3000);


