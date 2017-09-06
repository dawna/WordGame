var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var unirest = require('unirest');

//Fisher-Yates Shuffle algorithm.
String.prototype.shuffle = function () {
    var a = this.split(''),
        n = a.length;

    for (var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join('');
}

//Whenever someone connects this gets executed
io.on('connection', function (socket) {
    ////Frequency table.
    var letterDictionary = {
        'a': 9 ,
        'b': 2 ,
        'c': 2 ,
        'd': 4 ,
        'e': 12,
        'f': 2 ,
        'g': 3 ,
        'h': 2 ,
        'i': 9 ,
        'j': 1 ,
        'k': 1 ,
        'l': 4 ,
        'm': 2 ,
        'n': 6 ,
        'o': 8 ,
        'p': 2 ,
        'q': 1 ,
        'r': 6 ,
        's': 4 ,
        't': 6 ,
        'u': 4 ,
        'v': 2 ,
        'w': 2 ,
        'x': 1 ,
        'y': 2 ,
        'z': 1 
    };

    var vowels = 'aeiou';
    var currentString = '';
    var consonants = 'bcdfghjklmnpqrstvwxyz';

    var numberOfVowels = 0;
    var numberOfConsonants = 0;

    GenerateRandomLetter = function (letterString) {
        letterString = letterString.shuffle();
        var position = Math.floor(Math.random() * 9);
        var letter = letterString[position];
        return letter;
    };

    HandleLetter = function (letter) {
        currentString += letter;
        if (currentString.length >= 8) {
            socket.emit('complete_letter_pick', { word: currentString });
            console.log('complete');
        } else {
            socket.emit('currentWord', currentString);
        }
    }

    vowelFullList = vowels.split('').map(function (x) {
        return Array(letterDictionary[x] + 1).join(x)
    }).join('');

    consonantFullList = consonants.split('').map(function (x) {
        return Array(letterDictionary[x] + 1).join(x)
    }).join('');

    console.log('A user connected');
    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });

    socket.on('vowel', function () {
        numberOfVowels++;
        var letter = GenerateRandomLetter(vowelFullList);
        vowelFullList = vowelFullList.replace(letter, '');
        console.log(letter);

        HandleLetter(letter);
    });

    socket.on('consonant', function () {
        numberOfConsonants++;
        var letter = GenerateRandomLetter(consonantFullList);
        consonantFullList = consonantFullList.replace(letter, '');
        console.log(letter);

        HandleLetter(letter);
    });

    socket.on('submit', function (req) {
        var word = req.word;
        console.log(word);

        unirest.get("https://twinword-word-graph-dictionary.p.mashape.com/association/?entry=" + word)
            .header("X-Mashape-Key", "yqdeu5JvRWmshaDoHTQwkYj2snoVp1ULVudjsnWI2jtYY6FbqW")
            .header("Accept", "application/json")
            .end(function (result) {
                console.log(result.status, result.headers, result.body);
                var success = result.body.result_code == '200';
                socket.emit("submitResult", success);
            });
    });
});

http.listen(3000, function () {
    console.log('listening on *:50301');
});