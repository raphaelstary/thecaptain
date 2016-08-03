G.Start = (function (Event, Key, Interaction, MVVMScene, Scene, loadObject, loadString, Storage, iterateEntries,
    localStorage, loadBoolean) {
    "use strict";

    function Start(services, gameState) {
        this.events = services.events;
        this.gameState = gameState;
        this.services = services;
    }

    Start.prototype.startUp = function () {
        this.__showStartMenu();
    };

    Start.prototype.startDown = function () {
    };

    Start.prototype.postConstruct = function () {
        this.__once = true;

        var hasSavedGame = loadBoolean(Storage.SAVED);
        this.itIsOver = false;
        var self = this;
        this.keyListener = this.events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (self.itIsOver)
                return;

            if (keyBoard[Key.ENTER] || keyBoard[Key.SPACE]) {
                self.itIsOver = true;
                if (hasSavedGame) {
                    self.__showStartMenu();
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
                    self.__showStartMenu();
                } else {
                    self.nextScene();
                }
            }
        });

    };

    Start.prototype.__showStartMenu = function () {
        if (!this.__once)
            return;
        this.__once = false;

        var self = this;
        var callbacks = {
            continue: function () {
                self.gameState.map = loadString(Storage.MAP);
                self.gameState.flags = loadObject(Storage.STATE);
                self.gameState.ship = loadObject(Storage.SHIP);
            }
        };
        this.startBtn.show = false;
        this.startTxt.show = false;
        var menu = new Interaction(this.services, callbacks);
        var menuScene = new MVVMScene(this.services, this.services.scenes[Scene.INTERACTION], menu, Scene.INTERACTION);
        menuScene.show(this.nextScene.bind(this));
    };

    Start.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
        this.events.unsubscribe(this.gamePadListener);
    };

    return Start;
})(H5.Event, H5.Key, G.Interaction, H5.MVVMScene, G.Scene, H5.loadObject, H5.loadString, G.Storage, H5.iterateEntries,
    H5.lclStorage, H5.loadBoolean);