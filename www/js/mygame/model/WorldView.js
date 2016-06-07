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
        this.player.remove();
        function removeElem(elem) {
            elem.remove();
        }

        this.staticTiles.forEach(removeElem);
        iterateEntries(this.npcs, removeElem)
    };

    WorldView.prototype.drawLevel = function (player, npcs, grassTiles, wayTiles, signs, callback) {

        this.defaultDrawable = this.gridViewHelper.create(1, 1, Images.WAY);
        var defaultHeight = this.defaultDrawable.data.height;
        // defaultHeight += 2;
        this.defaultDrawable.show = false;

        var self = this;
        this.player = this.gridViewHelper.createBackground(player.u, player.v, Images.PLAYER,
            player.v + this.zIndexOffset, defaultHeight, undefined, function () {
                return -Math.floor(self.defaultDrawable.getHeight() / 3 * 2);
            }, [this.defaultDrawable]);

        npcs.forEach(function (npc) {
            this.gridViewHelper.createBackground(npc.u, npc.v, this.npcInfo[npc.type], npc.v + this.zIndexOffset,
                defaultHeight, undefined, function () {
                    return -Math.floor(self.defaultDrawable.getHeight() / 3 * 2);
                }, [this.defaultDrawable]);
        }, this);

        grassTiles.forEach(function (tile) {
            this.staticTiles.push(this.gridViewHelper.createBackground(tile.u, tile.v, Images.GRASS, 1, defaultHeight));
        }, this);
        wayTiles.forEach(function (tile) {
            this.staticTiles.push(this.gridViewHelper.createBackground(tile.u, tile.v, Images.WAY, 1, defaultHeight));
        }, this);

        signs.forEach(function (tile) {
            this.staticTiles.push(
                this.gridViewHelper.createBackground(tile.u, tile.v, Images.SIGN, 2, defaultHeight, undefined,
                    function () {
                        return -Math.floor(self.defaultDrawable.getHeight() / 14);
                    }, [this.defaultDrawable]));
        }, this);

        if (callback)
            this.timer.doLater(callback, 1);
    };

    WorldView.prototype.movePlayer = function (changeSet, callback) {
        var self = this;
        this.gridViewHelper.move(this.player, changeSet.newU, changeSet.newV, this.moveSpeed, callback, undefined,
            function () {
                return -Math.floor(self.defaultDrawable.getHeight() / 3 * 2);
            }, [this.defaultDrawable]);
        this.player.setZIndex(changeSet.newV + this.zIndexOffset);
    };

    return WorldView;
})(G.Images, Math, H5.iterateEntries);