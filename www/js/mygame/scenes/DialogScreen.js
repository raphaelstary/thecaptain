G.DialogScreen = (function (Event, Key, Width, Height, OptionScreen, MVVMScene, Scenes) {
    "use strict";

    function DialogScreen(services, textPragraphs) {
        this.events = services.events;
        this.timer = services.timer;
        this.textPragraphs = textPragraphs.slice();

        this.services = services;
    }

    DialogScreen.prototype.postConstruct = function () {
        this.itIsOver = false;
        var typing = true;
        var skip = false;
        var active = true;
        var needToShowOptionScreen = false;
        var chosenOption;
        var self = this;

        this.continueSign.setText('skip');

        function startNextParagraph() {
            typing = true;
            skip = false;
            self.dialogTxt.setText('');
            self.continueSign.setText('skip');
            startNextCharacterIteration(self.textPragraphs.shift(), 0);
        }

        function continueWithNextParagraphOrQuit() {
            if (self.textPragraphs.length > 0) {
                startNextParagraph();
            } else {
                self.itIsOver = true;
                self.nextScene();
            }
        }

        this.keyListener = this.events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (self.itIsOver || !active)
                return;

            if (keyBoard[Key.ENTER] || keyBoard[Key.SPACE]) {
                if (typing) {
                    // skip typing
                    skip = true;
                } else {
                    continueWithNextParagraphOrQuit();
                }
            }
        });

        function showOptionScreen(paragraph) {
            if (needToShowOptionScreen) {
                needToShowOptionScreen = false;
                active = false;

                var optionScreen = new OptionScreen(self.services, paragraph.optionA, paragraph.optionB);
                var optionScene = new MVVMScene(self.services, self.services.scenes[Scenes.OPTION_SCREEN], optionScreen, Scenes.OPTION_SCREEN);
                optionScene.show(function (selection) {
                    chosenOption = selection;

                    active = true;
                    continueWithNextParagraphOrQuit();
                });
            }
        }

        function endOfTyping(paragraph) {
            self.dialogTxt.setText(paragraph.text);
            self.continueSign.setText('continue');
            typing = false;
            showOptionScreen(paragraph);
        }

        function writeNextCharacter(paragraph, index) {
            if (skip) {
                endOfTyping(paragraph);
                return;
            }
            self.dialogTxt.setText(self.dialogTxt.data.msg + paragraph.text[index]);

            if (index < paragraph.text.length - 1) {
                startNextCharacterIteration(paragraph, index + 1);
            } else {
                endOfTyping(paragraph);
            }
        }

        function startNextCharacterIteration(paragraph, index) {
            if (index === 0) {
                if (paragraph.optionA) {
                    needToShowOptionScreen = true;
                }
                if (paragraph.condition && paragraph.condition != chosenOption) {
                    continueWithNextParagraphOrQuit();
                    return;
                }
            }

            if (paragraph.text[index] == ' ') {
                writeNextCharacter(paragraph, index);
            } else {
                self.timer.doLater(function () {
                    writeNextCharacter(paragraph, index);
                }, 2);
            }
        }

        self.dialogTxt.setMaxLineLength(Width.get(10, 9));
        self.dialogTxt.setLineHeight(Height.get(10));
        startNextParagraph();
    };

    DialogScreen.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
    };

    return DialogScreen;
})(H5.Event, H5.Key, H5.Width, H5.Height, G.OptionScreen, H5.MVVMScene, G.Scenes);