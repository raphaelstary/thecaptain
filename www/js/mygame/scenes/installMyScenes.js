G.installMyScenes = (function (Scenes, MVVMScene, Start, Scene, Event, Game, MapKey) {
    "use strict";

    function installMyScenes(services) {
        // create your scenes and add them to the scene manager

        var flags = {};
        var gameCallbacks = {};

        gameCallbacks['ice_cream_achievement'] = function () {
            console.log('ICE CREAM ACHIEVEMENT UNLOCKED');
        };

        var scenes = new Scenes();

        var startScreen = new MVVMScene(services, services.scenes[Scene.START], new Start(services), Scene.START);

        scenes.add(startScreen.show.bind(startScreen));

        scenes.add(function () {
            var scene = createMapScene(MapKey.BASIC);
            scene.show(mapCallback);
        });

        function mapCallback(mapInfo) {
            var scene = createMapScene(mapInfo.nextMap, mapInfo.prevMap);
            scene.show(mapCallback);
        }

        function createMapScene(nextMapKey, prevMapKey) {
            var gameSceneModel = new Game(services, services.worldData[nextMapKey], services.worldData[MapKey.DIALOG], services.worldData[MapKey.NPC], services.worldData[MapKey.DIRECTIONS], nextMapKey, prevMapKey, flags, gameCallbacks);

            return new MVVMScene(services, services.scenes[Scene.GAME], gameSceneModel, Scene.GAME);
        }

        return scenes;
    }

    return installMyScenes;
})(H5.Scenes, H5.MVVMScene, G.Start, G.Scene, H5.Event, G.Game, G.MapKey);