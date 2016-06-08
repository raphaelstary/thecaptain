G.OptionScreen = (function (Event, Key, DialogOption) {
    "use strict";

    function OptionScreen(services, optionA, optionB) {
        this.events = services.events;
        this.timer = services.timer;

        this.optionA = optionA;
        this.optionB = optionB;
    }

    OptionScreen.prototype.postConstruct = function () {
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

        self.textA.setText(this.optionA);
        self.textB.setText(this.optionB);

        self.selectionB.show = false;
    };

    OptionScreen.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
    };

    return OptionScreen;
})(H5.Event, H5.Key, G.DialogOption);