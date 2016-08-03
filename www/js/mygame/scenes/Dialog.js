G.Dialog = (function (Event, Key, Width, Height, Option, MVVMScene, Scene, DialogOption, ScreenShaker) {
    "use strict";

    function Dialog(services, textPragraphs, flags, callbacks) {
        this.events = services.events;
        this.timer = services.timer;
        this.device = services.device;
        this.textPragraphs = textPragraphs.slice();
        this.flags = flags || {};
        this.callbacks = callbacks || {};

        this.services = services;
    }

    Dialog.prototype.__continueWithNextParagraphOrQuit = function () {
        var self = this;
        if (self.textPragraphs.length > 0) {
            self.__startNextParagraph();
        } else {
            self.itIsOver = true;
            self.nextScene(self.__eventTrigger);
        }
    };

    Dialog.prototype.__startNextParagraph = function () {
        var self = this;
        self.typing = true;
        self.skip = false;
        self.dialogTxt.setText('');
        self.continueSign.setText('skip');
        self.__startNextCharacterIteration(self.textPragraphs.shift(), 0);
    };

    Dialog.prototype.__showOptionScreen = function (paragraph) {
        var self = this;
        if (self.needToShowOptionScreen) {
            self.needToShowOptionScreen = false;
            self.active = false;

            var optionScreen = new Option(self.services, paragraph.optionA, paragraph.optionB);
            var optionScene = new MVVMScene(self.services, self.services.scenes[Scene.OPTION], optionScreen, Scene.OPTION);
            optionScene.show(function (selection) {
                self.chosenOption = selection;
                if (paragraph.setterOptionA && selection == DialogOption.A) {
                    self.flags[paragraph.setterOptionA] = true;
                } else if (paragraph.setterOptionB && selection == DialogOption.B) {
                    self.flags[paragraph.setterOptionB] = true;
                }
                self.active = true;
                if (paragraph.callbackOptionA && selection == DialogOption.A &&
                    self.callbacks[paragraph.callbackOptionA]) {
                    self.callbacks[paragraph.callbackOptionA](self.__continueWithNextParagraphOrQuit.bind(self));
                } else if (paragraph.callbackOptionB && selection == DialogOption.B &&
                    self.callbacks[paragraph.callbackOptionB]) {
                    self.callbacks[paragraph.callbackOptionB](self.__continueWithNextParagraphOrQuit.bind(self));
                } else {
                    self.__continueWithNextParagraphOrQuit();
                }
            });
        }
    };

    Dialog.prototype.__endOfTyping = function (paragraph) {
        var self = this;
        self.dialogTxt.setText(paragraph.text);
        self.continueSign.setText('continue');
        self.typing = false;
        self.__showOptionScreen(paragraph);
    };

    Dialog.prototype.__writeNextCharacter = function (paragraph, index) {
        var self = this;
        if (self.skip) {
            self.__endOfTyping(paragraph);
            return;
        }
        self.dialogTxt.setText(self.dialogTxt.data.msg + paragraph.text[index]);

        if (index < paragraph.text.length - 1) {
            self.__startNextCharacterIteration(paragraph, index + 1);
        } else {
            self.__endOfTyping(paragraph);
        }
    };

    Dialog.prototype.__startNextCharacterIteration = function (paragraph, index) {
        var self = this;
        if (index === 0) {
            if (paragraph.condition || paragraph.conditionNegated) {

                var isConditionAnAnswer = paragraph.condition &&
                    (paragraph.condition == DialogOption.A || paragraph.condition == DialogOption.B);
                if (isConditionAnAnswer && paragraph.condition != self.chosenOption) {
                    self.__continueWithNextParagraphOrQuit();
                    return;
                }
                if (!isConditionAnAnswer && paragraph.condition && !self.flags[paragraph.condition]) {
                    self.__continueWithNextParagraphOrQuit();
                    return;
                }
                if (!isConditionAnAnswer && paragraph.conditionNegated && self.flags[paragraph.conditionNegated]) {
                    self.__continueWithNextParagraphOrQuit();
                    return;
                }
            }

            if (paragraph.eventTrigger) {
                self.__eventTrigger = paragraph.eventTrigger;
            }
            if (paragraph.optionA) {
                self.needToShowOptionScreen = true;
            }
        }

        if (paragraph.text[index] == ' ') {
            self.__writeNextCharacter(paragraph, index);
        } else {
            self.timer.doLater(function () {
                self.__writeNextCharacter(paragraph, index);
            }, 2);
        }
    };

    Dialog.prototype.postConstruct = function () {
        this.itIsOver = false;
        var self = this;
        self.skip = false;
        self.active = true;
        self.typing = true;
        self.needToShowOptionScreen = false;

        this.continueSign.setText('skip');

        this.keyListener = this.events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (self.itIsOver || !self.active)
                return;

            if (keyBoard[Key.ENTER] || keyBoard[Key.SPACE]) {
                if (self.typing) {
                    // skip typing
                    self.skip = true;
                } else {
                    self.__continueWithNextParagraphOrQuit();
                }
            }
        });

        this.gamePadListener = this.events.subscribe(Event.GAME_PAD, function (gamePad) {
            if (self.itIsOver || !self.active)
                return;

            if (gamePad.isAPressed() || gamePad.isStartPressed()) {
                if (self.typing) {
                    // skip typing
                    self.skip = true;
                } else {
                    self.__continueWithNextParagraphOrQuit();
                }
            }
        });

        self.dialogTxt.setMaxLineLength(Width.get(10, 8));
        self.dialogTxt.setLineHeight(Height.get(11));
        self.__startNextParagraph();

        // register screen shake
        this.shaker = new ScreenShaker(this.device);
        this.shakerResizeId = this.events.subscribe(Event.RESIZE, this.shaker.resize.bind(this.shaker));
        this.shakerTickId = this.events.subscribe(Event.TICK_MOVE, this.shaker.update.bind(this.shaker));

        this.drawables.forEach(function (drawable) {
            var isBackground = drawable.zIndex == 12;
            if (isBackground)
                return;
            this.shaker.add(drawable);
        }, this);
    };

    Dialog.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
        this.events.unsubscribe(this.gamePadListener);

        // un-register screen shake
        this.events.unsubscribe(this.shakerTickId);
        this.events.unsubscribe(this.shakerResizeId);
    };

    Dialog.prototype.bigShake = function () {
        this.shaker.startBigShake();
    };

    Dialog.prototype.smallShake = function () {
        this.shaker.startSmallShake();
    };

    Dialog.prototype.continueUp = function () {
        var self = this;
        if (self.itIsOver || !self.active)
            return;

        if (self.typing) {
            // skip typing
            self.skip = true;
        } else {
            self.__continueWithNextParagraphOrQuit();
        }
    };

    Dialog.prototype.continueDown = function () {
    };

    return Dialog;
})(H5.Event, H5.Key, H5.Width, H5.Height, G.Option, H5.MVVMScene, G.Scene, G.DialogOption, H5.ScreenShaker);