function _sum(a,b){     // module2.js 에서는 절대로 접근할 수 없는 숨겨진 함수.
    return a+b;
}
module.exports = function(a, b) {       // module.exports에 등록한다 = module2.js 에서 사용하고자 하는 인터페이스.
    return _sum(a,b);
};