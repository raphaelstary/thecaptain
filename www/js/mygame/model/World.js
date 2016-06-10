G.World = (function (iterateEntries) {
    "use strict";

    function World(worldView, domainGridHelper, camera, timer, directions, possibleInteractionStart,
        possibleInteractionEnd, interaction) {
        this.worldView = worldView;
        this.domainGridHelper = domainGridHelper;
        this.camera = camera;
        this.timer = timer;
        this.directions = directions;

        this.possibleInteractionStart = possibleInteractionStart;
        this.possibleInteractionEnd = possibleInteractionEnd;
        this.interaction = interaction;

        this.oneCyle = 60;
    }

    World.prototype.__updateEntitiesZIndex = function () {
        var zIndex = 1;
        this.npcs.concat(this.player)
            .filter(function (entityWrapper) {
                return entityWrapper.drawable.show;
            })
            .sort(function (a, b) {
                return a.v - b.v;
            })
            .reduce(function (prevV, entity) {
                if (prevV < entity.v)
                    zIndex++;
                entity.drawable.setZIndex(zIndex);
                return entity.v;
            }, 0);
    };

    World.prototype.updateCamera = function () {
        this.camera.move(this.player.entity);

        this.allTiles.forEach(function (tile) {
            this.camera.calcScreenPosition(tile.entity, tile.drawable);
        }, this);
    };

    World.prototype.init = function (callback) {
        this.__interacting = false;

        this.player = this.domainGridHelper.getPlayer();

        this.npcs = this.domainGridHelper.getNPCs();
        var grassTiles = this.domainGridHelper.getGrassTiles();
        var wayTiles = this.domainGridHelper.getWayTiles();
        var signs = this.domainGridHelper.getSigns();

        this.allTiles = [];
        this.allTiles.push.apply(this.allTiles, this.npcs);
        this.allTiles.push.apply(this.allTiles, grassTiles);
        this.allTiles.push.apply(this.allTiles, wayTiles);
        this.allTiles.push.apply(this.allTiles, signs);
        this.allTiles.push(this.player);

        this.worldView.drawLevel(this.player, this.npcs, grassTiles, wayTiles, signs, callback);

        iterateEntries(this.directions, function (npcDirections, npcId) {
            this.npcs.some(function (npc) {
                if (npc.type == npcId) {
                    this.autoMoveNPC(npc, npcDirections.slice());
                    return true;
                }
                return false;
            }, this);
        }, this);
    };

    World.prototype.autoMoveNPC = function (entity, nextWayPoints) {
        if (this.__interacting) {
            this.timer.doLater(this.autoMoveNPC.bind(this, entity, nextWayPoints), this.oneCyle * 2);
            return;
        }

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

        this.__interacting = true;
        var self = this;
        this.interaction(this.interactiveTileInRange.type, function () {
            self.__interacting = false;
            if (callback)
                callback();
        });

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
            self.__updateEntitiesZIndex();
            
            var possibleInteractiveTile = self.domainGridHelper.canPlayerInteract(self.player);

            if (possibleInteractiveTile && self.interactiveTileInRange) {
                self.interactiveTileInRange = possibleInteractiveTile;
            }
            if (!self.interactiveTileInRange && possibleInteractiveTile) {
                self.interactiveTileInRange = possibleInteractiveTile;
                self.possibleInteractionStart(possibleInteractiveTile.type);
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