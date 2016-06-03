G.StartScreen = (function (Event, Key) {
    "use strict";

    function StartScreen(services) {
        this.events = services.events;
    }

    StartScreen.prototype.postConstruct = function () {
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

    StartScreen.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
    };

    return StartScreen;
})(H5.Event, H5.Key);