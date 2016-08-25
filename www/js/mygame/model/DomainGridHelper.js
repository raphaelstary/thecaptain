G.DomainGridHelper = (function (Tile, Strings, range, A_STAR) {
    "use strict";

    function DomainGridHelper(gridHelper, grid, camera, gridViewHelper) {
        this.gridHelper = gridHelper;
        this.grid = grid;
        this.camera = camera;
        this.gridViewHelper = gridViewHelper;
    }

    DomainGridHelper.prototype.getBackgroundTiles = function () {
        return this.gridHelper.getTiles(Tile.BACKGROUND, true);
    };

    DomainGridHelper.prototype.getWalls = function () {
        var walls = this.gridHelper.getTiles(Tile.WALL);
        walls.forEach(function (wall) {
            if ((Strings.startsWidth(wall.type, 'WRS') || Strings.startsWidth(wall.type, 'WBS')) && range(0, 100) > 66)
                wall.type = wall.type.substr(0, 2) + 'C' + wall.type.substr(3);
        });
        return walls;
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

    DomainGridHelper.prototype.getPortals = function () {
        return this.gridHelper.getTiles(Tile.MAP, true);
    };

    DomainGridHelper.prototype.canPlayerMove = function (player, u, v) {
        var isNeighborOfPlayer = this.gridHelper.isNeighbor(player.u, player.v, u, v);
        if (isNeighborOfPlayer)
            return this.__isMovable(u, v);
        return false;
    };

    DomainGridHelper.prototype.__isMovable = function (u, v) {
        var tileType = this.grid.get(u, v);
        return tileType === Tile.EMPTY && this.__isTypeMovable(this.grid.getBackground(u, v));
    };

    DomainGridHelper.prototype.__isTypeMovable = function (backgroundTileType) {
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

    DomainGridHelper.prototype.add = function (npc) {
        this.grid.set(npc.u, npc.v, npc.type);
    };

    DomainGridHelper.prototype.getCoordinates = function (x, y) {
        var rect = this.__getVisibleAreaABRect();
        var tile = this.gridViewHelper.getCoordinates(x, y);
        tile.u += rect.start.u;
        tile.v += rect.start.v;
        return tile;
    };

    DomainGridHelper.prototype.__getVisibleAreaABRect = function () {
        var cornerX = this.camera.viewPort.getCornerX();
        var cornerY = this.camera.viewPort.getCornerY();
        var endX = this.camera.viewPort.getEndX();
        var endY = this.camera.viewPort.getEndY();

        var a = this.gridViewHelper.getCoordinates(cornerX, cornerY);
        var b = this.gridViewHelper.getCoordinates(endX, endY);

        return {
            start: a,
            end: b
        }
    };

    DomainGridHelper.prototype.__transformToMovableStateMatrix = function (abRect) {
        var columns = [];
        for (var v = abRect.start.v; v <= abRect.end.v; v++) {
            var row = [];
            for (var u = abRect.start.u; u <= abRect.end.u; u++) {
                row.push(this.__isMovable(u, v) ? 1 : 0);
            }
            columns.push(row);
        }
        return columns;
    };

    DomainGridHelper.prototype.__calcPathWithAStar = function (start, end) {
        var graph = new A_STAR.Graph(this.__transformToMovableStateMatrix(this.__getVisibleAreaABRect()));
        var from = graph.grid[start.v][start.u];
        var to = graph.grid[end.v][end.u];

        return A_STAR.astar.search(graph, from, to);
    };

    function toAbsoluteCoordinates(cameraCoordinates) {
        return function (node) {
            return {
                u: node.y + cameraCoordinates.start.u,
                v: node.x + cameraCoordinates.start.v
            };
        };
    }

    DomainGridHelper.prototype.getPath = function (start, end) {
        if (!start || !end || start.u === undefined || start.v === undefined || end.u === undefined ||
            end.v === undefined)
            return false;

        if (start.u === end.u && start.v === end.v)
            return false;

        var cameraCoordinates = this.__getVisibleAreaABRect();
        var relativeStart = {
            u: start.u - cameraCoordinates.start.u,
            v: start.v - cameraCoordinates.start.v
        };
        var relativeEnd = {
            u: end.u - cameraCoordinates.start.u,
            v: end.v - cameraCoordinates.start.v
        };

        return this.__calcPathWithAStar(relativeStart, relativeEnd).map(toAbsoluteCoordinates(cameraCoordinates));
    };

    DomainGridHelper.prototype.getEmptyNeighbor = function (player) {
        return this.gridHelper.getNeighbors(player.u, player.v).filter(function (neighbor) {
            return neighbor.type == Tile.EMPTY;
        }).reverse()[0];
    };

    return DomainGridHelper;
})(G.Tile, H5.Strings, H5.range, L.A_STAR);