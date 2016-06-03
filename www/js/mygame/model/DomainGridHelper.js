G.DomainGridHelper = (function () {
    "use strict";

    function DomainGridHelper(gridHelper, grid, xTiles, yTiles) {
        this.gridHelper = gridHelper;
        this.grid = grid;
        this.xTiles = xTiles;
        this.yTiles = yTiles;
    }

    var BackgroundTile = {
        // backgroud tiles
        EMPTY: 0,
        FLOOR: 'F'
    };

    var ForegroundTile = {
        // foreground tiles
        EMPTY: 0,
        PLAYER: 'P'
    };

    DomainGridHelper.prototype.getFloorTiles = function () {
        return this.__getTiles(BackgroundTile.FLOOR, true);
    };

    DomainGridHelper.prototype.getPlayer = function () {
        return this.__getTiles(ForegroundTile.PLAYER)[0];
    };

    DomainGridHelper.prototype.__getTiles = function (name, isBackground) {
        var parts = [];

        for (var y = 0; y < this.yTiles; y++) {
            for (var x = 0; x < this.xTiles; x++) {
                var tile = !isBackground ? this.grid.get(x, y) : this.grid.getBackground(x, y);
                if (tile[0] === name)
                    parts.push({
                        u: x,
                        v: y,
                        type: tile
                    });
            }
        }

        return parts;
    };

    DomainGridHelper.prototype.canPlayerMove = function (player, u, v) {
        var isNeighborOfPlayer = this.gridHelper.isNeighbor(player.u, player.v, u, v);
        if (isNeighborOfPlayer) {
            var tileType = this.grid.get(u, v);
            return tileType === ForegroundTile.EMPTY && this.__isMovable(this.grid.getBackground(u, v));
        }
        return false;
    };

    DomainGridHelper.prototype.__isMovable = function (backgroundTileType) {
        return backgroundTileType === BackgroundTile.FLOOR;
    };

    DomainGridHelper.prototype.movePlayer = function (player, u, v) {
        this.grid.set(player.u, player.v, ForegroundTile.EMPTY);
        this.grid.set(u, v, ForegroundTile.PLAYER);
        var change = {
            newU: u,
            newV: v,
            tile: player.type
        };
        player.u = u;
        player.v = v;

        return change;
    };

    return DomainGridHelper;
})();