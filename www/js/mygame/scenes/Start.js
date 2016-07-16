G.Start = (function (Event, Key, Interaction, MVVMScene, Scene, loadObject, loadString, Storage, iterateEntries,
    localStorage, loadBoolean) {
    "use strict";

    function Start(services, gameState) {
        this.events = services.events;
        this.gameState = gameState;
        this.services = services;
    }

    Start.prototype.postConstruct = function () {
        var hasSavedGame = loadBoolean(Storage.SAVED);
        this.itIsOver = false;
        var self = this;
        this.keyListener = this.events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (self.itIsOver)
                return;

            if (keyBoard[Key.ENTER] || keyBoard[Key.SPACE]) {
                self.itIsOver = true;
                if (hasSavedGame) {
                    showStartMenu();
                } else {
                    self.nextScene();
                }
            }
        });

        this.gamePadListener = this.events.subscribe(Event.GAME_PAD, function (gamePad) {
            if (self.itIsOver)
                return;

            if (gamePad.isAPressed() || gamePad.isStartPressed()) {
                self.itIsOver = true;
                if (hasSavedGame) {
                    showStartMenu();
                } else {
                    self.nextScene();
                }
            }
        });

        function showStartMenu() {
            var callbacks = {
                continue: function () {
                    self.gameState.map = loadString(Storage.MAP);
                    self.gameState.flags = loadObject(Storage.STATE);
                },
                newGame: function () {
                    iterateEntries(Storage, function (storageKey) {
                        localStorage.removeItem(storageKey);
                    });
                }
            };
            var menu = new Interaction(self.services, callbacks);
            var menuScene = new MVVMScene(self.services, self.services.scenes[Scene.INTERACTION], menu, Scene.INTERACTION);
            menuScene.show(function () {
                self.nextScene();
            });
        }
    };

    Start.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
        this.events.unsubscribe(this.gamePadListener);
    };

    return Start;
})(H5.Event, H5.Key, G.Interaction, H5.MVVMScene, G.Scene, H5.loadObject, H5.loadString, G.Storage, H5.iterateEntries,
    H5.lclStorage, H5.loadBoolean);