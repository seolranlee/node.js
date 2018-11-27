var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var mysql      = require('mysql');
var conn = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '1111',
    database : 'o2'
});

conn.connect();
var app = express();
app.set('views', './views/mysql');
app.set('view engine', 'pug');
var options = {
    host: 'localhost',
    port: 3306, // mysql 은 기본이 3306임.
    user: 'root',
    password: '1111',
    database: 'o2'
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: '234u823?!@#$%@#sdfkl',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore(options)
}));
app.use(passport.initialize());
// 이건 세션을 셋팅한 코드 (18 Line) 뒤에 와야한다.
app.use(passport.session());


app.get('/count',function (req,res) {
    if(req.session.count){
        req.session.count += 1;
    }else{
        req.session.count = 1;
    }
    res.send('count : '+req.session.count)
});

app.get('/welcome',function(req,res) {
    if(req.user && req.user.displayName){   // passport는 user라는 사용자 정보를 만들어준다.
        // // deserializeUser가 done할때 던져준 user가 passport user객체가 된다.
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

passport.serializeUser(function(user, done) {
    console.log('serializeUser', user);
    done(null, user.authId);  // 두번째 인자는 데이터 식별자 자리   // 세션이 저장된다.
    // 우리는 id값을 설정해놓지 않았기 때문에 일단 username을 "식별자"로 쓴다.
});

passport.deserializeUser(function(id, done) {
    console.log('deserializeUser', id);
    var sql = 'SELECT * FROM users WHERE authId=?';
    conn.query(sql, [id], function (err, results) {
        console.log(sql, err, results);
        if(err){
            console.log(err);
            done('There is no user');
        }else{
            return done(null, results[0]);
        }
    });
});

passport.use(new LocalStrategy(     // new=> 객체를 생성
    function (username, password, done) {
        var username = username;
        var password = password;

        var sql = 'SELECT * FROM users WHERE authId=?';
        conn.query(sql, ['local:'+username], function (err, results) {
            // console.log(results);
            if(err){
                return done('There is no user');
            }
            var user = results[0];
            return hasher({password: password, salt: user.salt}, function (err, pass, salt, hash) {
                if(hash === user.password){
                    console.log('LocalStrategy', user);
                    done(null, user);   // 로그인 절차가 끝났고 성공했다. 로그인한 사용자 객체를 전달한다.
                    // passport.serializeUser()의 콜백함수가 실행된다.
                }else{
                    done(null, false);  // 로그인 절차가 끝났고 실패했다.
                    // res.send('아이디나 비밀번호를 확인하세요. <a href="/auth/login">login</a>');
                }
            })
        });
    }
));

passport.use(new FacebookStrategy({
        clientID: '297405317766824',
        clientSecret: 'd825e059a092c9a1fc0618d10e326396',
        callbackURL: "/auth/facebook/callback",
        profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName']  // profile에 들어올 정보들을 명시적으로 표시할 수 있다.
    },
    function(accessToken, refreshToken, profile, done) {    // profile 정보가 가장 중요.
        console.log(profile);
        var authId = 'facebook:'+profile.id;
        var sql = 'SELECT * FROM users WHERE authId=?';
        conn.query(sql, [authId], function (err, results) {
            if(results.length>0){   // 사용자가 존재한다면.
                done(null, results[0]);
            }else{
                var newuser = {     // 사용자가 없다면 return 문에 걸리지 않아서 새로운 유저 정보 객체를 생성한다.
                    'authId': authId,
                    'displayName': profile.displayName,
                    'email': profile.emails[0].value,
                };
                var sql = 'INSERT INTO users SET ?';
                conn.query(sql, newuser, function (err, results) {
                    if(err){
                        console.log(err);
                        done('Error');
                    }else{
                        done(null, newuser);
                    }
                })
            }
        });
    }
));

var auth = require('./routes/mysql/auth')(passport);    // auth.js 내부에 함수의 인자로 passport를 주입.
app.use('/auth/', auth);    // /auth로 들어오는 모든 요청에 대해서 auth라는 라우트가 처리하도록 위임

app.listen(3003, function (){
    console.log('Connected 3003')
});