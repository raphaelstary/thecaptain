G.World = (function () {
    "use strict";

    function World(worldView, domainGridHelper, possibleInteractionStart, possibleInteractionEnd, interaction) {
        this.worldView = worldView;
        this.domainGridHelper = domainGridHelper;

        this.possibleInteractionStart = possibleInteractionStart;
        this.possibleInteractionEnd = possibleInteractionEnd;
        this.interaction = interaction;
    }

    World.prototype.init = function (callback) {
        this.player = this.domainGridHelper.getPlayer();

        this.worldView.drawLevel(this.player, this.domainGridHelper.getNPCs(), this.domainGridHelper.getGrassTiles(),
            this.domainGridHelper.getWayTiles(), this.domainGridHelper.getSigns(), callback);
    };

    World.prototype.interact = function (callback) {
        if (!this.interactiveTileInRange)
            return false;

        this.interaction(this.interactiveTileInRange.type, callback);

        return true;
    };

    World.prototype.moveLeft = function (callback) {
        return this.__move(this.player, this.player.u - 1, this.player.v, callback);
    };

    World.prototype.moveRight = function (callback) {
        return this.__move(this.player, this.player.u + 1, this.player.v, callback);
    };

    World.prototype.moveTop = function (callback) {
        return this.__move(this.player, this.player.u, this.player.v - 1, callback);
    };

    World.prototype.moveBottom = function (callback) {
        return this.__move(this.player, this.player.u, this.player.v + 1, callback);
    };

    World.prototype.__move = function (player, u, v, callback) {
        var canMove = this.domainGridHelper.canPlayerMove(player, u, v);
        if (!canMove)
            return false;

        var self = this;

        function postMove() {
            // i donno ... flash smth or highlight smth

            var possibleInteractiveTile = self.domainGridHelper.canPlayerInteract(player);
            if (!self.interactiveTileInRange && possibleInteractiveTile) {
                self.interactiveTileInRange = possibleInteractiveTile;
                self.possibleInteractionStart();
            }
            if (self.interactiveTileInRange && !possibleInteractiveTile) {
                self.interactiveTileInRange = undefined;
                self.possibleInteractionEnd();
            }

            if (callback)
                callback();
        }

        if (canMove) {
            var change = this.domainGridHelper.movePlayer(player, u, v);
            this.worldView.movePlayer(change, postMove);
        }

        return true;
    };

    return World;
})();