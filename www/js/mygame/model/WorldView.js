G.WorldView = (function (Image, Math, iterateEntries, Tile) {
    "use strict";

    function WorldView(stage, timer, gridViewHelper, npcInfo) {
        this.stage = stage;
        this.timer = timer;
        this.gridViewHelper = gridViewHelper;
        this.npcInfo = npcInfo;

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

    WorldView.prototype.drawLevel = function (player, npcs, grassTiles, wayTiles, signs, callback) {

        this.defaultDrawable = this.gridViewHelper.create(1, 1, Image.WAY);
        this.defaultDrawable.show = false;

        player.entity = this.__createEntity(player, Image.PLAYER);
        player.entity.show = false;
        player.drawable = this.__createEntity(player, Image.PLAYER);

        this.player = player;

        npcs.forEach(function (npc) {
            npc.entity = this.__createEntity(npc, this.npcInfo[npc.type]);
            npc.entity.show = false;
            npc.drawable = this.__createEntity(npc, this.npcInfo[npc.type]);

            this.npcs[npc.type] = npc;
        }, this);

        grassTiles.forEach(function (tile) {
            tile.entity = this.__createStatic(tile, Image.GRASS, 1);
            tile.entity.show = false;
            tile.drawable = this.__createStatic(tile, Image.GRASS, 1);

            this.staticTiles.push(tile);
        }, this);

        wayTiles.forEach(function (tile) {
            tile.entity = this.__createStatic(tile, Image.WAY, 1);
            tile.entity.show = false;
            tile.drawable = this.__createStatic(tile, Image.WAY, 1);

            this.staticTiles.push(tile);
        }, this);

        signs.forEach(function (tile) {
            tile.entity = this.__createStatic(tile, Image.SIGN, 2, true);
            tile.entity.show = false;
            tile.drawable = this.__createStatic(tile, Image.SIGN, 2, true);

            this.staticTiles.push(tile);
        }, this);

        if (callback)
            this.timer.doLater(callback, 1);
    };

    WorldView.prototype.__createEntity = function (tile, img) {
        return this.gridViewHelper.create(tile.u, tile.v, img, this.defaultDrawable.data.height, undefined,
            this.__personYOffset.bind(this), [this.defaultDrawable])
    };

    WorldView.prototype.__createStatic = function (tile, img, zIndex, yOffset) {
        var self = this;
        if (yOffset)
            return this.gridViewHelper.createBackground(tile.u, tile.v, img, zIndex, this.defaultDrawable.data.height,
                undefined, function () {
                    return -Math.floor(self.defaultDrawable.getHeight() / 14);
                }, [this.defaultDrawable]);

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
        this.gridViewHelper.move(entity, changeSet.newU, changeSet.newV, this.moveSpeed, callback, undefined,
            this.__personYOffset.bind(this), [this.defaultDrawable]);
    };

    WorldView.prototype.__personYOffset = function () {
        return -Math.floor(this.defaultDrawable.getHeight() / 3 * 2);
    };

    return WorldView;
})(G.Image, Math, H5.iterateEntries, G.Tile);