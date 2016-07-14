G.World = (function (iterateEntries) {
    "use strict";

    function World(worldView, domainGridHelper, camera, timer, directions, flags, possibleInteractionStart,
        possibleInteractionEnd, interaction, endMap, prevMapKey) {
        this.worldView = worldView;
        this.domainGridHelper = domainGridHelper;
        this.camera = camera;
        this.timer = timer;
        this.directions = directions;
        this.flags = flags;

        this.possibleInteractionStart = possibleInteractionStart;
        this.possibleInteractionEnd = possibleInteractionEnd;
        this.interaction = interaction;
        this.endMap = endMap;
        this.prevMapKey = prevMapKey;

        this.oneCyle = 60;
    }

    World.prototype.__updateEntitiesZIndex = function () {
        var zIndex = 1;
        this.npcs.concat(this.player)
            .filter(function (entityWrapper) {
                return !entityWrapper.hidden && entityWrapper.drawable.show;
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
            if (!tile.hidden)
                this.camera.calcScreenPosition(tile.entity, tile.drawable);
        }, this);
    };

    function removeUnmetConditions(waypoint) {
        return !((waypoint.condition && !this.flags[waypoint.condition]) ||
        (waypoint.conditionNegated && this.flags[waypoint.conditionNegated]));
    }

    World.prototype.init = function (callback) {
        this.__interacting = false;

        this.player = this.domainGridHelper.getPlayer();
        if (this.prevMapKey) {
            var prevMapPortal = this.domainGridHelper.getPortalTileOfPrevMap(this.prevMapKey);
            this.domainGridHelper.movePlayer(this.player, prevMapPortal.u, prevMapPortal.v);
        }

        this.npcs = this.domainGridHelper.getNPCs();
        var walls = this.domainGridHelper.getWalls();
        var backgroundTiles = this.domainGridHelper.getBackgroundTiles();

        this.allTiles = [];
        this.allTiles.push.apply(this.allTiles, this.npcs);
        this.allTiles.push.apply(this.allTiles, walls);
        this.allTiles.push.apply(this.allTiles, backgroundTiles);
        this.allTiles.push(this.player);

        this.worldView.drawLevel(this.player, this.npcs, walls, backgroundTiles, callback);

        iterateEntries(this.directions, function (npcDirections, npcId) {
            var directions = npcDirections.filter(removeUnmetConditions, this);
            if (directions.length < 1)
                return;

            this.npcs.some(function (npc) {
                if (npc.type == npcId) {
                    this.autoMoveNPC(npc, directions);
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
                self.autoMoveNPC(entity, self.directions[entity.type].filter(removeUnmetConditions, self));
            }
        }

        var wayPoint = nextWayPoints.shift();

        var success = false;
        if (wayPoint.direction == 'left') {
            success = this.moveLeft(handleNextWayPoint, entity);

        } else if (wayPoint.direction == 'right') {
            success = this.moveRight(handleNextWayPoint, entity);

        } else if (wayPoint.direction == 'up') {
            success = this.moveTop(handleNextWayPoint, entity);

        } else if (wayPoint.direction == 'down') {
            success = this.moveBottom(handleNextWayPoint, entity);

        } else if (wayPoint.direction == 'wait') {
            success = true;
            this.timer.doLater(handleNextWayPoint, this.oneCyle);
        }

        if (!success) {
            nextWayPoints.unshift(wayPoint);
            this.timer.doLater(handleNextWayPoint, this.oneCyle);
        } else {
            this.worldView.changeState(entity.drawable, wayPoint.asset);
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
        if (!entity) {
            var success = this.__move(this.player, this.player.u - 1, this.player.v, callback);
            if (success)
                this.worldView.turnPlayerLeft();
            return success;
        }
        return this.__move(entity, entity.u - 1, entity.v, callback);
    };

    World.prototype.moveRight = function (callback, entity) {
        if (!entity) {
            var success = this.__move(this.player, this.player.u + 1, this.player.v, callback);
            if (success)
                this.worldView.turnPlayerRight();
            return success;
        }
        return this.__move(entity, entity.u + 1, entity.v, callback);
    };

    World.prototype.moveTop = function (callback, entity) {
        if (!entity) {
            var success = this.__move(this.player, this.player.u, this.player.v - 1, callback);
            if (success)
                this.worldView.turnPlayerUp();
            return success;
        }
        return this.__move(entity, entity.u, entity.v - 1, callback);
    };

    World.prototype.moveBottom = function (callback, entity) {
        if (!entity) {
            var success = this.__move(this.player, this.player.u, this.player.v + 1, callback);
            if (success)
                this.worldView.turnPlayerDown();
            return success;
        }
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

            var nextMap = self.domainGridHelper.isPlayerOnPortal(entity);
            if (nextMap) {
                self.endMap(nextMap);
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