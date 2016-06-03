G.WorldView = (function (Images) {
    "use strict";

    function WorldView(stage, timer, gridViewHelper) {
        this.stage = stage;
        this.timer = timer;
        this.gridViewHelper = gridViewHelper;

        this.player = null;

        this.floorTiles = [];

        this.moveSpeed = 10;
    }

    WorldView.prototype.preDestroy = function () {
        this.player.remove();
        function removeElem(elem) {
            elem.remove();
        }

        this.floorTiles.forEach(removeElem);
    };

    WorldView.prototype.drawLevel = function (player, floorTiles, callback) {

        var defaultDrawable = this.gridViewHelper.create(1, 1, Images.FLOOR);
        var defaultHeight = defaultDrawable.data.height;
        // defaultHeight += 2;
        defaultDrawable.remove();

        this.player = this.gridViewHelper.create(player.u, player.v, Images.PLAYER, defaultHeight);

        floorTiles.forEach(function (tile) {
            this.floorTiles.push(this.gridViewHelper.createBackground(tile.u, tile.v, Images.FLOOR, 1, defaultHeight));
        }, this);

        if (callback)
            this.timer.doLater(callback, 1);
    };

    WorldView.prototype.movePlayer = function (changeSet, callback) {
        this.gridViewHelper.move(this.player, changeSet.newU, changeSet.newV, this.moveSpeed, callback);
    };

    return WorldView;
})(G.Images);