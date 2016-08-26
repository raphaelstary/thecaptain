G.World = (function (iterateEntries, Tile, Image, Sound) {
    "use strict";

    function World(worldView, domainGridHelper, camera, timer, directions, gameEvents, npcInfo, flags, gameCallbacks,
        possibleInteractionStart, possibleInteractionEnd, interaction, fight, showMenu, endMap, prevMapKey, pause,
        resume) {
        this.worldView = worldView;
        this.domainGridHelper = domainGridHelper;
        this.camera = camera;
        this.timer = timer;
        this.directions = directions;
        this.npcInfo = npcInfo;
        this.flags = flags;
        this.gameCallbacks = gameCallbacks;
        this.gameEvents = gameEvents;

        this.possibleInteractionStart = possibleInteractionStart;
        this.possibleInteractionEnd = possibleInteractionEnd;
        this.interaction = interaction;
        this.fight = fight;
        this.showMenu = showMenu;
        this.endMap = endMap;
        this.prevMapKey = prevMapKey;

        this.__pause = pause;
        this.__resume = resume;

        this.oneCyle = 60;
        this.__itIsOver = false;
    }

    World.prototype.__updateZIndices = function () {
        var zIndex = 0;
        this.npcs.concat(this.player).concat(this.walls)
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

    World.prototype.init = function (callback) {
        this.__interacting = false;

        this.player = this.domainGridHelper.getPlayer();
        if (this.prevMapKey) {
            var prevMapPortal = this.domainGridHelper.getPortalTileOfPrevMap(this.prevMapKey);
            if (prevMapPortal)
                this.domainGridHelper.movePlayer(this.player, prevMapPortal.u, prevMapPortal.v);
        }

        this.npcsToAdd = {};
        this.npcs = this.domainGridHelper.getNPCs().filter(function (npcTile) {
            var npc = this.npcInfo[npcTile.type];
            if (npc && !this.__isConditionMet(npc)) {
                this.domainGridHelper.remove(npcTile);
                this.npcsToAdd[npcTile.type] = npcTile;
                return false;
            }
            return true;
        }, this);
        var walls = this.walls = this.domainGridHelper.getWalls();
        var backgroundTiles = this.domainGridHelper.getBackgroundTiles();
        var portals = this.domainGridHelper.getPortals();

        this.allTiles = [];
        this.allTiles.push.apply(this.allTiles, this.npcs);
        this.allTiles.push.apply(this.allTiles, walls);
        this.allTiles.push.apply(this.allTiles, backgroundTiles);
        this.allTiles.push.apply(this.allTiles, portals);
        this.allTiles.push(this.player);

        this.worldView.drawLevel(this.player, this.npcs, walls, portals, backgroundTiles, callback);
        iterateEntries(this.directions, this.__startAutoMove, this);
    };

    World.prototype.__startAutoMove = function (allWayPoints, npcId, noLoop, callback) {
        var wayPoints = allWayPoints.filter(this.__isConditionMet, this);
        if (wayPoints.length < 1)
            return;

        this.npcs.some(function (npc) {
            if (npc.type == npcId) {
                this.autoMove(npc, wayPoints, noLoop, callback);
                return true;
            }
            return false;
        }, this);
    };

    World.prototype.startAutoMove = function (destination, callback) {
        var path = this.domainGridHelper.getPath(this.player, destination);
        if (!path || path.length < 1)
            return false;

        var last = this.player;
        var wayPoints = path.map(function (tile) {
            var direction;
            var asset;
            if (last.u > tile.u) {
                direction = 'left';
                asset = Image.SHIP_LEFT;
            } else if (last.u < tile.u) {
                direction = 'right';
                asset = Image.SHIP_RIGHT;
            } else if (last.v > tile.v) {
                direction = 'up';
                asset = Image.SHIP_BACK;
            } else if (last.v < tile.v) {
                direction = 'down';
                asset = Image.SHIP_FRONT;
            }
            last = tile;

            return {
                direction: direction,
                asset: asset
            };
        });
        this.autoMove(this.player, wayPoints, true, callback);

        // this.timer.doLater(callback, 1);

        return true;
    };

    World.prototype.interact = function (callback) {
        if (!this.interactiveTileInRange)
            return false;

        this.__interacting = true;
        var self = this;
        this.interaction(this.interactiveTileInRange.type, function (eventTrigger) {
            if (eventTrigger) {
                self.__process(self.gameEvents[eventTrigger].slice(), callback);
            } else {
                if (callback)
                    callback();
            }
            self.__interacting = false;
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

    World.prototype.__indicateIteraction = function () {
        var possibleInteractiveTile = this.domainGridHelper.canPlayerInteract(this.player);

        if (possibleInteractiveTile && this.interactiveTileInRange) {
            this.interactiveTileInRange = possibleInteractiveTile;
        }
        if (!this.interactiveTileInRange && possibleInteractiveTile) {
            this.interactiveTileInRange = possibleInteractiveTile;
            this.possibleInteractionStart(possibleInteractiveTile.type);
        }
        if (this.interactiveTileInRange && !possibleInteractiveTile) {
            this.interactiveTileInRange = undefined;
            this.possibleInteractionEnd();
        }
    };

    World.prototype.__move = function (entity, u, v, callback) {
        var canMove = this.domainGridHelper.canPlayerMove(entity, u, v);
        if (!canMove)
            return false;

        var self = this;

        function postMove() {
            self.__updateZIndices();
            self.__indicateIteraction();

            var nextMap = self.domainGridHelper.isPlayerOnPortal(entity);
            if (nextMap) {
                self.endMap(nextMap);
            }

            if (entity.type == Tile.PLAYER) {
                var eventTrigger = self.domainGridHelper.isPlayerOnEvent(entity);
                if (eventTrigger) {
                    self.__process(self.gameEvents[eventTrigger].slice(), callback);
                    return;
                }
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

    World.prototype.__process = function (events, callback) {
        if (events.length < 1) {
            if (callback)
                callback();
            return;
        }

        var event = events.shift();

        if (!this.__isConditionMet(event)) {
            this.__process(events, callback);
            return;
        }

        var next = this.__process.bind(this, events, callback);

        if (event.action == 'stop_controls') {
            this.__pause();
            next();

        } else if (event.action == 'resume_controls') {
            this.__resume();
            next();

        } else if (event.action == 'set_flag') {
            this.flags[event.argument] = true;
            next();

        } else if (event.action == 'remove_flag') {
            delete this.flags[event.argument];
            next();

        } else if (event.action == 'increment_flag') {
            if (this.flags[event.argument] === undefined)
                this.flags[event.argument] = 0;
            this.flags[event.argument]++;
            next();

        } else if (event.action == 'decrement_flag') {
            if (this.flags[event.argument] === undefined)
                this.flags[event.argument] = 0;
            this.flags[event.argument]--;
            next();

        } else if (event.action == 'directions') {
            this.__startAutoMove(this.directions[event.argument], event.argument, true, next);

        } else if (event.action == 'dialog') {
            this.interaction(event.argument, next);

        } else if (event.action == 'events') {
            this.__process(this.gameEvents[event.argument].slice(), next);

        } else if (event.action == 'fights') {
            this.fight(event.argument, next);

        } else if (event.action == 'function') {
            this.gameCallbacks[event.argument](next);

        } else if (event.action == 'remove_npc') {
            var currentNpc = null;
            this.npcs.some(function (npc, npcIndex, npcs) {
                var found = npc.type == event.argument;
                if (found) {
                    npcs.splice(npcIndex, 1);
                    currentNpc = npc;
                }
                return found;
            });
            this.domainGridHelper.remove(currentNpc);
            this.worldView.remove(currentNpc, next);
            this.__indicateIteraction();

        } else if (event.action == 'add_npc') {
            var npc = this.npcsToAdd[event.argument];
            delete this.npcsToAdd[event.argument];
            this.domainGridHelper.add(npc);
            this.worldView.add(npc).then(next);
            this.npcs.push(npc);
            this.allTiles.push(npc);

        } else if (event.action == 'add_npc_next') {
            var npcTile = this.domainGridHelper.getEmptyNeighbor(this.player);
            npcTile.type = event.argument;

            this.domainGridHelper.add(npcTile);
            this.worldView.add(npcTile).then(next);
            this.npcs.push(npcTile);
            this.allTiles.push(npcTile);

        } else if (event.action == 'wait') {
            this.timer.doLater(next, parseInt(event.argument));
        }
    };

    World.prototype.autoMove = function (entity, nextWayPoints, noLoop, callback) {
        if (this.__itIsOver)
            return;

        if (this.__interacting) {
            this.timer.doLater(this.autoMove.bind(this, entity, nextWayPoints), this.oneCyle * 2);
            return;
        }

        var self = this;
        var isPlaying = false;
        var lastSound;

        function handleNextWayPoint() {
            if (isPlaying) {
                self.worldView.stop(lastSound);
            }

            if (nextWayPoints.length > 0) {
                self.autoMove(entity, nextWayPoints, noLoop, callback);
                return;
            }

            if (callback)
                callback();
            if (!noLoop)
                self.autoMove(entity, self.directions[entity.type].filter(self.__isConditionMet, self), noLoop,
                    callback);
        }

        function moveForever(move, entity, callback) {
            if (!isPlaying) {
                isPlaying = true;
                lastSound = self.worldView.play(Sound.ATTACK_FLIGHT_LONG);
            }

            function currentMoveCallback() {
                if (success)
                    moveForever(move, entity, callback)
            }

            var success = move(currentMoveCallback, entity);
            if (!success && callback)
                callback();
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

        } else if (wayPoint.direction == 'right_forever') {
            success = true;
            moveForever(this.moveRight.bind(this), entity, handleNextWayPoint);

        } else if (wayPoint.direction == 'up_forever') {
            success = true;
            moveForever(this.moveTop.bind(this), entity, handleNextWayPoint);

        } else if (wayPoint.direction == 'down_forever') {
            success = true;
            moveForever(this.moveBottom.bind(this), entity, handleNextWayPoint);

        } else if (wayPoint.direction == 'left_forever') {
            success = true;
            moveForever(this.moveLeft.bind(this), entity, handleNextWayPoint);
        }

        if (!success) {
            nextWayPoints.unshift(wayPoint);
            this.timer.doLater(handleNextWayPoint, this.oneCyle);
        } else {
            this.worldView.changeState(entity.drawable, wayPoint.asset);
        }
    };

    World.prototype.__isConditionMet = function (element) {
        return !((element.condition && !this.flags[element.condition]) ||
        (element.conditionNegated && this.flags[element.conditionNegated]));
    };

    World.prototype.preDestroy = function () {
        this.__itIsOver = true;
        this.worldView.preDestroy();
    };

    World.prototype.goToMenu = function (callback) {
        this.__interacting = true;
        var self = this;
        this.showMenu(function () {
            self.__interacting = false;
            if (callback)
                callback();
        });
        return true;
    };

    return World;
})(H5.iterateEntries, G.Tile, G.Image, G.Sound);