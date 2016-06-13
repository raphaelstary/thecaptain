G.installMyScenes = (function (SceneManager, MVVMScene, StartScreen, Scenes, TapManager, Event, GameScreen,
    MapDataKey) {
    "use strict";

    function installMyScenes(sceneServices) {
        // create your scenes and add them to the scene manager

        var tap = new TapManager();
        sceneServices.tap = tap;
        sceneServices.events.subscribe(Event.POINTER, tap.inputChanged.bind(tap));

        var sceneManager = new SceneManager();

        var startScreen = new MVVMScene(sceneServices, sceneServices.scenes[Scenes.START_SCREEN], new StartScreen(sceneServices), Scenes.START_SCREEN);

        sceneManager.add(startScreen.show.bind(startScreen));

        sceneManager.add(function () {
            var scene = createMapScene(MapDataKey.MAP_BASIC);
            scene.show(mapCallback);
        });

        function mapCallback(mapInfo) {
            var scene = createMapScene(mapInfo.nextMap, mapInfo.prevMap);
            scene.show(mapCallback);
        }

        function createMapScene(nextMapKey, prevMapKey) {
            var gameSceneModel = new GameScreen(sceneServices, sceneServices.worldData[nextMapKey], sceneServices.worldData[MapDataKey.DIALOG], sceneServices.worldData[MapDataKey.NPC], sceneServices.worldData[MapDataKey.DIRECTIONS], nextMapKey, prevMapKey);

            return new MVVMScene(sceneServices, sceneServices.scenes[Scenes.GAME_SCREEN], gameSceneModel, Scenes.GAME_SCREEN);
        }

        return sceneManager;
    }

    return installMyScenes;
})(H5.SceneManager, H5.MVVMScene, G.StartScreen, G.Scenes, H5.TapManager, H5.Event, G.GameScreen, G.MapDataKey);