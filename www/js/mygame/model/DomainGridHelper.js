G.DomainGridHelper = (function (Tiles) {
    "use strict";

    function DomainGridHelper(gridHelper, grid, xTiles, yTiles) {
        this.gridHelper = gridHelper;
        this.grid = grid;
        this.xTiles = xTiles;
        this.yTiles = yTiles;
    }

    DomainGridHelper.prototype.getGrassTiles = function () {
        return this.__getTiles(Tiles.GRASS, true);
    };

    DomainGridHelper.prototype.getWayTiles = function () {
        return this.__getTiles(Tiles.WAY, true);
    };

    DomainGridHelper.prototype.getSigns = function () {
        return this.__getTiles(Tiles.SIGN);
    };

    DomainGridHelper.prototype.getNPCs = function () {
        return this.__getTiles(Tiles.NPC);
    };

    DomainGridHelper.prototype.getPlayer = function () {
        return this.__getTiles(Tiles.PLAYER)[0];
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
            return tileType === Tiles.EMPTY && this.__isMovable(this.grid.getBackground(u, v));
        }
        return false;
    };

    DomainGridHelper.prototype.__isMovable = function (backgroundTileType) {
        return backgroundTileType === Tiles.GRASS || backgroundTileType === Tiles.WAY;
    };

    DomainGridHelper.prototype.canPlayerInteract = function (player) {
        var interactiveTile = false;
        this.gridHelper.getNeighbors(player.u, player.v).some(function (neighbor) {
            if (this.__isInteractionPossible(neighbor.type)) {
                interactiveTile = neighbor;
                return true;
            }
            return false;
        }, this);
        return interactiveTile;
    };

    DomainGridHelper.prototype.__isInteractionPossible = function (tileType) {
        return tileType[0] === Tiles.SIGN || tileType[0] === Tiles.NPC;
    };

    DomainGridHelper.prototype.movePlayer = function (player, u, v) {
        this.grid.set(player.u, player.v, Tiles.EMPTY);
        this.grid.set(u, v, player.type);
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
})(G.Tiles);