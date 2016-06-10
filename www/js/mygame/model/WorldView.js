G.WorldView = (function (Images, Math, iterateEntries) {
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
        this.zIndexOffset = 2;
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

        this.defaultDrawable = this.gridViewHelper.create(1, 1, Images.WAY);
        var defaultHeight = this.defaultDrawable.data.height;
        // defaultHeight += 2;
        this.defaultDrawable.show = false;

        var self = this;
        var playerEntityDrawable = this.gridViewHelper.createBackground(player.u, player.v, Images.PLAYER,
            player.v + this.zIndexOffset, defaultHeight, undefined, function () {
                return -Math.floor(self.defaultDrawable.getHeight() / 3 * 2);
            }, [this.defaultDrawable]);
        playerEntityDrawable.show = false;
        var playerScreenDrawable = this.gridViewHelper.createBackground(player.u, player.v, Images.PLAYER,
            player.v + this.zIndexOffset, defaultHeight, undefined, function () {
                return -Math.floor(self.defaultDrawable.getHeight() / 3 * 2);
            }, [this.defaultDrawable]);

        player.entity = playerEntityDrawable;
        player.drawable = playerScreenDrawable;

        this.player = player;

        npcs.forEach(function (npc) {
            var entityDrawable = this.gridViewHelper.createBackground(npc.u, npc.v, this.npcInfo[npc.type],
                npc.v + this.zIndexOffset, defaultHeight, undefined, function () {
                    return -Math.floor(self.defaultDrawable.getHeight() / 3 * 2);
                }, [this.defaultDrawable]);
            entityDrawable.show = false;
            var screenDrawable = this.gridViewHelper.createBackground(npc.u, npc.v, this.npcInfo[npc.type],
                npc.v + this.zIndexOffset, defaultHeight, undefined, function () {
                    return -Math.floor(self.defaultDrawable.getHeight() / 3 * 2);
                }, [this.defaultDrawable]);

            npc.entity = entityDrawable;
            npc.drawable = screenDrawable;

            this.npcs[npc.type] = npc;

        }, this);

        grassTiles.forEach(function (tile) {
            var entityDrawable = this.gridViewHelper.createBackground(tile.u, tile.v, Images.GRASS, 1, defaultHeight);
            entityDrawable.show = false;
            var screenDrawable = this.gridViewHelper.createBackground(tile.u, tile.v, Images.GRASS, 1, defaultHeight);

            tile.entity = entityDrawable;
            tile.drawable = screenDrawable;

            this.staticTiles.push(tile);
        }, this);
        wayTiles.forEach(function (tile) {
            var entityDrawable = this.gridViewHelper.createBackground(tile.u, tile.v, Images.WAY, 1, defaultHeight);
            entityDrawable.show = false;
            var screenDrawable = this.gridViewHelper.createBackground(tile.u, tile.v, Images.WAY, 1, defaultHeight);

            tile.entity = entityDrawable;
            tile.drawable = screenDrawable;

            this.staticTiles.push(entityDrawable);
        }, this);

        signs.forEach(function (tile) {
            var entityDrawable = this.gridViewHelper.createBackground(tile.u, tile.v, Images.SIGN, 2, defaultHeight,
                undefined, function () {
                    return -Math.floor(self.defaultDrawable.getHeight() / 14);
                }, [this.defaultDrawable]);
            entityDrawable.show = false;
            var screenDrawable = this.gridViewHelper.createBackground(tile.u, tile.v, Images.SIGN, 2, defaultHeight,
                undefined, function () {
                    return -Math.floor(self.defaultDrawable.getHeight() / 14);
                }, [this.defaultDrawable]);

            tile.entity = entityDrawable;
            tile.drawable = screenDrawable;

            this.staticTiles.push(entityDrawable);
        }, this);

        if (callback)
            this.timer.doLater(callback, 1);
    };

    WorldView.prototype.movePlayer = function (changeSet, callback) {
        var self = this;
        if (changeSet.tile == 'P') {
            this.gridViewHelper.move(this.player.entity, changeSet.newU, changeSet.newV, this.moveSpeed, callback,
                undefined, function () {
                    return -Math.floor(self.defaultDrawable.getHeight() / 3 * 2);
                }, [this.defaultDrawable]);
            // this.player.setZIndex(changeSet.newV + this.zIndexOffset);
        } else {
            this.gridViewHelper.move(this.npcs[changeSet.tile].entity, changeSet.newU, changeSet.newV, this.moveSpeed,
                callback, undefined, function () {
                    return -Math.floor(self.defaultDrawable.getHeight() / 3 * 2);
                }, [this.defaultDrawable]);
            // this.npcs[changeSet.tile].setZIndex(changeSet.newV + this.zIndexOffset);
        }
    };

    return WorldView;
})(G.Images, Math, H5.iterateEntries);