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
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: '234u823?!@#$%@#sdfkl',
    resave: false,
    saveUninitialized: true,
    // store: new FileStore(),
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
        authId: 'local:seolran',
        username: 'seolran',    // 로그인시 아이디
        password: 'hJApKROSvYY/UOa2383plXDERO8X8qJRhtkf7VtbNf2Ynv881BCP4/PKovHhbO7UjZOqD7BB7N8384PVM8unvHIVPO0pHrOx0eWubD4WttIMi29vGzaTT1rchxhfvdYR9p71RZH51E0+VDgMWBr8oVD8fWCSl9c1hr7FAn0I7g8=',
        salt: 'ZivdoZqoP+nkO9YIUFkaf1vjZeon0zVEbtvvqJ7Lx/+aetyrMpZ0hV8qj8ieLCQxRnHmdlDnN3GvQTNOasqDXQ==',
        displayName: '설란'   // 닉네임같은것
    },
];
app.post('/auth/register',function (req,res){
    hasher({password: req.body.password}, function(err, pass, salt, hash){
        var user = {
            authId: 'local:'+req.body.username,
            username: req.body.username,
            password: hash,
            salt: salt,
            displayName: req.body.displayName
        };
        users.push(user);
        req.login(user, function (err) {
            req.session.save(function () {
                res.redirect('/welcome');
            });
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
    <a href="/auth/facebook">facebook</a>
    `;
    res.send(output)
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
    // res.send(req.session)
});

passport.serializeUser(function(user, done) {
    console.log('serializeUser', user);
    done(null, user.authId);  // 두번째 인자는 데이터 식별자 자리   // 세션이 저장된다.
    // 우리는 id값을 설정해놓지 않았기 때문에 일단 username을 "식별자"로 쓴다.
});

passport.deserializeUser(function(id, done) {
    console.log('deserializeUser', id);
    for(var i=0; i<users.length; i++) {
        var user = users[i];
        if(user.authId === id){
            return done(null, user);
        }
    }
    done('There is no user.');
});

passport.use(new LocalStrategy(     // new=> 객체를 생성
    function (username, password, done) {
        var username = username;
        var password = password;
        for(var i=0; i<users.length; i++){
            var user = users[i];
            if (username === user.username){
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
            }

        }
        done(null, false);  // 로그인 절차가 끝났고 실패했다.
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
        for(var i=0; i<users.length; i++){
            var user = users[i];
            if(users.authId === authId){
                return done(null, user);    // 사용자가 있다면 return 문이 걸려서 done이라는 함수를 호출하며 두번째 인자로 사용자에 대한 정보를 객체로 보낸다. > serializeUser가 실행된다..
            }
        }
        var newuser = {     // 사용자가 없다면 return 문에 걸리지 않아서 새로운 유저 정보 객체를 생성한다.
            'authId': authId,
            'displayName': profile.displayName,
            'email': profile.emails[0].value,
        };
        users.push(newuser);    // 새로운 사용자를 users 배열에 추가한다.
        done(null, newuser);    // done함수가 호출되면서 새로운 유저정보 객체를 전달한다. > serializeUser가 실행된다..
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
app.get(
    '/auth/facebook',
    passport.authenticate(
        'facebook',
        { scope: 'email' }  // 받아올 수 있는 정보의 scope(범위)
    )
);
app.get(
    '/auth/facebook/callback',
    passport.authenticate(
        'facebook',
        {
            successRedirect: '/welcome',
            failureRedirect: '/auth/login',
        }
    )
);


// app.post('/auth/login',function (req,res) {
//
//     var username = req.body.username;
//     var password = req.body.password;
//     for(var i=0; i<users.length; i++){
//
//         if (username === users[i].username){
//             return hasher({password: password, salt: users[i].salt}, function (err, pass, salt, hash) {
//                 if(hash === users[i].password){
//                     req.session.displayName = users[i].displayName;
//                     req.session.save(function(){
//                         res.redirect('/welcome');
//                     });
//                 }else{
//                     res.send('아이디나 비밀번호를 확인하세요. <a href="/auth/login">login</a>');
//                 }
//             })
//         }
//
//         // if(username === users[i].username && sha256(password+users[i].salt) === users[i].password){  // 사용자가 입력한 값도 암호화시켜야 한다.
//         //     req.session.displayName = users[i].displayName;
//         //     // 이게 필요해.
//         //     return req.session.save(function(){ // for문 안에서의 동작은 return을 만나면 중지된다.
//         //         res.redirect('/welcome');
//         //     });
//         // }
//         // else{
//         //     res.send('아이디나 비밀번호를 확인하세요. <a href="/auth/login">login</a>');
//         // }
//     }
//     res.send('아이디나 비밀번호를 확인하세요. <a href="/auth/login">login</a>');  // 얘는 for문 밖으로 빼내야 한다.
// });


app.listen(3003, function (){
    console.log('Connected 3003')
});