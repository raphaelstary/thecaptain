G.WorldView = (function (Image, Math, iterateEntries, Tile) {
    "use strict";

    function WorldView(stage, timer, gridViewHelper, npcInfo, wallInfo, backgroundInfo) {
        this.stage = stage;
        this.timer = timer;
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

    WorldView.prototype.drawLevel = function (player, npcs, walls, backgroundTiles, callback) {

        this.defaultDrawable = this.gridViewHelper.create(1, 1, Image.CLOUD);
        this.defaultDrawable.show = false;

        player.entity = this.__createEntity(player, Image.SHIP_FRONT);
        player.entity.show = false;
        player.drawable = this.__createEntity(player, Image.SHIP_FRONT);

        this.player = player;

        npcs.forEach(function (npc) {
            if (!this.npcInfo[npc.type]) {
                npc.hidden = true;
                return;
            }

            npc.entity = this.__createEntity(npc, this.npcInfo[npc.type].asset);
            npc.entity.show = false;
            npc.drawable = this.__createEntity(npc, this.npcInfo[npc.type].asset);

            this.npcs[npc.type] = npc;
        }, this);

        walls.forEach(function (tile) {
            if (!this.wallInfo[tile.type]) {
                tile.hidden = true;
                return;
            }
            tile.entity = this.__createStatic(tile, this.wallInfo[tile.type], 2, true);
            tile.entity.show = false;
            tile.drawable = this.__createStatic(tile, this.wallInfo[tile.type], 2, true);

            this.staticTiles.push(tile);
        }, this);

        backgroundTiles.forEach(function (tile) {
            tile.entity = this.__createStatic(tile, this.backgroundInfo[tile.type], 1);
            tile.entity.show = false;
            tile.drawable = this.__createStatic(tile, this.backgroundInfo[tile.type], 1);

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

    WorldView.prototype.remove = function (npc) {
        npc.entity.remove();
        npc.drawable.remove();
        delete this.npcs[npc.type];
    };

    return WorldView;
})(G.Image, Math, H5.iterateEntries, G.Tile);