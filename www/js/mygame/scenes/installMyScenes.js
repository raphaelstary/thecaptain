G.installMyScenes = (function (Scenes, MVVMScene, Start, Scene, Event, Game, MapKey, createShipFight, Dialog) {
    "use strict";

    function installMyScenes(services) {
        // create your scenes and add them to the scene manager

        var gameState = {
            map: MapKey.OUTPOST,
            flags: {}
        };
        var gameCallbacks = {};

        var maps = services.world;
        var dialogs = services.world[MapKey.DIALOG];
        var npcs = services.world[MapKey.NPC];
        var walls = services.world[MapKey.WALLS];
        var background = services.world[MapKey.BACKGROUND];
        var directions = services.world[MapKey.DIRECTIONS];
        var gameEvents = services.world[MapKey.EVENTS];

        gameCallbacks[MapKey.REPAIR_SHIP] = function (next) {
            console.log('setting all values to max');
            next();
        };

        var scenes = new Scenes();

        var start = new Start(services, gameState);
        var startScene = new MVVMScene(services, services.scenes[Scene.START], start, Scene.START);

        scenes.add(startScene.show.bind(startScene));

        scenes.add(function () {
            showMapScene(gameState.map);
        });

        function mapCallback(mapInfo) {
            showMapScene(mapInfo.nextMap, mapInfo.prevMap);
        }

        function showMapScene(nextMapKey, prevMapKey) {
            var game = new Game(services, maps[nextMapKey], dialogs, npcs, walls, background, directions, gameEvents, nextMapKey, prevMapKey, gameState.flags, gameCallbacks);
            new MVVMScene(services, services.scenes[Scene.GAME], game, Scene.GAME).show(mapCallback);
            return game;
        }

        // ##### start bridge scene
        // scenes.add(function () {
        //     var fight = createShipFight(services, dialogs);
        //     fight.start();
        // });

        return scenes;
    }

    return installMyScenes;
})(H5.Scenes, H5.MVVMScene, G.Start, G.Scene, H5.Event, G.Game, G.MapKey, G.createShipFight, G.Dialog);