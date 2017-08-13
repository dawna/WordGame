//Frequency table.
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

//Word picker.
var WordGuesser = React.createClass({
    frequencyList: {},

    getInitialState: function () {
        return {
            input: '',
            state: new Array()
        }
    },

    handleChange(evt) {
        this.setState({ input: evt.target.value });
    },

    handleSubmit(evt) {
        this.frequencyList = {};
        for (var i = 0; i < this.props.letters.length; i++) {
            var letter = this.props.letters[i];
            if (this.frequencyList[letter] == undefined) {
                this.frequencyList[letter] = 1;
            } else {
                this.frequencyList[letter] += 1;
            }
        }

        var new_freq = {};
        for (var i = 0; i < this.state.input.length; i++) {
            var letter = this.state.input[i];

            if (new_freq[letter] == undefined) {
                new_freq[letter] = 1;
            } else {
                new_freq[letter] += 1;
            }

            if (this.frequencyList[letter] == undefined || new_freq[letter] > this.frequencyList[letter]) {
                alert("INVALID WORD");
                return;
            }
        }

        var self = this;
        $.ajax({
            type: 'GET',
            url: 'http://localhost:80/words/' + self.state.input,
            contentType: 'text/plain',
            success: function (data) {
                if (data.body.result_code == '200') {
                    self.state.state.push(self.state.input);
                    self.setState({ state: self.state.state });
                }

                console.log(data);
            },
            xhrFields: {
                withCredentials: false
            },
        });
    },

    onTimerEndedCallback: function () {
        this.props.onTimerEnded(this.state.state);
        this.setState({
            input: '',
            state: new Array() 
        });

    },

    render: function () {
        var itemList = this.state.state.map(word =>
            <li>{word}</li>
        );

        return (
            <div>
                <CountdownTimer disabled={this.props.disabled} onTimerEnded={this.onTimerEndedCallback} />
                <form>
                    <label>
                        Word:
                        <input type="text" value={this.state.input} disabled={this.props.disabled} onChange={this.handleChange} />
                    </label>
                    <input type="button" value="Submit" disabled={this.props.disabled} onClick={this.handleSubmit} />
                </form>
                <ul>{itemList}</ul>
            </div>
        );
    }
});

//Letter selector.
var WordSelector = React.createClass({
    consonantFullList: {
        str: consonants.split('').map(function (x) {
            return Array(letterDictionary[x] + 1).join(x)
        }).join('')
    },

    vowelFullList: {
        str: vowels.split('').map(function (x) {
            return Array(letterDictionary[x] + 1).join(x)
        }).join('')
    },

    GenerateRandomLetter: function (letterStringContainer) {
        var letterString = letterStringContainer.str;
        letterString = letterString.shuffle();
        var position = Math.floor(Math.random() * 9);
        letterStringContainer.str = letterString.substring(0, position - 1) + letterString.substring(position, letterString.length);

        var letter = letterString[position];
        return letter;
    },

    getInitialState: function () {
        return {
            randomizedString: '',
            numberOfVowels: 0,
            numberOfConsonants: 0,
        }
    },

    selectLetters: function (isVowel) {
        //alert(this.consonantFullList.str.length);
        if (isVowel) {
            var letter = this.GenerateRandomLetter(this.vowelFullList);
            this.state.numberOfVowels += 1;
            this.setState({ numberOfVowels: this.state.numberOfVowels });
        } else {
            var letter = this.GenerateRandomLetter(this.consonantFullList);
            this.state.numberOfConsonants += 1;
            this.setState({ numberOfConsonants: this.state.numberOfConsonants });
        }

        var self = this;
        var consonantDiff = 9 - this.state.numberOfConsonants;
        var vowelDiff = 9 - this.state.numberOfVowels;

        //Hideous.
        if (consonantDiff <= 3) {
            var newVowelNum = consonantDiff - this.state.numberOfVowels;
            letter += Array(newVowelNum).fill('').map(function (e) {
                return self.GenerateRandomLetter(self.vowelFullList)
            }).join('');
            this.setState({ numberOfVowels: this.state.numberOfVowels + newVowelNum });
        } else if (vowelDiff <= 4) {
            var newConsonantNum = vowelDiff - this.state.numberOfConsonants;
            letter += Array(newConsonantNum).fill('').map(function (e) {
                return self.GenerateRandomLetter(self.consonantFullList)
            }).join('');
            this.setState({ numberOfConsonants: this.state.numberOfConsonants + newConsonantNum });
        }

        return letter;
    },
    
    //Selects a random consonant.
    selectConsonant: function (evt) {
        var letter = this.selectLetters(false)

        console.log(this.frequencyList);
        this.setState({
            randomizedString: this.state.randomizedString += letter,
        });

        if (this.state.randomizedString.length >= 9) {
            this.props.onSelection(this.state.randomizedString);
        }
    },

    //Selects a random vowel.
    selectVowel: function (evt) {
        var letter = this.selectLetters(true)

        this.setState({
            randomizedString: this.state.randomizedString += letter,
        });

        if (this.state.randomizedString.length >= 9) {
            this.props.onSelection(this.state.randomizedString);
        }
    },

    //Resets everything.
    componentWillReceiveProps(nextProps) {
        if (!nextProps.disabled && this.props.disabled) {
            this.setState({
                randomizedString: '',
                numberOfVowels: 0,
                numberOfConsonants: 0,
            });
        }
    },

    render: function () {
        return (
            <div>
                <button onClick={this.selectConsonant} disabled={this.props.disabled}>Consonant</button>
                <button onClick={this.selectVowel} disabled={this.props.disabled}>Vowel</button>
                <div className="letters">{this.state.randomizedString}</div>
                <p className="letterCount">{this.state.numberOfVowels}</p>
                <p>{this.state.numberOfConsonants}</p>
            </div>
        );
    }
});

//Component that is used to count down from 30 seconds.
var CountdownTimer = React.createClass({
    intervalListener: {},

    getInitialState: function () {
        return {
            timer: 30
        }
    },

    componentWillReceiveProps(nextProps) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        if (!nextProps.disabled && this.props.disabled) {
            this.intervalListener = setInterval(this.countdown, 1000);
        }
    },

    countdown: function () {
        if (this.state.timer > 0) {
            this.state.timer--;
        } else {
            window.clearInterval(this.intervalListener);
            this.state.timer = 30;
            this.props.onTimerEnded();
        }

        this.setState({
            timer: this.state.timer
        });
    },

    render: function () {
        return (
            <div>
                {this.state.timer}
            </div>
        );
    }
});

//Parent component for countdown letters game.
var Countdown = React.createClass({

    getInitialState: function () {
        return {
            disableSelectWords: true,
            disableSelectLetters: false,
            stringProblem: ''
        }
    },

    onSelectWordsCallback: function (randomString) {
        this.setState({
            disableSelectWords: false,
            disableSelectLetters: true,
            stringProblem: randomString
        });
    },

    //Retrieves a list of answers from the users.
    onTimeEndedCallback: function (answers) {
        var largest = '';
        for (var i = 0; i < answers.length; i++) {
            if (largest.length < answers[i].length) {
                largest = answers[i];
            }
        }

        alert(largest + ' ' + largest.length);
        this.setState({
            disableSelectLetters: false,
            disableSelectWords: true
        });
    },

    render: function () {
        return (
            <div>
                <WordSelector disabled={this.state.disableSelectLetters} onSelection={this.onSelectWordsCallback} />
                <WordGuesser disabled={this.state.disableSelectWords} letters={this.state.stringProblem} onTimerEnded={this.onTimeEndedCallback} />
            </div>
        );
    }
})

ReactDOM.render(
    <Countdown />,
    document.getElementById("container")
);
