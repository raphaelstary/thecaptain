G.World = (function (iterateEntries) {
    "use strict";

    function World(worldView, domainGridHelper, directions, possibleInteractionStart, possibleInteractionEnd,
        interaction) {
        this.worldView = worldView;
        this.domainGridHelper = domainGridHelper;
        this.directions = directions;

        this.possibleInteractionStart = possibleInteractionStart;
        this.possibleInteractionEnd = possibleInteractionEnd;
        this.interaction = interaction;
    }

    World.prototype.update = function () {

    };

    World.prototype.init = function (callback) {
        this.player = this.domainGridHelper.getPlayer();

        var npcs = this.domainGridHelper.getNPCs();
        this.worldView.drawLevel(this.player, npcs, this.domainGridHelper.getGrassTiles(),
            this.domainGridHelper.getWayTiles(), this.domainGridHelper.getSigns(), callback);

        iterateEntries(this.directions, function (npcDirections, npcId) {
            var npc;
            npcs.some(function (elem) {
                if (elem.type == npcId) {
                    npc = elem;
                    return true;
                }
                return false;
            });

            var copy = npcDirections.slice();
            var wayPoint = npcDirections.shift();
            if (wayPoint.action == 'left') {
                this.moveLeft(function () {
                }, npc);
            } else if (wayPoint.action == 'right') {
                this.moveRight(function () {
                }, npc);
            } else if (wayPoint.action == 'wait') {

            }
        }, this);
    };

    World.prototype.interact = function (callback) {
        if (!this.interactiveTileInRange)
            return false;

        this.interaction(this.interactiveTileInRange.type, callback);

        return true;
    };

    World.prototype.moveLeft = function (callback, entity) {
        if (!entity)
            return this.__move(this.player, this.player.u - 1, this.player.v, callback);
        return this.__move(entity, entity.u - 1, entity.v, callback);
    };

    World.prototype.moveRight = function (callback, entity) {
        if (!entity)
            return this.__move(this.player, this.player.u + 1, this.player.v, callback);
        return this.__move(entity, entity.u + 1, entity.v, callback);
    };

    World.prototype.moveTop = function (callback, entity) {
        if (!entity)
            return this.__move(this.player, this.player.u, this.player.v - 1, callback);
    };

    World.prototype.moveBottom = function (callback, entity) {
        if (!entity)
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

            if (possibleInteractiveTile && self.interactiveTileInRange) {
                self.interactiveTileInRange = possibleInteractiveTile;
            }
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
})(H5.iterateEntries);