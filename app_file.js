const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.locals.pretty = true;

app.set('views', './views_file');
app.set('view engine', 'pug');

// 2. 라우팅
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