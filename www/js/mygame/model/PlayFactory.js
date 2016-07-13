G.PlayFactory = (function (Grid, GridHelper, GridViewHelper, DomainGridHelper, World, WorldView, PlayerController, zero,
    Camera, createViewPort) {

    "use strict";

    return {
        createWorld: function (stage, timer, device, map, npcInfo, wallInfo, backgroundInfo, directions, possibleInteractionStart,
            possibleInteractionEnd, interaction, endMap, prevMapKey) {
            var grid = new Grid(map);
            var gridHelper = new GridHelper(grid);
            var gridViewHelper = new GridViewHelper(stage, device, 16, 9, zero, zero);
            var domainGridHelper = new DomainGridHelper(gridHelper, grid);
            var worldView = new WorldView(stage, timer, gridViewHelper, npcInfo, wallInfo, backgroundInfo);
            var maxCameraPosition = gridViewHelper.getPosition(grid.xTiles - 9, grid.yTiles - 5);
            var camera = new Camera(createViewPort(stage), maxCameraPosition.x, maxCameraPosition.y);
            return new World(worldView, domainGridHelper, camera, timer, directions, possibleInteractionStart, possibleInteractionEnd, interaction, endMap, prevMapKey);
        },
        createPlayerController: function (world) {
            return new PlayerController(world);
        }
    };
})(H5.Grid, H5.GridHelper, H5.GridViewHelper, G.DomainGridHelper, G.World, G.WorldView, G.PlayerController, H5.zero,
    G.Camera, G.createViewPort);