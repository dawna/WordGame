var socket = io.connect('http://localhost:3000');

function wordFinished(func) {
    socket.on('complete_letter_pick', function (word) {
        func(word);
    });
}

function pickLetter(typeOfLetter, func) {
    if (typeOfLetter == 'vowel') {
        socket.emit('vowel');
    } else {
        socket.emit('consonant');
    }

    socket.on('currentWord', function (word) {
        func(word);
    });
}
