// 세션 데이터는 원래는 메모리에 저장해.
// 그래서 어플리케이션을 종료하고 재시작하면 세션 데이터가 날라가버려.
// => db나 FileStore를 이용해 세션 데이터를 파일로 남기게 되면 세션 데이터가 날라가지 않아.

var express = require('express');
var session = require('express-session');
// FileStore는 express-session과 의존관계
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var app = express();

var options = {
    host: 'localhost',
    port: 3306, // mysql 은 기본이 3306임.
    user: 'root',
    password: '1111',
    database: 'o2'
};

var mysql      = require('mysql');
var conn = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '1111',
    database : 'o2'
});
conn.connect();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: '234u823?!@#$%@#sdfkl',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore(options)
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

app.post('/auth/register',function (req,res){
    hasher({password: req.body.password}, function(err, pass, salt, hash){
        var user = {
            username: req.body.username,
            password: hash,
            salt: salt,
            displayName: req.body.displayName,
        };
        var sql = 'INSERT INTO user (username, password, salt, displayName) VALUES (?, ?, ?, ?)';
        conn.query(sql, [user.username, user.password, user.salt, user.displayName, user.salt], function(err, result, fields){
            if(err){
                console.log(err);
                res.status(500).send('Internal Server Error');
            }
            req.session.displayName = req.body.displayName;
            req.session.save(function () {
                res.redirect('/welcome');
            });
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
    var sql = `SELECT * FROM user WHERE username="${username}"`;
    conn.query(sql, function(err, rows){
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        if(rows.length > 0){
            console.log(rows[0]);
            return hasher({password: password, salt: rows[0].salt}, function (err, pass, salt, hash) {
                if(hash === rows[0].password){
                    req.session.displayName = rows[0].displayName;
                    req.session.save(function(){
                        res.redirect('/welcome');
                    });
                }else{
                    res.send('아이디나 비밀번호를 확인하세요. <a href="/auth/login">login</a>');
                }
            })
        }else {
            res.send('아이디를 확인하세요. <a href="/auth/login">login</a>')
        }
    });
});

app.listen(3003, function (){
    console.log('Connected 3003')
});