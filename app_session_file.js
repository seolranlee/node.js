// 세션 데이터는 원래는 메모리에 저장해.
// 그래서 어플리케이션을 종료하고 재시작하면 세션 데이터가 날라가버려.
// => db나 FileStore를 이용해 세션 데이터를 파일로 남기게 되면 세션 데이터가 날라가지 않아.

var express = require('express');
var session = require('express-session');
// FileStore는 express-session과 의존관계
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: '234u823?!@#$%@#sdfkl',
    resave: false,
    saveUninitialized: true,
    store: new FileStore(),
}));

app.get('/count',function (req,res) {
    if(req.session.count){
        req.session.count += 1;
    }else{
        req.session.count = 1;
    }
    res.send('count : '+req.session.count)
});
app.get('/auth/logout', function (req,res) {
    delete req.session.displayName;
    req.session.save(function(){
        res.redirect('/welcome');
    });
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
        // 이게 필요해.
        req.session.save(function(){
            res.redirect('/welcome');
        });
        // res.redirect('/welcome')
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