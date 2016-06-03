G.GameScreen = (function (PlayFactory, installPlayerKeyBoard, Scenes, MVVMScene, DialogScreen) {
    "use strict";

    function GameScreen(services, map) {
        this.device = services.device;
        this.events = services.events;
        this.sceneStorage = services.sceneStorage;
        this.stage = services.stage;
        this.timer = services.timer;

        this.scenes = services.scenes;
        this.map = map;
        this.services = services;

        this.__paused = false;
        this.__itIsOver = false;
    }

    GameScreen.prototype.__pause = function () {
        this.playerController.pause();
        this.__paused = true;
    };

    GameScreen.prototype.__resume = function () {
        this.playerController.resume();
        this.__paused = false;
    };

    GameScreen.prototype.postConstruct = function () {
        this.__paused = false;
        this.__itIsOver = false;

        var self = this;

        function possibleInteractionStart() {
            self.interactSymbol.show = true;
        }

        function possibleInteractionEnd() {
            self.interactSymbol.show = false;
        }

        function interaction() {
            var dialogScreen = new MVVMScene(self.services, self.services.scenes[Scenes.DIALOG_SCREEN], new DialogScreen(self.services), Scenes.DIALOG_SCREEN);
            dialogScreen.show();
        }

        this.world = PlayFactory.createWorld(this.stage, this.timer, this.device, this.map, possibleInteractionStart,
            possibleInteractionEnd, interaction);

        this.world.init(function () {
            self.__resume();
        });

        this.playerController = PlayFactory.createPlayerController(this.world);
        this.__pause();

        this.keyBoardHandler = installPlayerKeyBoard(this.events, this.playerController);

        this.interactSymbol.show = false;
    };

    GameScreen.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyBoardHandler);
        this.world.worldView.preDestroy();
    };

    return GameScreen;
})(G.PlayFactory, G.installPlayerKeyBoard, G.Scenes, H5.MVVMScene, G.DialogScreen);