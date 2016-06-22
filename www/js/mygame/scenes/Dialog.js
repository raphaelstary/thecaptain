G.Dialog = (function (Event, Key, Width, Height, Option, MVVMScene, Scene, DialogOption) {
    "use strict";

    function Dialog(services, textPragraphs, flags, callbacks) {
        this.events = services.events;
        this.timer = services.timer;
        this.textPragraphs = textPragraphs.slice();
        this.flags = flags;
        this.callbacks = callbacks;

        this.services = services;
    }

    Dialog.prototype.postConstruct = function () {
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

        this.gamePadListener = this.events.subscribe(Event.GAME_PAD, function (gamePad) {
            if (self.itIsOver || !active)
                return;

            if (gamePad.isAPressed() || gamePad.isStartPressed()) {
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

                var optionScreen = new Option(self.services, paragraph.optionA, paragraph.optionB);
                var optionScene = new MVVMScene(self.services, self.services.scenes[Scene.OPTION], optionScreen, Scene.OPTION);
                optionScene.show(function (selection) {
                    chosenOption = selection;
                    if (paragraph.setterOptionA && selection == DialogOption.A) {
                        self.flags[paragraph.setterOptionA] = true;
                    } else if (paragraph.setterOptionB && selection == DialogOption.B) {
                        self.flags[paragraph.setterOptionB] = true;
                    }
                    if (paragraph.callbackOptionA && selection == DialogOption.A &&
                        self.callbacks[paragraph.callbackOptionA]) {
                        self.callbacks[paragraph.callbackOptionA]();
                    } else if (paragraph.callbackOptionB && selection == DialogOption.B &&
                        self.callbacks[paragraph.callbackOptionB]) {
                        self.callbacks[paragraph.callbackOptionB]();
                    }
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

                if (paragraph.condition || paragraph.conditionNegated) {

                    var isConditionAnAnswer = paragraph.condition &&
                        (paragraph.condition == DialogOption.A || paragraph.condition == DialogOption.B);
                    if (isConditionAnAnswer && paragraph.condition != chosenOption) {
                        continueWithNextParagraphOrQuit();
                        return;
                    }
                    if (!isConditionAnAnswer && paragraph.condition && !self.flags[paragraph.condition]) {
                        continueWithNextParagraphOrQuit();
                        return;
                    }
                    if (!isConditionAnAnswer && paragraph.conditionNegated && self.flags[paragraph.conditionNegated]) {
                        continueWithNextParagraphOrQuit();
                        return;
                    }
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

    Dialog.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
        this.events.unsubscribe(this.gamePadListener);
    };

    return Dialog;
})(H5.Event, H5.Key, H5.Width, H5.Height, G.Option, H5.MVVMScene, G.Scene, G.DialogOption);