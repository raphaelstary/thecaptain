G.World = (function (iterateEntries) {
    "use strict";

    function World(worldView, domainGridHelper, timer, directions, possibleInteractionStart, possibleInteractionEnd,
        interaction) {
        this.worldView = worldView;
        this.domainGridHelper = domainGridHelper;
        this.timer = timer;
        this.directions = directions;

        this.possibleInteractionStart = possibleInteractionStart;
        this.possibleInteractionEnd = possibleInteractionEnd;
        this.interaction = interaction;

        this.oneCyle = 60;
    }

    World.prototype.init = function (callback) {
        this.player = this.domainGridHelper.getPlayer();

        var npcs = this.domainGridHelper.getNPCs();
        this.worldView.drawLevel(this.player, npcs, this.domainGridHelper.getGrassTiles(),
            this.domainGridHelper.getWayTiles(), this.domainGridHelper.getSigns(), callback);

        iterateEntries(this.directions, function (npcDirections, npcId) {
            npcs.some(function (npc) {
                if (npc.type == npcId) {
                    this.autoMoveNPC(npc, npcDirections.slice());
                    return true;
                }
                return false;
            }, this);
        }, this);
    };

    World.prototype.autoMoveNPC = function (entity, nextWayPoints) {
        var self = this;

        function handleNextWayPoint() {
            if (nextWayPoints.length > 0) {
                self.autoMoveNPC(entity, nextWayPoints);
            } else {
                self.autoMoveNPC(entity, self.directions[entity.type].slice());
            }
        }

        var wayPoint = nextWayPoints.shift();

        var success = false;
        if (wayPoint == 'left') {
            success = this.moveLeft(handleNextWayPoint, entity);

        } else if (wayPoint == 'right') {
            success = this.moveRight(handleNextWayPoint, entity);

        } else if (wayPoint == 'up') {
            success = this.moveTop(handleNextWayPoint, entity);

        } else if (wayPoint == 'down') {
            success = this.moveBottom(handleNextWayPoint, entity);

        } else if (wayPoint == 'wait') {
            success = true;
            this.timer.doLater(handleNextWayPoint, this.oneCyle);
        }

        if (!success) {
            nextWayPoints.unshift(wayPoint);
            this.timer.doLater(handleNextWayPoint, this.oneCyle);
        }
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
        return this.__move(entity, entity.u, entity.v - 1, callback);
    };

    World.prototype.moveBottom = function (callback, entity) {
        if (!entity)
            return this.__move(this.player, this.player.u, this.player.v + 1, callback);
        return this.__move(entity, entity.u, entity.v + 1, callback);
    };

    World.prototype.__move = function (entity, u, v, callback) {
        var canMove = this.domainGridHelper.canPlayerMove(entity, u, v);
        if (!canMove)
            return false;

        var self = this;

        function postMove() {
            var possibleInteractiveTile = self.domainGridHelper.canPlayerInteract(self.player);

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
            var change = this.domainGridHelper.movePlayer(entity, u, v);
            this.worldView.movePlayer(change, postMove);
        }

        return true;
    };

    return World;
})(H5.iterateEntries);