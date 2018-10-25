const express = require('express');
// get방식의 데이터에는 express 자체적으로 접근할 수 있지만, post방식은 그렇게 하지 못해서 bodyParser라는 미들웨어가 필요하다.
const bodyParser = require('body-parser');
const app = express();
app.locals.pretty = true;
// template 엔진을 명시한다.
app.set('view engine', 'pug');
// template가 있는 디렉토리를 알려준다.
// 명시하지 않아도 jade는 views 디렉토리를 템플릿 디렉토리로 찾긴한다.
app.set('views', './views');

app.use(express.static('public'));
// use라는 메소드를 통해 bodyParser를 어플리케이션과 연결시킴.
// 라우팅을 하기 전에 진행되는 일.
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/form', function(req, res){
    res.render('form');
});

// form 태그는 생각해보면 url 을 생성해주는 작은 프로그램이라고 할 수 있다.
app.get('/form_receiver', function(req, res){
    var title = req.query.title;
    var description = req.query.description;
    res.send(title+','+description)
});

// bodyParser는 req객체에 body객체를 추가해줌.
app.post('/form_receiver', function(req, res){
    var title = req.body.title; // req객체의 body라는 객체의 title이라는 프로퍼티.
    var description = req.body.description;
    res.send(title+','+description);
});
// 시맨틱url 방식
app.get('/topic/:id', function(req, res){
    var topics = [
        'Javascript is...',
        'Nodejs is...',
        'Express is...'
    ];
    var output = `
        <a href="/topic/0">JavaScript</a><br>
        <a href="/topic/1">Nodejs</a><br>
        <a href="/topic/2">Express</a><br><br>
        ${topics[req.params.id]}
    `
    res.send(output);
});

// query string 방식
// app.get('/topic', function(req, res){
//     var topics = [
//         'Javascript is...',
//         'Nodejs is...',
//         'Express is...'
//     ];
//     var output = `
//         <a href="/topic?id=0">JavaScript</a><br>
//         <a href="/topic?id=1">Nodejs</a><br>
//         <a href="/topic?id=2">Express</a><br><br>
//         ${topics[req.query.id]}
//     `
//
//     res.send(output);
// });

app.get('/topic/:id/:mode', function(req, res){
   res.send(req.params.id +','+ req.params.mode)
});
app.get('/template', function(req, res){
    // views안에 temp파일을 불러들인다.
    // 두번째 인자에 템플릿 안에서 사용할 데이터를 '객체'로 전달할 수 있다.
    res.render('temp', {time: Date(), _title: 'Jade'});
});
// get 을 '라우터'라고 부른다.
// get 이 하는 일을 '라우팅'이라고 부른다.

app.get('/', function(req, res){
    res.send('Hello home page');
});
app.get('/dynamic', function(req, res){
    var lis = '';
    for(var i=0; i<5; i++){
        lis = lis + '<li>coding '+i+'</li>';
    }
    var time = Date();
    var output = `
    <!doctype html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    </head>
    <body>
    Hello, Dynamic
    <ul>
        ${lis}    
    </ul>
    ${time}
    </body>
    </html>
    `;
    res.send(output);
});

app.get('/route', function(req, res){
    res.send('Hello Router, <img src="/route.png">');
});

app.get('/login', function(req, res){
    res.send('<h1>Login please</h1>');
});
app.listen(3000, function(){
    console.log('Connected 3000 port!');
});