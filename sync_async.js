const fs = require('fs');

// Sync
console.log(1);
const data = fs.readFileSync('data.txt', {encoding: 'utf8'});
console.log(data);
console.log('이제서야');
console.log('나오는');

// Async
console.log(2);
fs.readFile('data.txt', {encoding: 'utf8'}, function(err, data){
    console.log(3);
    console.log(data);
});
console.log('먼저');
console.log('나옴');
