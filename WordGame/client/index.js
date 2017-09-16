//Word picker.
var WordGuesser = React.createClass({
    frequencyList: {},

    getInitialState: function () {

        retrieveWordOnSuccessEvent((success) => {
            if (success) {
                this.state.state.push(this.state.input);
                alert(this.state.state);
                this.setState({
                    state: this.state.state
                });
            } else {
                alert("Word doesn't exist");
            }
        });

        return {
            input: '',
            state: new Array()
        }
    },

    handleChange(evt) {
        this.setState({ input: evt.target.value });
    },

    handleSubmit(evt) {
        //Do client-side validation.
        //this.frequencyList = {};
        //for (var i = 0; i < this.props.letters.length; i++) {
        //    var letter = this.props.letters[i];
        //    if (this.frequencyList[letter] == undefined) {
        //        this.frequencyList[letter] = 1;
        //    } else {
        //        this.frequencyList[letter] += 1;
        //    }
        //}

        //var new_freq = {};
        //for (var i = 0; i < this.state.input.length; i++) {
        //    var letter = this.state.input[i];

        //    if (new_freq[letter] == undefined) {
        //        new_freq[letter] = 1;
        //    } else {
        //        new_freq[letter] += 1;
        //    }

        //    if (this.frequencyList[letter] == undefined || new_freq[letter] > this.frequencyList[letter]) {
        //        alert("INVALID WORD");
        //        return;
        //    }
        //}

        submitWord(this.state.input);
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
                <CountdownTimer disabled={this.props.disabled} onTimerEnded={this.onTimerEndedCallback} size={200} />
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

var LetterSelector = React.createClass({

    getInitialState: function () {

        retrieveWordEvent((word) => this.setState({ randomizedString: word }));

        return {
            randomizedString: '',
        }
    },
    //Selects a random consonant.
    selectConsonant: function (evt) {
        pickLetter('consonant');
        this.props.onSelection();
    },

    //Selects a random vowel.
    selectVowel: function (evt) {
        pickLetter('vowel');
        this.props.onSelection();
    },

    //Resets everything.
    componentWillReceiveProps(nextProps) {
        if (!nextProps.disabled && this.props.disabled) {
            this.setState({
                randomizedString: '',
            });
        }
    },

    render: function () {
        return (
            <div>
                <button onClick={this.selectConsonant} disabled={this.props.disabled}>Consonant</button>
                <button onClick={this.selectVowel} disabled={this.props.disabled}>Vowel</button>
                <div className="letters">Word: {this.state.randomizedString}</div>
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
        var step = 50;
        if (!nextProps.disabled && this.props.disabled) {
            this.intervalListener = setInterval(this.countdown, step);
        }
    },

    countdown: function () {
        if (this.state.timer > 0) {
            this.state.timer = this.state.timer - 50 / 1000.0;
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
        var size = this.props.size;
        var radius = this.props.size / 2.0;
        var angle = 0;
        var lines = <line x1={size} y1={size} x2={rotX} y2={rotY} stroke="black" strokeWidth={5} />;
        var li = []

        for (var i = 0; i < 12; i++) {
            angle = angle + 30 * (Math.PI / 180.0);
            var x2 = radius - 80 * Math.sin(angle);
            var y2 = radius - 80 * Math.cos(angle);
            var x1 = radius - 60 * Math.sin(angle);
            var y1 = radius - 60 * Math.cos(angle);

            var color = "black";
            if (i == 5 || i == 11) {
                color = "red";
            }

            li.push(<line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2} />)
        }

        var theta = (30 - this.state.timer) * 6 * -(Math.PI / 180);
        var rotX = radius - 80 * Math.sin(theta);
        var rotY = radius - 80 * Math.cos(theta);

        return (
            <div>
                <svg height={size} width={size} >
                    <circle cx={radius} cy={radius} r={radius} fill="black" />
                    <circle cx={radius} cy={radius} r={radius - 10} fill="white" />
                    <circle cx={radius} cy={radius} r={7} fill="black" />
                    {li}
                    <line x1={radius} y1={radius} x2={rotX} y2={rotY} stroke="black" strokeWidth={5} />
                </svg>
                <p/>
            </div>
        );
    }
});

//Parent component for countdown letters game.
var Countdown = React.createClass({

    getInitialState: function () {

        wordFinishedEvent((word) => {
            this.setState({
                stringProblem: word,
                disableSelectLetters: true,
                disableSelectWords: false
            });
        });

        return {
            disableSelectWords: true,
            disableSelectLetters: false,
            stringProblem: ''
        }
    },

    //onSelectWordsCallback: function () {
    //},

    //Retrieves a list of answers from the users.
    onTimeEndedCallback: function (answers) {
        var largest = '';
        for (var i = 0; i < answers.length; i++) {
            if (largest.length < answers[i].length) {
                largest = answers[i];
            }
        }

        resetGame();

        alert(largest + ' ' + largest.length);
        this.setState({
            disableSelectLetters: false,
            disableSelectWords: true
        });
    },

    //disableSelector: function () {
    //},

    render: function () {
        return (
            <div>
                <LetterSelector disabled={this.state.disableSelectLetters} onSelection={this.onSelectWordsCallback} />
                <WordGuesser disabled={this.state.disableSelectWords} letters={this.state.stringProblem} onTimerEnded={this.onTimeEndedCallback} />
            </div>
        );
    }
})

ReactDOM.render(
    <Countdown />,
    document.getElementById("container")
);