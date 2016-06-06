G.WorldView = (function (Images) {
    "use strict";

    function WorldView(stage, timer, gridViewHelper) {
        this.stage = stage;
        this.timer = timer;
        this.gridViewHelper = gridViewHelper;

        this.player = null;

        this.staticTiles = [];

        this.moveSpeed = 10;
    }

    WorldView.prototype.preDestroy = function () {
        this.player.remove();
        function removeElem(elem) {
            elem.remove();
        }

        this.staticTiles.forEach(removeElem);
    };

    WorldView.prototype.drawLevel = function (player, grassTiles, wayTiles, signs, callback) {

        var defaultDrawable = this.gridViewHelper.create(1, 1, Images.WAY);
        var defaultHeight = defaultDrawable.data.height;
        // defaultHeight += 2;
        defaultDrawable.remove();

        this.player = this.gridViewHelper.create(player.u, player.v - 1, Images.PLAYER, defaultHeight);

        grassTiles.forEach(function (tile) {
            this.staticTiles.push(this.gridViewHelper.createBackground(tile.u, tile.v, Images.GRASS, 1, defaultHeight));
        }, this);
        wayTiles.forEach(function (tile) {
            this.staticTiles.push(this.gridViewHelper.createBackground(tile.u, tile.v, Images.WAY, 1, defaultHeight));
        }, this);

        signs.forEach(function (tile) {
            this.staticTiles.push(this.gridViewHelper.create(tile.u, tile.v, Images.SIGN, defaultHeight));
        }, this);

        if (callback)
            this.timer.doLater(callback, 1);
    };

    WorldView.prototype.movePlayer = function (changeSet, callback) {
        this.gridViewHelper.move(this.player, changeSet.newU, changeSet.newV - 1, this.moveSpeed, callback);
    };

    return WorldView;
})(G.Images);