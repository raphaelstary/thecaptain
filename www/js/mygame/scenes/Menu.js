G.Menu = (function (Event, Key) {
    "use strict";

    function Menu(services, callbacks) {
        this.events = services.events;
        this.callbacks = callbacks;
    }

    Menu.prototype.postConstruct = function () {
        this.itIsOver = false;

        var self = this;
        var options = [
            {
                selection: this.selectionA,
                drawable: this.textA,
                text: 'save',
                fn: this.callbacks['save']
            }, {
                selection: this.selectionB,
                drawable: this.textB,
                text: 'resume',
                fn: this.nextScene.bind(this)
            }, {
                selection: this.selectionC,
                drawable: this.textC,
                text: 'save game',
                hidden: true,
                fn: undefined
            }, {
                selection: this.selectionD,
                drawable: this.textD,
                text: 'save game',
                hidden: true,
                fn: undefined
            }, {
                selection: this.selectionE,
                drawable: this.textE,
                text: 'save game',
                hidden: true,
                fn: undefined
            }, {
                selection: this.selectionF,
                drawable: this.textF,
                text: 'save game',
                hidden: true,
                fn: undefined
            }, {
                selection: this.selectionG,
                drawable: this.textG,
                text: 'save game',
                hidden: true,
                fn: undefined
            }, {
                selection: this.selectionH,
                drawable: this.textH,
                text: 'continue game',
                hidden: true,
                fn: this.nextScene.bind(this)
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
            if (selection)
                selection();
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

    Menu.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
        this.events.unsubscribe(this.gamePadListener);
    };

    return Menu;
})(H5.Event, H5.Key);