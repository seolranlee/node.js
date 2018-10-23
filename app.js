const express = require('express');
const app = express();
app.use(express.static('public'));

// get 을 '라우터'라고 부른다.
// get 이 하는 일을 '라우팅'이라고 부른다.

app.get('/', function(req, res){
    res.send('Hello home page');
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