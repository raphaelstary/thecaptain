G.Start = (function (Event, Key, Interaction, MVVMScene, Scene, loadObject, loadString, Storage, iterateEntries,
    localStorage, loadBoolean, Sound) {
    "use strict";

    function Start(services, gameState) {
        this.events = services.events;
        this.sounds = services.sounds;
        this.timer = services.timer;
        this.gameState = gameState;
        this.services = services;
    }

    //noinspection JSUnusedGlobalSymbols
    Start.prototype.startUp = function () {
        this.__showStartMenu();
    };

    //noinspection JSUnusedGlobalSymbols
    Start.prototype.startDown = function () {
    };

    Start.prototype.postConstruct = function () {
        this.startBtn.show = false;
        this.startTxt.show = false;

        var self = this;
        this.stopMusic = false;
        this.lastLoop = 0;
        this.lastLoopAlt = 0;
        this.menuIsVisible = false;

        function loopMusic() {
            if (self.stopMusic)
                return;

            var loop = self.lastLoop = self.sounds.play(Sound.MUSIC_START_LOOP);
            self.sounds.notifyOnce(loop, 'end', loopMusic);
        }

        function loopMusicAlt() {
            if (self.stopMusic)
                return;

            var loop = self.lastLoopAlt = self.sounds.play(Sound.MUSIC_START_LOOP);
            self.sounds.notifyOnce(loop, 'end', loopMusicAlt);
        }

        this.__once = true;

        var theme = this.sounds.play(Sound.MUSIC_THEME);

        this.sounds.notifyOnce(theme, 'end', function () {
            if (!self.menuIsVisible) {
                self.startBtn.show = true;
                self.startTxt.show = true;
            }

            loopMusic();
            self.timer.doLater(loopMusicAlt, 10 / 2 * 60);
        });

        var hasSavedGame = loadBoolean(Storage.SAVED);
        this.itIsOver = false;
        this.keyListener = this.events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (self.itIsOver)
                return;

            if (keyBoard[Key.ENTER] || keyBoard[Key.SPACE]) {
                self.itIsOver = true;
                if (hasSavedGame) {
                    self.__showStartMenu();
                } else {
                    self.__fadeOut();
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
                    self.__fadeOut();
                }
            }
        });

    };

    Start.prototype.__showStartMenu = function () {
        if (!this.__once)
            return;
        this.__once = false;
        this.menuIsVisible = true;

        var self = this;
        var callbacks = {
            continue: function () {
                self.gameState.map = loadString(Storage.MAP);
                self.gameState.flags = loadObject(Storage.STATE);
                self.gameState.ship = loadObject(Storage.SHIP);
                self.gameState.crew = loadObject(Storage.CREW);
            }
        };
        this.startBtn.show = false;
        this.startTxt.show = false;
        var menu = new Interaction(this.services, callbacks);
        var menuScene = new MVVMScene(this.services, this.services.scenes[Scene.INTERACTION], menu, Scene.INTERACTION);
        menuScene.show(this.__fadeOut.bind(this));
    };

    Start.prototype.__fadeOut = function () {
        var self = this;
        self.stopMusic = true;
        self.sounds.fadeOut(self.lastLoopAlt);
        self.sounds.fadeOut(self.lastLoop);
        self.sounds.play(Sound.MUSIC_START);
        this.timer.doLater(function () {
            self.nextScene();
        }, 30);
    };

    Start.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
        this.events.unsubscribe(this.gamePadListener);
    };

    return Start;
})(H5.Event, H5.Key, G.Interaction, H5.MVVMScene, G.Scene, H5.loadObject, H5.loadString, G.Storage, H5.iterateEntries,
    H5.lclStorage, H5.loadBoolean, G.Sound);