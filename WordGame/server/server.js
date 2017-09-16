var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var unirest = require('unirest');
var pg = require('pg');

var connectionString = 'postgres://localhost/worddb';

var pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'worddb',
    password: '****',
    port: 5432
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

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
    var consonants = 'bcdfghjklmnpqrstvwxyz';

    var numberOfVowels = 0;
    var numberOfConsonants = 0;

    var currentString = '';

    var vowelFullList = '';
    var consonantFullList = '';

    Initialize = function () {
        numberOfVowels = 0;
        numberOfConsonants = 0;

        currentString = '';

        vowelFullList = vowels.split('').map(function (x) {
            return Array(letterDictionary[x] + 1).join(x)
        }).join('');

        consonantFullList = consonants.split('').map(function (x) {
            return Array(letterDictionary[x] + 1).join(x)
        }).join('');

        console.log('Resetting game');
    }

    GenerateRandomLetter = function (letterString) {
        letterString = letterString.shuffle();
        var position = Math.floor(Math.random() * 9);
        var letter = letterString[position];
        return letter;
    };

    HandleLetter = function (letter) {
        currentString += letter;
        if (currentString.length >= 8) {
            socket.emit('currentWord', currentString);
            socket.emit('complete_letter_pick', { word: currentString });
            console.log('complete');
        } else {
            socket.emit('currentWord', currentString);
        }
    }

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

        pool.query('SELECT * FROM words WHERE lower(word) = $1', [word], (err, res) => {
            if (err) {
                throw err
            }
            console.log("Result ", res.rows[0]);

            socket.emit("submitResult", res.rows[0]);
        });
    });

    socket.on('reset', function () {
        Initialize();
    });

    Initialize();
});

io.on('exit', function () {
    console.log('Process exit');
    pool.end();
});

http.listen(3000, function () {
    console.log('listening on *:50301');
});