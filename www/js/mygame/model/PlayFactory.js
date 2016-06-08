G.PlayFactory = (function (Grid, GridHelper, GridViewHelper, DomainGridHelper, World, WorldView, PlayerController,
    zero) {

    "use strict";

    return {
        createWorld: function (stage, timer, device, map, npcInfo, directions, possibleInteractionStart,
            possibleInteractionEnd, interaction) {
            var grid = new Grid(map);
            var gridHelper = new GridHelper(grid, grid.xTiles, grid.yTiles);
            var gridViewHelper = new GridViewHelper(stage, device, grid.xTiles, grid.yTiles, zero, zero);
            var domainGridHelper = new DomainGridHelper(gridHelper, grid, grid.xTiles, grid.yTiles);
            var worldView = new WorldView(stage, timer, gridViewHelper, npcInfo);
            return new World(worldView, domainGridHelper, timer, directions, possibleInteractionStart, possibleInteractionEnd, interaction);
        },
        createPlayerController: function (world) {
            return new PlayerController(world);
        }
    };
})(H5.Grid, H5.GridHelper, H5.GridViewHelper, G.DomainGridHelper, G.World, G.WorldView, G.PlayerController, H5.zero);