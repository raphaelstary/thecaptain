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
            self.dialogTxt.setText(self.dialogTxt.data.msg + self.text[index]);

            if (index < self.text.length - 1)
                startNextCharacterIteration(index + 1);
        }

        function startNextCharacterIteration(index) {
            if (self.text[index] == ' ') {
                writeNextCharacter(index);
            } else {
                self.timer.doLater(function () {
                    writeNextCharacter(index);
                }, 2);
            }
        }

        self.dialogTxt.setText('');
        startNextCharacterIteration(0);
    };

    DialogScreen.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
    };

    return DialogScreen;
})(H5.Event, H5.Key);