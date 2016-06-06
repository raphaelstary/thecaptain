G.PlayFactory = (function (Grid, GridHelper, GridViewHelper, DomainGridHelper, World, WorldView, PlayerController,
    zero) {

    "use strict";

    return {
        createWorld: function (stage, timer, device, level, possibleInteractionStart, possibleInteractionEnd,
            interaction) {
            var grid = new Grid(level);
            var gridHelper = new GridHelper(grid, grid.xTiles, grid.yTiles);
            var gridViewHelper = new GridViewHelper(stage, device, grid.xTiles, grid.yTiles, zero, zero);
            var domainGridHelper = new DomainGridHelper(gridHelper, grid, grid.xTiles, grid.yTiles);
            var worldView = new WorldView(stage, timer, gridViewHelper);
            return new World(worldView, domainGridHelper, possibleInteractionStart, possibleInteractionEnd, interaction);
        },
        createPlayerController: function (world) {
            return new PlayerController(world);
        }
    };
})(H5.Grid, H5.GridHelper, H5.GridViewHelper, G.DomainGridHelper, G.World, G.WorldView, G.PlayerController, H5.zero);