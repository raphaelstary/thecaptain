G.WorldView = (function (Image, Math, iterateEntries, Tile, Sound) {
    "use strict";

    function WorldView(stage, timer, sounds, gridViewHelper, npcInfo, wallInfo, backgroundInfo) {
        this.stage = stage;
        this.timer = timer;
        this.sounds = sounds;
        this.gridViewHelper = gridViewHelper;
        this.npcInfo = npcInfo;
        this.wallInfo = wallInfo;
        this.backgroundInfo = backgroundInfo;

        this.player = null;

        this.staticTiles = [];
        this.npcs = {};

        this.moveSpeed = 10;
    }

    WorldView.prototype.preDestroy = function () {
        this.defaultDrawable.remove();
        function removeElem(elem) {
            elem.entity.remove();
            elem.drawable.remove();
        }

        removeElem(this.player);
        this.staticTiles.forEach(removeElem);
        iterateEntries(this.npcs, removeElem);
    };

    WorldView.prototype.drawLevel = function (player, npcs, walls, portals, backgroundTiles, callback) {

        this.defaultDrawable = this.gridViewHelper.create(1, 1, Image.CLOUD);
        this.defaultDrawable.show = false;

        player.entity = this.__createEntity(player, Image.SHIP_FRONT);
        player.entity.show = false;
        player.drawable = this.__createEntity(player, Image.SHIP_FRONT);

        this.player = player;

        npcs.forEach(this.add, this);

        walls.forEach(function (tile) {
            if (!this.wallInfo[tile.type]) {
                tile.hidden = true;
                return;
            }
            tile.entity = this.__createEntity(tile, this.wallInfo[tile.type]);
            tile.entity.show = false;
            tile.drawable = this.__createEntity(tile, this.wallInfo[tile.type]);

            this.staticTiles.push(tile);
        }, this);

        portals.forEach(function (tile) {
            tile.entity = this.__createStatic(tile, Image.PORTAL, 0);
            tile.entity.show = false;
            tile.drawable = this.__createStatic(tile, Image.PORTAL, 0);

            this.staticTiles.push(tile);
        }, this);

        backgroundTiles.forEach(function (tile) {
            if (this.backgroundInfo[tile.type] == Image.SPACE) {
                tile.hidden = true;
                return;
            }
            tile.entity = this.__createStatic(tile, this.backgroundInfo[tile.type], 0);
            tile.entity.show = false;
            tile.drawable = this.__createStatic(tile, this.backgroundInfo[tile.type], 0);

            this.staticTiles.push(tile);
        }, this);

        if (callback)
            this.timer.doLater(callback, 1);
    };

    WorldView.prototype.__createEntity = function (tile, img) {
        return this.gridViewHelper.create(tile.u, tile.v, img, this.defaultDrawable.data.height);
    };

    WorldView.prototype.__createStatic = function (tile, img, zIndex) {
        return this.gridViewHelper.createBackground(tile.u, tile.v, img, zIndex, this.defaultDrawable.data.height);
    };

    WorldView.prototype.movePlayer = function (changeSet, callback) {
        if (changeSet.tile == Tile.PLAYER) {
            this.__moveEntity(this.player.entity, changeSet, callback);

        } else if (changeSet.tile[0] == Tile.NPC) {
            this.__moveEntity(this.npcs[changeSet.tile].entity, changeSet, callback);
        }
    };

    WorldView.prototype.__moveEntity = function (entity, changeSet, callback) {
        this.gridViewHelper.move(entity, changeSet.newU, changeSet.newV, this.moveSpeed, callback);
    };

    WorldView.prototype.changeState = function (entity, assetName) {
        entity.data = this.stage.getGraphic(assetName);
    };

    WorldView.prototype.turnPlayerLeft = function () {
        this.changeState(this.player.drawable, Image.SHIP_LEFT);
    };

    WorldView.prototype.turnPlayerRight = function () {
        this.changeState(this.player.drawable, Image.SHIP_RIGHT);
    };

    WorldView.prototype.turnPlayerUp = function () {
        this.changeState(this.player.drawable, Image.SHIP_BACK);
    };

    WorldView.prototype.turnPlayerDown = function () {
        this.changeState(this.player.drawable, Image.SHIP_FRONT);
    };

    WorldView.prototype.remove = function (npc, callback) {
        if (this.npcs[npc.type])
            delete this.npcs[npc.type];

        var isRedFighter = npc.type[1] == 'R';
        var isPirate = npc.type[1] == 'P';
        if (isRedFighter || isPirate) {
            this.explode(npc, function () {
                if (npc.entity)
                    npc.entity.remove();
                if (npc.drawable)
                    npc.drawable.remove();
                if (callback)
                    callback();
            });
            this.sounds.play(Sound.WON_THE_BATTLE);
            return;
        }

        if (npc.entity)
            npc.entity.remove();
        if (npc.drawable)
            npc.drawable.remove();
        if (callback)
            callback();
    };

    WorldView.prototype.play = function (name) {
        return this.sounds.play(name);
    };

    WorldView.prototype.stop = function (id) {
        if (this.sounds.isPlaying(id))
            this.sounds.fadeOut(id);
    };

    WorldView.prototype.add = function (npc) {
        if (!this.npcInfo[npc.type] || !this.npcInfo[npc.type].asset) {
            npc.hidden = true;
            return;
        }

        npc.entity = this.__createEntity(npc, this.npcInfo[npc.type].asset);
        npc.entity.show = false;
        npc.drawable = this.__createEntity(npc, this.npcInfo[npc.type].asset);

        var promise = {
            isFulfilled: false,
            then: function (callback) {
                this.__callback = callback;

                if (this.isFulfilled)
                    callback(this.__arg);
            },
            resolve: function (arg) {
                if (this.isFulfilled)
                    return;

                this.isFulfilled = true;

                if (this.__callback) {
                    this.__callback(arg);
                } else {
                    this.__arg = arg;
                }
            }
        };

        var isPirate = npc.type[1] == 'P';
        if (isPirate) {
            npc.drawable.setAlpha(0);
            npc.drawable.opacityTo(1).setDuration(30).setCallback(promise.resolve.bind(promise));
        } else {
            promise.resolve();
        }

        this.npcs[npc.type] = npc;

        return promise;
    };

    WorldView.prototype.explode = function (npc, callback) {
        npc.drawable.animate(Image.EXPLOSION, Image.EXPLOSION_FRAMES, false).setCallback(callback);
    };

    return WorldView;
})(G.Image, Math, H5.iterateEntries, G.Tile, G.Sound);