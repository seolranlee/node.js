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
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
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
    // store: new MySQLStore(options)
}));
app.use(passport.initialize());
app.use(passport.session());

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
            else{
                var sql = `SELECT * FROM user WHERE user_id="${result.insertId}"`;
                conn.query(sql, function(err, rows, fields){
                    if(err){
                        console.log(err);
                        res.status(500).send('Internal Server Error');
                    }else{
                        req.login(rows[0], function (err) {
                            console.log(user);
                            return req.session.save(function () {
                                res.redirect('/welcome');
                            });
                        });
                    }
                })
            }
        });
    });
});
app.get('/auth/logout', function (req,res) {
    req.logout();
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
    if(req.user && req.user.displayName){   // passport는 user라는 사용자 정보를 만들어준다.
        // deserializeUser가 done할때 던져준 user가 passport user객체가 된다.
        res.send(`
        <h1>Hello, ${req.user.displayName}</h1>
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
});

passport.serializeUser(function(user, done) {   //2(순서)
    console.log('serializeUser', user);
    done(null, user.user_id);  // 두번째 인자는 데이터 식별자 자리   // 세션이 저장된다.
});

passport.deserializeUser(function(id, done) {  //2(순서)
    console.log('deserializeUser', id);
    var sql = `SELECT * FROM user WHERE user_id="${id}"`;
    conn.query(sql, function(err, user){
        if(err){
            console.log(err);
        }
        if(user.length > 0){
            return done(null, user[0]);
        }
    });
});

passport.use(new LocalStrategy(     // new=> 객체를 생성
    function (username, password, done) {
        var username = username;
        var password = password;
        var sql = `SELECT * FROM user WHERE username="${username}"`;
        conn.query(sql, function(err, rows){
            if(err){
                console.log(err);
                done(null, false);
            }
            if(rows.length > 0){
                return hasher({password: password, salt: rows[0].salt}, function (err, pass, salt, hash) {
                    if(hash === rows[0].password){
                        // console.log('LocalStrategy', rows[0]);
                        done(null, rows[0]);   // 로그인 절차가 끝났고 성공했다. 로그인한 사용자 객체를 전달한다.
                        // passport.serializeUser()의 콜백함수가 실행된다.
                    }else{
                        done(null, false);  // 로그인 절차가 끝났고 실패했다.
                    }
                })
            }else {
                done(null, false);  // 로그인 절차가 끝났고 실패했다.
            }
        });
    }
));

app.post(
    '/auth/login',
    passport.authenticate(  // 미들웨어(콜백함수를 만들어주는 역할)가 실행.
        'local',
        {
            successRedirect: '/welcome',
            failureRedirect: '/auth/login',
            failureFlash: false
        }
    )
);

// app.post('/auth/login',function (req,res) {
//     var username = req.body.username;
//     var password = req.body.password;
//     var sql = `SELECT * FROM user WHERE username="${username}"`;
//     conn.query(sql, function(err, rows){
//         if(err){
//             console.log(err);
//             res.status(500).send('Internal Server Error');
//         }
//         if(rows.length > 0){
//             console.log(rows[0]);
//             return hasher({password: password, salt: rows[0].salt}, function (err, pass, salt, hash) {
//                 if(hash === rows[0].password){
//                     req.session.displayName = rows[0].displayName;
//                     req.session.save(function(){
//                         res.redirect('/welcome');
//                     });
//                 }else{
//                     res.send('아이디나 비밀번호를 확인하세요. <a href="/auth/login">login</a>');
//                 }
//             })
//         }else {
//             res.send('아이디를 확인하세요. <a href="/auth/login">login</a>')
//         }
//     });
// });

app.listen(3003, function (){
    console.log('Connected 3003')
});