G.Menu = (function (Event, Key) {
    "use strict";

    function Menu(services, callbacks) {
        this.events = services.events;
        this.callbacks = callbacks;
    }

    Menu.prototype.__resume = function (callback) {
        var self = this;
        if (self.itIsOver)
            return;
        self.itIsOver = true;
        if (callback)
            callback();
        self.nextScene();
    };

    Menu.prototype.postConstruct = function () {
        this.itIsOver = false;

        var self = this;
        var options = [
            {
                selection: this.selectionA,
                drawable: this.textA,
                text: 'mute - unmute',
                fn: this.callbacks['mute']
            }, {
                selection: this.selectionB,
                drawable: this.textB,
                text: 'fullscreen',
                fn: this.callbacks['fullScreen']
            }, {
                selection: this.selectionC,
                drawable: this.textC,
                text: 'save',
                fn: this.callbacks['save']
            }, {
                selection: this.selectionD,
                drawable: this.textD,
                text: 'resume',
                fn: this.__resume.bind(this)
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
                text: 'save game',
                hidden: true,
                fn: undefined
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

        this.busy = false;

        function reactivateListener() {
            self.busy = false;
        }

        function execute(callback) {
            function extendedCallback() {
                self.selectBtn.show = true;
                self.selectTxt.show = true;
                if (callback)
                    callback();
            }

            self.busy = true;
            self.selectBtn.show = false;
            self.selectTxt.show = false;
            if (selection) {
                selection(extendedCallback);
            } else {
                extendedCallback();
            }
        }

        this.keyListener = this.events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (self.itIsOver || self.busy)
                return;

            if (keyBoard[Key.UP]) {
                up();
            } else if (keyBoard[Key.DOWN]) {
                down();
            } else if (keyBoard[Key.ENTER]) {
                execute(reactivateListener);
            }
        });

        this.gamePadListener = this.events.subscribe(Event.GAME_PAD, function (gamePad) {
            if (self.itIsOver || self.busy)
                return;

            if (gamePad.isDPadUpPressed()) {
                up();
            } else if (gamePad.isDPadDownPressed()) {
                down();
            } else if (gamePad.isAPressed()) {
                execute(reactivateListener);
            }
        });
    };

    Menu.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
        this.events.unsubscribe(this.gamePadListener);
    };

    Menu.prototype.selectionAUp = function () {
        if (this.itIsOver || this.busy)
            return;

        var self = this;

        function callback() {
            self.busy = false;
        }

        this.busy = true;

        var fn = this.callbacks['save'];
        if (fn) {
            fn(callback);
        } else {
            callback();
        }
    };

    Menu.prototype.selectionADown = function () {
    };

    Menu.prototype.selectionBUp = function () {
        if (this.itIsOver || this.busy)
            return;

        var self = this;

        function callback() {
            self.busy = false;
        }

        this.busy = true;

        var fn = this.__resume.bind(this);
        if (fn) {
            fn(callback);
        } else {
            callback();
        }
    };

    Menu.prototype.selectionBDown = function () {
    };

    Menu.prototype.selectionCUp = function () {
    };

    Menu.prototype.selectionCDown = function () {
    };

    Menu.prototype.selectionDUp = function () {
    };

    Menu.prototype.selectionDDown = function () {
    };

    Menu.prototype.selectionEUp = function () {
    };

    Menu.prototype.selectionEDown = function () {
    };

    Menu.prototype.selectionFUp = function () {
    };

    Menu.prototype.selectionFDown = function () {
    };

    Menu.prototype.selectionGUp = function () {
    };

    Menu.prototype.selectionGDown = function () {
    };

    Menu.prototype.selectionHUp = function () {
    };

    Menu.prototype.selectionHDown = function () {
    };

    return Menu;
})(H5.Event, H5.Key);