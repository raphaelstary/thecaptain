G.Interaction = (function (Event, Key) {
    "use strict";

    function Interaction(services, callbacks) {
        this.events = services.events;
        this.callbacks = callbacks;
    }

    Interaction.prototype.postConstruct = function () {
        this.itIsOver = false;

        var self = this;
        var options = [
            {
                selection: this.selectionA,
                drawable: this.textA,
                text: 'continue',
                fn: this.callbacks['continue']
            }, {
                selection: this.selectionB,
                drawable: this.textB,
                text: 'new game',
                fn: this.callbacks['newGame']
            }, {
                selection: this.selectionC,
                drawable: this.textC,
                text: 'save game',
                hidden: true
            }, {
                selection: this.selectionD,
                drawable: this.textD,
                text: 'save game',
                hidden: true
            }, {
                selection: this.selectionE,
                drawable: this.textE,
                text: 'save game',
                hidden: true
            }, {
                selection: this.selectionF,
                drawable: this.textF,
                text: 'save game',
                hidden: true
            }
        ];

        options = options.filter(function (option, index) {
            option.drawable.setText(option.text);
            if (index > 0)
                option.selection.show = false;
            if (option.hidden)
                option.drawable.show = false;
            return !option.hidden;
        });

        var selection = options[0].fn;

        function up() {
            var newSelection = options.pop();
            newSelection.selection.show = true;
            options[0].selection.show = false;
            options.unshift(newSelection);

            selection = newSelection.fn;
        }

        function down() {
            options.push(options.shift());
            options[0].selection.show = true;
            options[options.length - 1].selection.show = false;

            selection = options[0].fn;
        }

        function execute() {
            if (self.itIsOver)
                return;

            if (selection)
                selection();

            self.itIsOver = true;
            self.nextScene();
        }

        this.keyListener = this.events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (self.itIsOver)
                return;

            if (keyBoard[Key.UP]) {
                up();
            } else if (keyBoard[Key.DOWN]) {
                down();
            } else if (keyBoard[Key.ENTER]) {
                execute();
            }
        });

        this.gamePadListener = this.events.subscribe(Event.GAME_PAD, function (gamePad) {
            if (self.itIsOver)
                return;

            if (gamePad.isDPadUpPressed()) {
                up();
            } else if (gamePad.isDPadDownPressed()) {
                down();
            } else if (gamePad.isAPressed()) {
                execute();
            }
        });
    };

    Interaction.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
        this.events.unsubscribe(this.gamePadListener);
    };

    Interaction.prototype.selectionAUp = function () {
        if (this.itIsOver)
            return;

        var fn = this.callbacks['continue'];
        if (fn)
            fn();

        this.itIsOver = true;
        this.nextScene();
    };

    Interaction.prototype.selectionADown = function () {
    };

    Interaction.prototype.selectionBUp = function () {
        if (this.itIsOver)
            return;

        var fn = this.callbacks['newGame'];
        if (fn)
            fn();

        this.itIsOver = true;
        this.nextScene();
    };

    Interaction.prototype.selectionBDown = function () {
    };

    Interaction.prototype.selectionCUp = function () {
    };

    Interaction.prototype.selectionCDown = function () {
    };

    Interaction.prototype.selectionDUp = function () {
    };

    Interaction.prototype.selectionDDown = function () {
    };

    Interaction.prototype.selectionEUp = function () {
    };

    Interaction.prototype.selectionEDown = function () {
    };

    Interaction.prototype.selectionFUp = function () {
    };

    Interaction.prototype.selectionFDown = function () {
    };

    return Interaction;
})(H5.Event, H5.Key);