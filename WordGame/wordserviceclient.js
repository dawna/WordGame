var express = require('express');
var unirest = require('unirest');

var app = express();

console.log("Hello World");

app.get('/words/:word', function (req, res) {
    console.log('LEDon button pressed!');
    // Run your LED toggling code here
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //res.send("test");
    var word = req.params['word'];

    // These code snippets use an open-source library. http://unirest.io/nodejs
    unirest.get("https://twinword-word-graph-dictionary.p.mashape.com/association/?entry=" + word)
        .header("X-Mashape-Key", "yqdeu5JvRWmshaDoHTQwkYj2snoVp1ULVudjsnWI2jtYY6FbqW")
        .header("Accept", "application/json")
        .end(function (result) {
            console.log(result.status, result.headers, result.body);
            res.send(result);
        });
});

//unirest.listen(1337);
app.listen(80);