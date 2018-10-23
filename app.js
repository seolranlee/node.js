const express = require('express');
const app = express();
app.locals.pretty = true;
// template 엔진을 명시한다.
app.set('view engine', 'pug');
// template가 있는 디렉토리를 알려준다.
// 명시하지 않아도 jade는 views 디렉토리를 템플릿 디렉토리로 찾긴한다.
app.set('views', './views');
app.use(express.static('public'));
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