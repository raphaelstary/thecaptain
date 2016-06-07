G.DialogScreen = (function (Event, Key, Width, Height) {
    "use strict";

    function DialogScreen(services, textPragraphs) {
        this.events = services.events;
        this.timer = services.timer;
        this.textPragraphs = textPragraphs.slice();
    }

    DialogScreen.prototype.postConstruct = function () {
        this.itIsOver = false;
        var typing = true;
        var skip = false;
        var self = this;
        this.keyListener = this.events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (self.itIsOver)
                return;

            if (keyBoard[Key.ENTER] || keyBoard[Key.SPACE]) {
                if (typing) {
                    // skip typing
                    skip = true;
                } else {

                    if (self.textPragraphs.length > 0) {
                        typing = true;
                        skip = false;
                        self.dialogTxt.setText('');
                        startNextCharacterIteration(self.textPragraphs.shift(), 0);
                    } else {
                        self.itIsOver = true;
                        self.nextScene();
                    }
                }
            }
        });

        function writeNextCharacter(text, index) {
            if (skip) {
                self.dialogTxt.setText(text);
                typing = false;
                return;
            }
            self.dialogTxt.setText(self.dialogTxt.data.msg + text[index]);

            if (index < text.length - 1) {
                startNextCharacterIteration(text, index + 1);
            } else {
                typing = false;
            }
        }

        function startNextCharacterIteration(text, index) {
            if (text[index] == ' ') {
                writeNextCharacter(text, index);
            } else {
                self.timer.doLater(function () {
                    writeNextCharacter(text, index);
                }, 2);
            }
        }

        self.dialogTxt.setText('');
        self.dialogTxt.setMaxLineLength(Width.get(10, 9));
        self.dialogTxt.setLineHeight(Height.get(10));
        startNextCharacterIteration(this.textPragraphs.shift(), 0);
    };

    DialogScreen.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
    };

    return DialogScreen;
})(H5.Event, H5.Key, H5.Width, H5.Height);