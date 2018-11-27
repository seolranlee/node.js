var sum = require('./lib/sum');
//var sum = function(a, b) {
//     return a+b;
// };
// 과 같아.
console.log('sum', sum(1,2));

var cal = require('./lib/calculator');
console.log('cal sum', cal.sum(1,2));
console.log('cal avg', cal.avg(1,2));