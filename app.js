const express = require('express');
const app = express();
app.use(express.static('public'));

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