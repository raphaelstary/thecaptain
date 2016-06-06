G.DialogScreen = (function (Event, Key) {
    "use strict";

    function DialogScreen(services, text) {
        this.events = services.events;
        this.timer = services.timer;
        this.text = text;
    }

    DialogScreen.prototype.postConstruct = function () {
        this.itIsOver = false;
        var self = this;
        this.keyListener = this.events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (self.itIsOver)
                return;

            if (keyBoard[Key.ENTER] || keyBoard[Key.SPACE]) {
                self.itIsOver = true;
                self.nextScene();
            }
        });

        function writeNextCharacter(index) {
            self.timer.doLater(function () {
                self.dialogTxt.setText(self.dialogTxt.data.msg + self.text[index]);

                if (index < self.text.length - 1)
                    writeNextCharacter(index + 1);
            }, 5);
        }

        self.dialogTxt.setText('');
        writeNextCharacter(0);
    };

    DialogScreen.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
    };

    return DialogScreen;
})(H5.Event, H5.Key);