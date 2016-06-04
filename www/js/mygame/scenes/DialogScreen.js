G.DialogScreen = (function (Event, Key) {
    "use strict";

    function DialogScreen(services, text) {
        this.events = services.events;
        this.text = text;
    }

    DialogScreen.prototype.postConstruct = function () {
        this.dialogTxt.setText(this.text);

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
    };

    DialogScreen.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
    };

    return DialogScreen;
})(H5.Event, H5.Key);