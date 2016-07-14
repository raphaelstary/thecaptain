G.installMyScenes = (function (Scenes, MVVMScene, Start, Scene, Event, Game, MapKey, createShipFight, Dialog) {
    "use strict";

    function installMyScenes(services) {
        // create your scenes and add them to the scene manager

        var flags = {};
        var gameCallbacks = {};

        var maps = services.world;
        var dialogs = services.world[MapKey.DIALOG];
        var npcs = services.world[MapKey.NPC];
        var walls = services.world[MapKey.WALLS];
        var background = services.world[MapKey.BACKGROUND];
        var directions = services.world[MapKey.DIRECTIONS];

        gameCallbacks[MapKey.REPAIR_SHIP] = function () {
            console.log('setting all values to max');
        };

        var scenes = new Scenes();

        var start = new MVVMScene(services, services.scenes[Scene.START], new Start(services), Scene.START);

        scenes.add(start.show.bind(start));

        scenes.add(function () {
            var game = showMapScene('map_blue');
            // var game = showMapScene(MapKey.OUTPOST);

            // game.pause();
            // var dialogScreen = new Dialog(services, dialogs['admirals_orders']);
            // var dialogScene = new MVVMScene(services, services.scenes[Scene.DIALOG], dialogScreen, Scene.DIALOG);
            // dialogScene.show(function () {
            //     game.resume();
            // });
        });

        function mapCallback(mapInfo) {
            showMapScene(mapInfo.nextMap, mapInfo.prevMap);
        }

        function showMapScene(nextMapKey, prevMapKey) {
            var game = new Game(services, maps[nextMapKey], dialogs, npcs, walls, background, directions, nextMapKey,
                prevMapKey, flags, gameCallbacks);
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