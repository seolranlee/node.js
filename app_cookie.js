var express = require('express');
var cookieParser = require('cookie-parser')
var app = express();

// 미들웨어
app.use(cookieParser('734985!@#$@sakdfj'));

// data
var products = {
    1: {title: 'The history of web 1'},
    2: {title: 'The next web'}
};


app.get('/products', function (req, res) {
    var output = '';
    for(var name in products){
        output += `
        <li>
            <a href="/cart/${name}">${products[name].title}</a>
        </li>`;
        console.log(products[name].title);
    }
    res.send(`<h1>Products</h1><ul>${output}</ul><a href="/cart">Cart</a>`)
});

app.get('/cart/:id', function (req, res) {
    var id = req.params.id;
    if(req.signedCookies.cart){
        var cart = req.signedCookies.cart;
    }else{
        var cart = {};
    }
    // 이게 없으면 {"1":8,"2":2,"3":null} 이런 현상이.
    if(!cart[id]){
        cart[id] = 0;
    }
    cart[id] = parseInt(cart[id]) + 1;
    res.cookie('cart',  cart, {signed: true});
    // res.send(cart);
    res.redirect('/cart');
});

app.get('/cart',function (req,res) {
    var cart = req.signedCookies.cart;
    if(!cart){
        res.send('Empty!')
    }else{
        var output = '';
        for(var id in cart){
            output += `<li>${products[id].title} (${cart[id]}) <a href="/${id}/delete">delete</a></li>`
        }
    }
    res.send(`
        <h1>Cart</h1>
        <ul>${output}</ul>
        <a href="/products">Products List</a>`)
});

app.get('/:id/delete', function (req, res) {
    var id = req.params.id;
    if(req.signedCookies.cart){
        var cart = req.signedCookies.cart;
    }else{
        res.send('아무것도 없습니다.')
    }

    if(!cart[id]){
        res.send('아무것도 없습니다.')
    }else{
        cart[id] = parseInt(cart[id]) - 1;
        res.cookie('cart',  cart, {signed: true});
    }
    res.redirect('/cart');
});

app.get('/count', function (req, res){
    if(req.signedCookies.count){
       var count = parseInt(req.signedCookies.count);
    }else{
        var count = 0;  // 쿠키를 구운적이 없으면 초기화
    }
    count = count+1;
    res.cookie('count', count, {signed: true});
    res.send('count : '+ count)
});


app.listen(3003, function (){
    console.log('Connected 3003')
});

