var socket = io.connect('http://localhost:3000');

function wordFinishedEvent(func) {
    socket.on('complete_letter_pick', function (word) {
        func(word);
    });
}

function pickLetter(typeOfLetter) {
    if (typeOfLetter == 'vowel') {
        socket.emit('vowel');
    } else {
        socket.emit('consonant');
    }
}

function retrieveWordEvent(func) {
    socket.on('currentWord', function (word) {
        func(word);
    });
}

function submitWord(word) {
    socket.emit('submit', { word: word });
}

function retrieveWordOnSuccessEvent(func) {
    socket.on('submitResult', function (success) {
        func(success);
    });
}