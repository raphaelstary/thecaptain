G.World = (function () {
    "use strict";

    function World(worldView, grid, gridHelper, domainGridHelper, gridViewHelper, possibleInteractionStart,
        possibleInteractionEnd, interaction) {
        this.worldView = worldView;
        this.grid = grid;
        this.gridHelper = gridHelper;
        this.domainGridHelper = domainGridHelper;
        this.gridViewHelper = gridViewHelper;

        this.possibleInteractionStart = possibleInteractionStart;
        this.possibleInteractionEnd = possibleInteractionEnd;
        this.interaction = interaction;
        this.isInteractionPossible = false;
    }

    World.prototype.init = function (callback) {
        this.player = this.domainGridHelper.getPlayer();

        this.worldView.drawLevel(this.player, this.domainGridHelper.getFloorTiles(), this.domainGridHelper.getSigns(),
            callback);
    };
    
    World.prototype.interact = function (callback) {
        this.interaction();
        if (callback)
            callback();
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

            if (!self.isInteractionPossible && self.domainGridHelper.canPlayerInteract(player)) {
                self.isInteractionPossible = true;
                self.possibleInteractionStart();
            }
            if (self.isInteractionPossible && !self.domainGridHelper.canPlayerInteract(player)) {
                self.isInteractionPossible = false;
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