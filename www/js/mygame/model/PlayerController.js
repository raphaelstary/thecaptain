G.PlayerController = (function () {
    "use strict";

    function PlayerController(world, domainGridHelper) {
        this.world = world;
        this.domainGridHelper = domainGridHelper;

        this.moving = false;
        this.__paused = false;
    }

    PlayerController.prototype.pause = function () {
        this.__paused = true;
    };

    PlayerController.prototype.resume = function () {
        this.__paused = false;
    };

    PlayerController.prototype.__myCallback = function (callback) {
        this.moving = false;
        if (callback)
            callback();
    };

    PlayerController.prototype.handlePointerDown = function (x, y) {
        //if (this.__paused || this.moving)
        //    return;
    };

    PlayerController.prototype.handlePointerMove = function (x, y) {
        //if (this.__paused || this.moving)
        //    return;
    };

    PlayerController.prototype.handlePointerUp = function (x, y) {
        if (this.__paused || this.moving)
            return;

        var target = this.domainGridHelper.getCoordinates(x, y);
        if (target === undefined || target.u === undefined || target.v === undefined)
            return;

        this.moving = this.world.startAutoMove(target, this.__myCallback.bind(this));
    };

    PlayerController.prototype.handleKeyLeft = function (callback) {
        if (this.__paused)
            return;
        if (this.moving)
            return;

        this.moving = this.world.moveLeft(this.__myCallback.bind(this, callback));
    };

    PlayerController.prototype.handleKeyRight = function (callback) {
        if (this.__paused)
            return;
        if (this.moving)
            return;

        this.moving = this.world.moveRight(this.__myCallback.bind(this, callback));
    };

    PlayerController.prototype.handleKeyUp = function (callback) {
        if (this.__paused)
            return;
        if (this.moving)
            return;

        this.moving = this.world.moveTop(this.__myCallback.bind(this, callback));
    };

    PlayerController.prototype.handleKeyDown = function (callback) {
        if (this.__paused)
            return;
        if (this.moving)
            return;

        this.moving = this.world.moveBottom(this.__myCallback.bind(this, callback));
    };

    PlayerController.prototype.handleInteractionKey = function () {
        if (this.__paused)
            return;
        if (this.moving)
            return;

        this.moving = this.world.interact(this.__myCallback.bind(this));
    };

    PlayerController.prototype.handleMenuKey = function () {
        if (this.__paused)
            return;
        if (this.moving)
            return;

        this.moving = this.world.goToMenu(this.__myCallback.bind(this));
    };

    return PlayerController;
})();