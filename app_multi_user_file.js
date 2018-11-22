// 세션 데이터는 원래는 메모리에 저장해.
// 그래서 어플리케이션을 종료하고 재시작하면 세션 데이터가 날라가버려.
// => db나 FileStore를 이용해 세션 데이터를 파일로 남기게 되면 세션 데이터가 날라가지 않아.

var express = require('express');
var session = require('express-session');
// FileStore는 express-session과 의존관계
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
// var sha256 = require('sha256');
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
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
app.get('/auth/register', function (req,res){
   var output = `
   <h1>Register</h1>
   <form action="/auth/register" method="post">
        <p>
            <input type="text" name="username" placeholder="username">
        </p>
        <p>
            <input type="password" name="password" placeholder="password">
        </p>
        <p>
            <input type="text" name="displayName" placeholder="displayName">
        </p>
        <p>
            <input type="submit">
        </p>
    </form>
   `;
   res.send(output)
});
var users = [
    {
        username: 'seolran',    // 로그인시 아이디
        password: 'hJApKROSvYY/UOa2383plXDERO8X8qJRhtkf7VtbNf2Ynv881BCP4/PKovHhbO7UjZOqD7BB7N8384PVM8unvHIVPO0pHrOx0eWubD4WttIMi29vGzaTT1rchxhfvdYR9p71RZH51E0+VDgMWBr8oVD8fWCSl9c1hr7FAn0I7g8=',
        salt: 'ZivdoZqoP+nkO9YIUFkaf1vjZeon0zVEbtvvqJ7Lx/+aetyrMpZ0hV8qj8ieLCQxRnHmdlDnN3GvQTNOasqDXQ==',
        displayName: '설란'   // 닉네임같은것
    },
];
app.post('/auth/register',function (req,res){
    hasher({password: req.body.password}, function(err, pass, salt, hash){
        var user = {
            username: req.body.username,
            password: hash,
            salt: salt,
            displayName: req.body.displayName
        };
        users.push(user);
        req.session.displayName = req.body.displayName;
        req.session.save(function () {
            res.redirect('/welcome');
        });

    });

});
app.get('/auth/logout', function (req,res) {
    delete req.session.displayName;
    req.session.save(function(){
        res.redirect('/welcome');
    });
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
app.get('/welcome',function(req,res) {
    if(req.session.displayName){
        res.send(`
        <h1>Hello, ${req.session.displayName}</h1>
        <a href="/auth/logout">Logout</a>
        `)
    }else{
        res.send(`
        <h1>Welcome</h1>
        <ul>
            <li><a href="/auth/login">Login</a></li>
            <li><a href="/auth/register">Register</a></li>
        </ul>
        
        `)
    }
    // res.send(req.session)
});

app.post('/auth/login',function (req,res) {

    var username = req.body.username;
    var password = req.body.password;
    for(var i=0; i<users.length; i++){
        
        if (username === users[i].username){
            return hasher({password: password, salt: users[i].salt}, function (err, pass, salt, hash) {
                if(hash === users[i].password){
                    req.session.displayName = users[i].displayName;
                    req.session.save(function(){
                        res.redirect('/welcome');
                    });
                }else{
                    res.send('아이디나 비밀번호를 확인하세요. <a href="/auth/login">login</a>');
                }
            })
        }

        // if(username === users[i].username && sha256(password+users[i].salt) === users[i].password){  // 사용자가 입력한 값도 암호화시켜야 한다.
        //     req.session.displayName = users[i].displayName;
        //     // 이게 필요해.
        //     return req.session.save(function(){ // for문 안에서의 동작은 return을 만나면 중지된다.
        //         res.redirect('/welcome');
        //     });
        // }
        // else{
        //     res.send('아이디나 비밀번호를 확인하세요. <a href="/auth/login">login</a>');
        // }
    }
    res.send('아이디나 비밀번호를 확인하세요. <a href="/auth/login">login</a>');  // 얘는 for문 밖으로 빼내야 한다.
});

app.listen(3003, function (){
    console.log('Connected 3003')
});