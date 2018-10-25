const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
// 미들웨어
var _storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
const upload = multer({ storage: _storage });
const fs = require('fs');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.locals.pretty = true;
app.use('/user', express.static('uploads'));
app.set('views', './views_file');
app.set('view engine', 'pug');

// 2. 라우팅
app.get('/upload', (req, res)=>{
   res.render('upload');
});

// 뒤에 콜백함수가 실행되기 전에 미들웨어(upload.single())가 실행된다.
// 이 미들웨어는 req객체 안에 file이라는 객체를 붙여준다.
app.post('/upload', upload.single('userfile'), function (req, res) {
    console.log(req.file);
    res.send('Uploaded : '+req.file.filename);
});

app.get('/topic/new', function(req, res){
    fs.readdir('data/', (err, files)=> {
        if (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        res.render('new', {topics: files});

    });
});
app.get(['/topic', '/topic/:id'], (req, res)=>{
    fs.readdir('data/', (err, files)=>{
        if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        var id = req.params.id;
        if(id){
            // id값이 있을 때
            fs.readFile('data/'+id, 'utf-8', (err, data) => {
                if(err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                }
                res.render('view', {topics: files, title: id, description: data});
            });
        }else{
            // id값이 없을 때
            res.render('view', {topics: files, title: 'Welcome', description: 'Hello, JavaScript for Sever'});
        }
    });

});
app.post('/topic', function(req, res){
    var title = req.body.title;
    var description = req.body.description;
    fs.writeFile('data/'+title, description, (err) => {
        if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        res.redirect('/topic/'+title);
    });

});
// 1. 포트와 커넥션
app.listen(3000, function(){
    console.log('Connected 3000 port!');
});