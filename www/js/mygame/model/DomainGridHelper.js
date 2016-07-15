G.DomainGridHelper = (function (Tile, Strings) {
    "use strict";

    function DomainGridHelper(gridHelper, grid) {
        this.gridHelper = gridHelper;
        this.grid = grid;
    }

    DomainGridHelper.prototype.getBackgroundTiles = function () {
        return this.gridHelper.getTiles(Tile.BACKGROUND, true);
    };

    DomainGridHelper.prototype.getWalls = function () {
        return this.gridHelper.getTiles(Tile.WALL);
    };

    DomainGridHelper.prototype.getNPCs = function () {
        return this.gridHelper.getTiles(Tile.NPC);
    };

    DomainGridHelper.prototype.getPlayer = function () {
        return this.gridHelper.getTiles(Tile.PLAYER)[0];
    };

    DomainGridHelper.prototype.getPortalTileOfPrevMap = function (name) {
        return this.gridHelper.getTile(name, true);
    };

    DomainGridHelper.prototype.canPlayerMove = function (player, u, v) {
        var isNeighborOfPlayer = this.gridHelper.isNeighbor(player.u, player.v, u, v);
        if (isNeighborOfPlayer) {
            var tileType = this.grid.get(u, v);
            return tileType === Tile.EMPTY && this.__isMovable(this.grid.getBackground(u, v));
        }
        return false;
    };

    DomainGridHelper.prototype.__isMovable = function (backgroundTileType) {
        return backgroundTileType && (Strings.startsWidth(backgroundTileType, Tile.BACKGROUND) ||
            Strings.startsWidth(backgroundTileType, Tile.MAP));
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
        return tileType[0] === Tile.NPC;
    };

    DomainGridHelper.prototype.movePlayer = function (player, u, v) {
        this.grid.set(player.u, player.v, Tile.EMPTY);
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

    DomainGridHelper.prototype.isPlayerOnPortal = function (entity) {
        var tile = this.grid.getBackground(entity.u, entity.v);
        if (tile && Strings.startsWidth(tile, Tile.MAP)) {
            return tile;
        }
        return false;
    };

    DomainGridHelper.prototype.isPlayerOnEvent = function (entity) {
        var tile = this.grid.getEvent(entity.u, entity.v);
        if (tile && Strings.startsWidth(tile, Tile.EVENT)) {
            return tile;
        }
        return false;
    };

    DomainGridHelper.prototype.remove = function (npc) {
        this.grid.set(npc.u, npc.v, Tile.EMPTY);
    };

    return DomainGridHelper;
})(G.Tile, H5.Strings);