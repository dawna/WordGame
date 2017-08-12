var Board = React.createClass({
    render: function () {
        var className = "board";
        if (this.props.selected) {
            className += " selected";
        }
        return (
            <div className={className}>
                {this.props.index + 1}
            </div>
        );
    }
});

var BoardSwitcher = React.createClass({
    getInitialState: function () {
        // Start off by selecting the first board
        return {
            selectedIndex: 0
        }
    },

    onToggleClick: function (evt) {
        // Here's the meat of the problem. Notice how we can use this.props here (and anywhere else in the component).
        // When this is called, React updates the state and updates the UI to reflect the new render output.
        this.setState({
            selectedIndex: (this.state.selectedIndex + 1) % this.props.numBoards
        })
    },

    render: function () {
        var boards = [];
        for (var ii = 0; ii < this.props.numBoards; ii++) {
            // We can compare to state here so we're no longer always selecting the first board.
            var isSelected = ii === this.state.selectedIndex;
            boards.push(
                <Board index={ii} selected={isSelected} key={ii} />
            );
        }

        return (
            <div>
                <div className="boards">{boards}</div>
                <button onClick={this.onToggleClick}>Toggle</button>
            </div>
        );
    }
});

React.render(
    <BoardSwitcher numBoards={3} />,
    document.body
);
