G.Game = (function (PlayFactory, installPlayerKeyBoard, installPlayerGamePad, Scene, MVVMScene, Dialog, Tile, Event,
    Strings, Menu, localStorage, saveObject, Storage) {
    "use strict";

    function Game(services, map, dialog, npc, walls, background, directions, gameEvents, mapKey, prevMapKey, flags,
        gameCallbacks) {
        this.device = services.device;
        this.events = services.events;
        this.sceneStorage = services.sceneStorage;
        this.stage = services.stage;
        this.timer = services.timer;

        this.scenes = services.scenes;
        this.map = map;
        this.dialog = dialog;
        this.npc = npc;
        this.walls = walls;
        this.background = background;
        this.directions = directions;
        this.gameEvents = gameEvents;
        this.mapKey = mapKey;
        this.prevMapKey = prevMapKey;
        this.flags = flags;
        this.gameCallbacks = gameCallbacks;
        this.services = services;

        this.__paused = false;
        this.__itIsOver = false;
        this.__stop = false;
    }

    Game.prototype.pause = function () {
        this.__pause();
        this.__stop = true;
    };

    Game.prototype.resume = function () {
        this.__stop = false;
        this.__resume();
    };

    Game.prototype.__pause = function () {
        if (this.__stop)
            return;
        this.playerController.pause();
        this.__paused = true;
    };

    Game.prototype.__resume = function () {
        if (this.__stop)
            return;
        this.playerController.resume();
        this.__paused = false;
    };

    Game.prototype.postConstruct = function () {
        this.__paused = false;
        this.__itIsOver = false;
        this.__stop = false;

        var self = this;

        function possibleInteractionStart(dialogId) {
            if (self.__itIsOver)
                return;

            if (Strings.startsWidth(dialogId, Tile.NPC + 'S')) {
                self.interactSymbol.setText('read');
            } else if (Strings.startsWidth(dialogId, Tile.NPC + 'C')) {
                self.interactSymbol.setText('scan');
            } else if (Strings.startsWidth(dialogId, Tile.NPC + 'I')) {
                self.interactSymbol.setText('take');
            } else if (Strings.startsWidth(dialogId, Tile.NPC)) {
                self.interactSymbol.setText('talk');
            }
            self.interactSymbol.show = true;
        }

        function possibleInteractionEnd() {
            if (self.__itIsOver)
                return;

            self.interactSymbol.show = false;
        }

        function interaction(dialogId, callback) {
            if (self.__itIsOver)
                return;

            var dialogScreen = new Dialog(self.services, self.dialog[dialogId], self.flags, self.gameCallbacks);
            var dialogScene = new MVVMScene(self.services, self.services.scenes[Scene.DIALOG], dialogScreen, Scene.DIALOG);
            dialogScene.show(callback);
        }

        function showMenu(callback) {
            if (self.__itIsOver)
                return;

            var callbacks = {
                save: function (callback) {
                    localStorage.setItem(Storage.MAP, self.mapKey);
                    saveObject(Storage.STATE, self.flags);
                    localStorage.setItem(Storage.SAVED, true);
                    interaction('saved', callback);
                }
            };
            var menu = new Menu(self.services, callbacks);
            var menuScene = new MVVMScene(self.services, self.services.scenes[Scene.MENU], menu, Scene.MENU);
            menuScene.show(callback);
        }

        function endMap(nextMap) {
            if (self.__itIsOver)
                return;

            self.__pause();
            self.__itIsOver = true;
            self.nextScene({
                nextMap: nextMap,
                prevMap: self.mapKey
            });
        }

        this.world = PlayFactory.createWorld(this.stage, this.timer, this.device, this.map, this.npc, this.walls,
            this.background, this.directions, this.gameEvents, this.flags, this.gameCallbacks, possibleInteractionStart,
            possibleInteractionEnd, interaction, showMenu, endMap, this.prevMapKey, this.__pause.bind(this),
            this.__resume.bind(this));

        this.world.init(function () {
            if (self.__itIsOver)
                return;

            self.__resume();
        });

        this.cameraListener = this.events.subscribe(Event.TICK_CAMERA, this.world.updateCamera.bind(this.world));

        this.playerController = PlayFactory.createPlayerController(this.world);
        this.__pause();

        this.keyBoardHandler = installPlayerKeyBoard(this.events, this.playerController);
        this.gamePadHandler = installPlayerGamePad(this.events, this.playerController);

        this.interactSymbol.show = false;
    };

    Game.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyBoardHandler);
        this.events.unsubscribe(this.gamePadHandler);
        this.events.unsubscribe(this.cameraListener);
        this.world.preDestroy();
    };

    return Game;
})(G.PlayFactory, G.installPlayerKeyBoard, G.installPlayerGamePad, G.Scene, H5.MVVMScene, G.Dialog, G.Tile, H5.Event,
    H5.Strings, G.Menu, H5.lclStorage, H5.saveObject, G.Storage);