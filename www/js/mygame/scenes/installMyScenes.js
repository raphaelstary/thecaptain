G.installMyScenes = (function (Scenes, MVVMScene, Start, Scene, Event, Game, MapKey, Bridge) {
    "use strict";

    function installMyScenes(services) {
        // create your scenes and add them to the scene manager

        var flags = {};
        var gameCallbacks = {};

        var maps = services.world;
        var dialogs = services.world[MapKey.DIALOG];
        var npcs = services.world[MapKey.NPC];
        var directions = services.world[MapKey.DIRECTIONS];

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

            var gameSceneModel = new Game(services, maps[nextMapKey], dialogs, npcs, directions, nextMapKey, prevMapKey, flags, gameCallbacks);

            return new MVVMScene(services, services.scenes[Scene.GAME], gameSceneModel, Scene.GAME);
        }

        // ##### start bridge scene

        var crew = {
            engineering: {
                name: 'Lt.Cmdr. Scott',
                position: 'Engineering Officer',
                commands: [
                    {
                        name: 'Laser',
                        count: 100,
                        max: 100
                    }, {
                        name: 'Torpedo',
                        count: 5,
                        max: 5
                    }
                ]
            },
            tactics: {
                name: 'Lt. Giotto',
                position: 'Tactical Officer', // or maybe? Operations Officer
                commands: [
                    {
                        name: 'Laser',
                        count: 100,
                        max: 100
                    }, {
                        name: 'Torpedo',
                        count: 5,
                        max: 5
                    }
                ]
            },
            navigation: {
                name: 'Lt. Sulu',
                position: 'Navigation Officer',
                commands: [
                    {
                        name: 'Laser',
                        count: 100,
                        max: 100
                    }, {
                        name: 'Torpedo',
                        count: 5,
                        max: 5
                    }
                ]
            },
            weapons: {
                name: 'Ens. Checkov',
                position: 'Weapons Officer',
                commands: [
                    {
                        name: 'Laser',
                        count: 100,
                        max: 100
                    }, {
                        name: 'Torpedo',
                        count: 5,
                        max: 5
                    }
                ]
            },
            science: {
                name: 'Lt.Cmdr. Spock',
                position: 'Science Officer',
                commands: [
                    {
                        name: 'Laser',
                        count: 100,
                        max: 100
                    }, {
                        name: 'Torpedo',
                        count: 5,
                        max: 5
                    }
                ]
            },
            communication: {
                name: 'Lt. Uhura',
                position: 'Communications Officer',
                commands: [
                    {
                        name: 'Laser',
                        count: 100,
                        max: 100
                    }, {
                        name: 'Torpedo',
                        count: 5,
                        max: 5
                    }
                ]
            }
        };

        scenes.add(function () {
            var bridge = new Bridge(services, crew, dialogs);
            bridge.show();
            bridge.setShields(50, 100);
            bridge.setHull(20, 100);
            bridge.setEnergy(100, 100);
        });

        return scenes;
    }

    return installMyScenes;
})(H5.Scenes, H5.MVVMScene, G.Start, G.Scene, H5.Event, G.Game, G.MapKey, G.Bridge);