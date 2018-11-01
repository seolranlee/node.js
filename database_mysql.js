var mysql      = require('mysql');
var conn = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    database : 'o2'
});

conn.connect();

// 조회
// var sql = 'SELECT * FROM  topic';
// conn.query(sql, function(err, rows, fields){
//     if(err){
//         console.log(err);
//     }else{
//         for(var i=0; i<rows.length; i++){
//             console.log(rows[i].id, rows[i].title, rows[i].description, rows[i].author)
//         }
//     }
// });

// 입력
// var sql='INSERT INTO topic (title, description, author) VALUES (?, ?, ?)';
// var parmas=['Supervisor', 'Watcher', 'graphittie'];
// conn.query(sql, parmas, function(err, rows, fields){
//     if(err){
//         console.log(err)
//     }else{
//         console.log(rows.insertId)
//     }
// });

// 수정
// var sql='UPDATE topic SET title=?, author=? WHERE id=?';
// var parmas=['Vue.js', 'Evan You', '4'];
// conn.query(sql, parmas, function(err, rows, fields){
//     if(err){
//         console.log(err)
//     }else{
//         console.log(rows)
//     }
// });

//삭제
var sql='DELETE FROM topic WHERE id=?';
var parmas=[1];
conn.query(sql, parmas, function(err, rows, fields){
    if(err){
        console.log(err)
    }else{
        console.log(rows)
    }
});

conn.end();


