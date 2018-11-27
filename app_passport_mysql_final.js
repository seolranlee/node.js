var app = require('./config/mysql/express')();
var passport = require('./config/mysql/passport')(app); // 이 코드가 위에 있어야해.
// passport.js 안에 app.use(passport.initialize()), app.use(passport.session()); 이런것들이 있으니깐.

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

var auth = require('./routes/mysql/auth')(passport);    // auth.js 내부에 함수의 인자로 passport를 주입.
app.use('/auth/', auth);    // /auth로 들어오는 모든 요청에 대해서 auth라는 라우트가 처리하도록 위임

app.listen(3003, function (){
    console.log('Connected 3003')
});