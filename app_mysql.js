var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
// 미들웨어
var _storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
var upload = multer({ storage: _storage });
var mysql      = require('mysql');
var conn = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '1111',
    database : 'o2'
});

conn.connect();
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.locals.pretty = true;
app.use('/user', express.static('uploads'));
app.set('views', './views/mysql');
app.set('view engine', 'pug');

// 뒤에 콜백함수가 실행되기 전에 미들웨어(upload.single())가 실행된다.
// 이 미들웨어는 req객체 안에 file이라는 객체를 붙여준다.
app.post('/upload', upload.single('userfile'), function (req, res) {
    console.log(req.file);
    res.send('Uploaded : '+req.file.filename);
});

app.get('/topic/add', function(req, res){
    var sql = 'SELECT id, title FROM topic';
    conn.query(sql, function(err, topics, fields){
      if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
      }
        res.render('topic/add', {topics: topics});
    })
});

app.post('/topic/add', function(req, res){
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;

    var sql = 'INSERT INTO topic (title, description, author) VALUES (?, ?, ?)';
    conn.query(sql, [title, description, author], function(err, result, fields){
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        res.redirect('/topic/'+result.insertId);
    })
});

app.get(['/topic/:id/edit'], function(req, res){
    var sql = 'SELECT id, title FROM topic';
    conn.query(sql, function(err, topics, fields){
        var id = req.params.id;
        if(id){
            var sql = 'SELECT * FROM topic WHERE id=?';
            conn.query(sql, [id], function(err, topic, fields){
                if(err){
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                }else{
                    res.render('topic/edit',  {topics: topics, topic: topic[0]});
                }

            })
        }else{
            console.log('There is no id');
            res.status(500).send('Internal Server Error');
        }

    });
});

app.post(['/topic/:id/edit'], function(req, res){

    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;
    var id = req.params.id;

    var sql = 'UPDATE topic SET title=?, description=?, author=? WHERE id=?';
    conn.query(sql, [title, description, author, id], function(err, result, fields){
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        res.redirect('/topic/'+id);
    });
});

app.get('/topic/:id/delete', function(req, res){
    var sql = 'SELECT id,title FROM topic';
    var id = req.params.id;
    conn.query(sql, [id], function(err, topics, fields){
        var sql = 'SELECT * FROM topic WHERE id=?';
        conn.query(sql, [id], function(err, topic){
            if(err){
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else{
                if(topic.length === 0){
                    console.log('There is no record.');
                    res.status(500).send('Internal Server Error');
                }else{
                    res.render('topic/delete', {topics: topics, topic: topic[0]});
                }
            }
        });

    })
});

app.post('/topic/:id/delete', function(req, res){
    var id = req.params.id;
    var sql = 'DELETE FROM topic WHERE id=?';
    conn.query(sql, [id], function(err, result){
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
        res.redirect('/topic');
    })
});


app.get(['/topic', '/topic/:id'], function(req, res){
    var sql = 'SELECT id, title FROM topic';
    conn.query(sql, function(err, topics, fields){
        var id = req.params.id;
        if(id){
            var sql = 'SELECT * FROM topic WHERE id=?';
            conn.query(sql, [id], function(err, topic, fields){
                if(err){
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                }else{
                    // res.send(rows);
                    res.render('topic/view',  {topics: topics, topic: topic[0]});
                }

            })
        }else{
            res.render('topic/view', {topics: topics});
        }
    });
});

// 1. 포트와 커넥션
app.listen(3000, function(){
    console.log('Connected 3000 port!');
});