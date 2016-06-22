G.Game = (function (PlayFactory, installPlayerKeyBoard, installPlayerGamePad, Scene, MVVMScene, Dialog, Tile, Event) {
    "use strict";

    function Game(services, map, dialog, npc, directions, mapKey, prevMapKey, flags, gameCallbacks) {
        this.device = services.device;
        this.events = services.events;
        this.sceneStorage = services.sceneStorage;
        this.stage = services.stage;
        this.timer = services.timer;

        this.scenes = services.scenes;
        this.map = map;
        this.dialog = dialog;
        this.npc = npc;
        this.directions = directions;
        this.mapKey = mapKey;
        this.prevMapKey = prevMapKey;
        this.flags = flags;
        this.gameCallbacks = gameCallbacks;
        this.services = services;

        this.__paused = false;
        this.__itIsOver = false;
    }

    Game.prototype.__pause = function () {
        this.playerController.pause();
        this.__paused = true;
    };

    Game.prototype.__resume = function () {
        this.playerController.resume();
        this.__paused = false;
    };

    Game.prototype.postConstruct = function () {
        this.__paused = false;
        this.__itIsOver = false;

        var self = this;

        function possibleInteractionStart(dialogId) {
            if (self.__itIsOver)
                return;

            if (dialogId[0] == Tile.NPC) {
                self.interactSymbol.setText('talk');
            } else if (dialogId[0] == Tile.SIGN) {
                self.interactSymbol.setText('read');
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

        this.world = PlayFactory.createWorld(this.stage, this.timer, this.device, this.map, this.npc, this.directions,
            possibleInteractionStart, possibleInteractionEnd, interaction, endMap, this.prevMapKey);

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
        this.world.worldView.preDestroy();
    };

    return Game;
})(G.PlayFactory, G.installPlayerKeyBoard, G.installPlayerGamePad, G.Scene, H5.MVVMScene, G.Dialog, G.Tile, H5.Event);