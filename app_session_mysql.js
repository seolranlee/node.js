// 세션 데이터는 원래는 메모리에 저장해.
// 그래서 어플리케이션을 종료하고 재시작하면 세션 데이터가 날라가버려.
// => db나 FileStore를 이용해 세션 데이터를 파일로 남기게 되면 세션 데이터가 날라가지 않아.

var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
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
    var sql = `SELECT * FROM user WHERE username="${req.body.username}"`;
    conn.query(sql, function(err, rows){
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        if(rows.length > 0){
            if (req.body.password === rows[0].password ){
                req.session.displayName = rows[0].displayName;
                req.session.save(function(){
                    res.redirect('/welcome');
                });
            }else{
                res.send('비밀번호를 확인하세요. <a href="/auth/login">login</a>')
            }
        }else {
            res.send('아이디를 확인하세요. <a href="/auth/login">login</a>')
        }
    });

    // var user = {
    //     username: 'seolran',    // 로그인시 아이디
    //     password: '111',
    //     displayName: '설란'   // 닉네임같은것
    // };
    //
    // if(username === user.username && password === user.password){
    //     req.session.displayName = user.displayName;
    //     // save가 끝난 다음에 welcome으로 이동하게.
    //     // 안전하게.
    //     req.session.save(function(){
    //         res.redirect('/welcome');
    //     });
    // }else{
    //     res.send('아이디나 비밀번호를 확인하세요. <a href="/auth/login">login</a>')
    // }
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