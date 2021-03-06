G.PlayFactory = (function (Grid, GridHelper, GridViewHelper, DomainGridHelper, World, WorldView, PlayerController, zero,
    Camera, createViewPort) {

    "use strict";

    return {
        createWorld: function (stage, timer, sounds, device, map, npcInfo, wallInfo, backgroundInfo, directions,
            gameEvents, flags, bridgeCrew, gameCallbacks, possibleInteractionStart, possibleInteractionEnd, interaction,
            fight, showMenu, endMap, prevMapKey, pause, resume) {
            var grid = new Grid(map);
            var gridViewHelper = new GridViewHelper(stage, device, 16, 9, zero, zero);
            var worldView = new WorldView(stage, timer, sounds, gridViewHelper, npcInfo, wallInfo, backgroundInfo);
            var maxCameraPosition = gridViewHelper.getPosition(grid.xTiles - 9, grid.yTiles - 5);
            var camera = new Camera(createViewPort(stage), maxCameraPosition.x, maxCameraPosition.y);
            var domainGridHelper = new DomainGridHelper(new GridHelper(grid), grid, camera, gridViewHelper);
            return new World(worldView, domainGridHelper, camera, timer, directions, gameEvents, npcInfo, flags, bridgeCrew, gameCallbacks, possibleInteractionStart, possibleInteractionEnd, interaction, fight, showMenu, endMap, prevMapKey, pause, resume);
        },
        createPlayerController: function (world, domainGridHelper) {
            return new PlayerController(world, domainGridHelper);
        }
    };
})(H5.Grid, H5.GridHelper, H5.GridViewHelper, G.DomainGridHelper, G.World, G.WorldView, G.PlayerController, H5.zero,
    G.Camera, G.createViewPort);