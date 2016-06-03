G.GameScreen = (function (PlayFactory, installPlayerKeyBoard) {
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

        this.world = PlayFactory.createWorld(this.stage, this.timer, this.device, this.map);

        var self = this;
        this.world.init(function () {
            self.__resume();
        });

        this.playerController = PlayFactory.createPlayerController(this.world);
        this.__pause();

        this.keyBoardHandler = installPlayerKeyBoard(this.events, this.playerController);
    };

    GameScreen.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyBoardHandler);
        this.world.worldView.preDestroy();
    };

    return GameScreen;
})(G.PlayFactory, G.installPlayerKeyBoard);