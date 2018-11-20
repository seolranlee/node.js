var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
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
app.get('/welcome',function(req,res) {
    if(req.session.displayName){
        res.send(`
        <h1>Hello, ${req.session.displayName}</h1>
        <a href="/auth/logout">Logout</a>
        `)
    }else{
        res.send(`
        <h1>Welcome</h1>
        <a href="/auth/login">Login</a>
        `)
    }
    // res.send(req.session)
});
app.post('/auth/login',function (req,res) {
    var user = {
        username: 'seolran',    // 로그인시 아이디
        password: '111',
        displayName: '설란'   // 닉네임같은것
    };
    var username = req.body.username;
    var password = req.body.password;
    if(username === user.username && password === user.password){
        req.session.displayName = user.displayName;
        res.redirect('/welcome')
    }else{
        res.send('아이디나 비밀번호를 확인하세요. <a href="/auth/login">login</a>')
    }
});
app.get('/auth/login', function (req, res){
    var output = `
    <h1>Login</h1>
    <form action="/auth/login" method="post">
        <p>
            <input type="text" name="username" placeholder="username">
        </p>
        <p>
            <input type="password" name="password" placeholder="password">
        </p>
        <p>
            <input type="submit">
        </p>
    </form>
    `;
   res.send(output)
});

app.listen(3003, function (){
    console.log('Connected 3003')
});