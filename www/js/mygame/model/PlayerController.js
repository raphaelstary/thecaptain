G.PlayerController = (function () {
    "use strict";

    function PlayerController(world) {
        this.world = world;

        this.moving = false;
        this.__paused = false;
    }

    PlayerController.prototype.pause = function () {
        this.__paused = true;
    };

    PlayerController.prototype.resume = function () {
        this.__paused = false;
    };

    PlayerController.prototype.__myCallback = function () {
        this.moving = false;
    };

    PlayerController.prototype.handleKeyLeft = function () {
        if (this.__paused)
            return;
        if (this.moving)
            return;

        this.moving = this.world.moveLeft(this.__myCallback.bind(this));
    };

    PlayerController.prototype.handleKeyRight = function () {
        if (this.__paused)
            return;
        if (this.moving)
            return;

        this.moving = this.world.moveRight(this.__myCallback.bind(this));
    };

    PlayerController.prototype.handleKeyUp = function () {
        if (this.__paused)
            return;
        if (this.moving)
            return;

        this.moving = this.world.moveTop(this.__myCallback.bind(this));
    };

    PlayerController.prototype.handleKeyDown = function () {
        if (this.__paused)
            return;
        if (this.moving)
            return;

        this.moving = this.world.moveBottom(this.__myCallback.bind(this));
    };

    return PlayerController;
})();