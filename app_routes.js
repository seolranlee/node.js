var express = require('express');
var app = express();

var p1 = require('./routes/p1.js')(app);    // 함수로 호출할때 app이라는 객체를 호출하고 있다.
app.use('/p1', p1);

var p2 = require('./routes/p2.js')(app);
app.use('/p2', p2);

app.listen(3003, function () {
    console.log('3003 connected')
});