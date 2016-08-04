G.Option = (function (Event, Key, DialogOption) {
    "use strict";

    function Option(services, optionA, optionB) {
        this.events = services.events;

        this.optionA = optionA;
        this.optionB = optionB;
    }

    Option.prototype.postConstruct = function () {
        this.itIsOver = false;
        var selection = DialogOption.A;
        var self = this;
        this.keyListener = this.events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (self.itIsOver)
                return;

            if (keyBoard[Key.UP] || keyBoard[Key.DOWN]) {
                if (selection == DialogOption.A) {
                    selection = DialogOption.B;
                    self.selectionB.show = true;
                    self.selectionA.show = false;
                } else {
                    selection = DialogOption.A;
                    self.selectionB.show = false;
                    self.selectionA.show = true;
                }
            }

            if (keyBoard[Key.ENTER] || keyBoard[Key.SPACE]) {
                self.itIsOver = true;
                self.nextScene(selection);
            }
        });

        this.gamePadListener = this.events.subscribe(Event.GAME_PAD, function (gamePad) {
            if (self.itIsOver)
                return;

            if (gamePad.isDPadUpPressed() || gamePad.isDPadDownPressed()) {
                if (selection == DialogOption.A) {
                    selection = DialogOption.B;
                    self.selectionB.show = true;
                    self.selectionA.show = false;
                } else {
                    selection = DialogOption.A;
                    self.selectionB.show = false;
                    self.selectionA.show = true;
                }
            }

            if (gamePad.isAPressed() || gamePad.isStartPressed()) {
                self.itIsOver = true;
                self.nextScene(selection);
            }
        });

        self.textA.setText(this.optionA);
        self.textB.setText(this.optionB);

        self.selectionB.show = false;
    };

    Option.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
        this.events.unsubscribe(this.gamePadListener);
    };

    Option.prototype.selectionAUp = function () {
        if (this.itIsOver)
            return;
        this.nextScene(DialogOption.A);
    };

    Option.prototype.selectionADown = function () {
    };

    Option.prototype.selectionBUp = function () {
        if (this.itIsOver)
            return;
        this.nextScene(DialogOption.B);
    };

    Option.prototype.selectionBDown = function () {

    };

    return Option;
})(H5.Event, H5.Key, G.DialogOption);