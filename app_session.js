var express = require('express');
var session = require('express-session');
var app = express();

app.use(session({
    secret: '234u823?!@#$%@#sdfkl',
    resave: false,
    saveUninitialized: true,
}));

app.get('/count',function (req,res) {
    if(req.session.count){
        req.session.count += 1;
    }else{
        req.session.count = 1;
    }
    res.send('count : '+req.session.count)
});

app.listen(3003, function (){
    console.log('Connected 3003')
});