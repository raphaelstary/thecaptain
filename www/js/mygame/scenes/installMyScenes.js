G.installMyScenes = (function (Scenes, MVVMScene, Start, Scene, Event, Game, MapKey, Bridge) {
    "use strict";

    function installMyScenes(services) {
        // create your scenes and add them to the scene manager

        var flags = {};
        var gameCallbacks = {};

        gameCallbacks['ice_cream_achievement'] = function () {
            console.log('ICE CREAM ACHIEVEMENT UNLOCKED');
        };

        var scenes = new Scenes();

        var start = new MVVMScene(services, services.scenes[Scene.START], new Start(services), Scene.START);

        scenes.add(start.show.bind(start));

        // scenes.add(function () {
        //     var scene = createMapScene(MapKey.BASIC);
        //     scene.show(mapCallback);
        // });

        function mapCallback(mapInfo) {
            var scene = createMapScene(mapInfo.nextMap, mapInfo.prevMap);
            scene.show(mapCallback);
        }

        function createMapScene(nextMapKey, prevMapKey) {
            var gameSceneModel = new Game(services, services.world[nextMapKey], services.world[MapKey.DIALOG], services.world[MapKey.NPC], services.world[MapKey.DIRECTIONS], nextMapKey, prevMapKey, flags, gameCallbacks);

            return new MVVMScene(services, services.scenes[Scene.GAME], gameSceneModel, Scene.GAME);
        }

        var bridge = new Bridge(services);

        scenes.add(bridge.show.bind(bridge));

        return scenes;
    }

    return installMyScenes;
})(H5.Scenes, H5.MVVMScene, G.Start, G.Scene, H5.Event, G.Game, G.MapKey, G.Bridge);