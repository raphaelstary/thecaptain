G.Game = (function (PlayFactory, installPlayerKeyBoard, installPlayerGamePad, Scene, MVVMScene, Dialog, Tile, Event,
    Strings, Menu, localStorage, saveObject, Storage, createShipFight, MapKey, Sound, Key, iterateEntries) {
    "use strict";

    function Game(services, map, dialog, npc, walls, background, directions, fights, gameEvents, mapKey, prevMapKey,
        flags, ship, bridgeCrew, crew, gameCallbacks) {
        this.device = services.device;
        this.events = services.events;
        this.sceneStorage = services.sceneStorage;
        this.stage = services.stage;
        this.timer = services.timer;
        this.sounds = services.sounds;

        this.scenes = services.scenes;
        this.map = map;
        this.dialog = dialog;
        this.npc = npc;
        this.walls = walls;
        this.background = background;
        this.directions = directions;
        this.fights = fights;
        this.gameEvents = gameEvents;
        this.mapKey = mapKey;
        this.prevMapKey = prevMapKey;
        this.flags = flags;
        this.ship = ship;
        this.bridgeCrew = bridgeCrew;
        this.crew = crew;
        this.gameCallbacks = gameCallbacks;
        this.services = services;

        this.__paused = false;
        this.__itIsOver = false;
        this.__stop = false;
    }

    Game.prototype.pause = function () {
        this.__pause();
        this.__stop = true;
    };

    Game.prototype.resume = function () {
        this.__stop = false;
        this.__resume();
    };

    Game.prototype.__pause = function () {
        if (this.__stop)
            return;
        this.playerController.pause();
        this.__paused = true;
    };

    Game.prototype.__resume = function () {
        if (this.__stop)
            return;
        this.playerController.resume();
        this.__paused = false;
    };

    Game.prototype.postConstruct = function () {
        this.__paused = false;
        this.__itIsOver = false;
        this.__stop = false;

        var self = this;
        var interactionVisible = false;
        var menuIconVisible = true;

        function possibleInteractionStart(dialogId) {
            if (self.__itIsOver)
                return;

            if (Strings.startsWidth(dialogId, Tile.NPC + 'S')) {
                self.interactSymbol.setText('read');
            } else if (Strings.startsWidth(dialogId, Tile.NPC + 'C')) {
                self.interactSymbol.setText('scan');
            } else if (Strings.startsWidth(dialogId, Tile.NPC + 'I')) {
                self.interactSymbol.setText('take');
            } else if (Strings.startsWidth(dialogId, Tile.NPC)) {
                self.interactSymbol.setText('talk');
            }
            interactionVisible = true;
            self.interactSymbol.show = true;
            self.interactButton.show = true;
        }

        function possibleInteractionEnd() {
            if (self.__itIsOver)
                return;

            interactionVisible = false;
            self.interactSymbol.show = false;
            self.interactButton.show = false;
        }

        function interact(ignoreIcons, dialogId, callback) {
            if (!ignoreIcons) {
                if (menuIconVisible) {
                    self.menuButton.show = false;
                    self.menuText.show = false;
                }

                if (interactionVisible) {
                    self.interactSymbol.show = false;
                    self.interactButton.show = false;
                }
            }

            if (!self.dialog[dialogId])
                throw 'missing dialog with id: ' + dialogId;
                
            var dialogScreen = new Dialog(self.services, self.dialog[dialogId], self.flags, self.gameCallbacks);
            var dialogScene = new MVVMScene(self.services, self.services.scenes[Scene.DIALOG], dialogScreen, Scene.DIALOG);
            dialogScene.show(function (eventTrigger) {
                if (!ignoreIcons) {
                    if (menuIconVisible) {
                        self.menuButton.show = true;
                        self.menuText.show = true;
                    }
                    if (interactionVisible) {
                        self.interactSymbol.show = true;
                        self.interactButton.show = true;
                    }
                }
                if (callback)
                    callback(eventTrigger);
            });
        }

        function interaction(dialogId, callback, ignoreIcons) {
            if (self.__itIsOver)
                return;

            if (Strings.startsWidth(dialogId, Tile.NPC + 'S')) {
                // read
                self.sounds.play(Sound.INTERACT);
            } else if (Strings.startsWidth(dialogId, Tile.NPC + 'C')) {
                // scan
                self.sounds.play(Sound.INTERACT);
            } else if (Strings.startsWidth(dialogId, Tile.NPC + 'I')) {
                // take
                self.sounds.play(Sound.TAKE);
            } else if (Strings.startsWidth(dialogId, Tile.NPC)) {
                // talk
                self.sounds.play(Sound.INTERACT);
            }

            self.timer.doLater(interact.bind(undefined, ignoreIcons, dialogId, callback), 30);
        }

        function fight(enemyId, callback) {
            self.__stopMusic();

            if (menuIconVisible) {
                self.menuButton.show = false;
                self.menuText.show = false;
            }
            if (interactionVisible) {
                self.interactSymbol.show = false;
                self.interactButton.show = false;
            }

            var fight = createShipFight(self.services, self.dialog, self.ship, self.fights[enemyId], self.bridgeCrew,
                self.crew, self.flags);
            fight.start(function (isVictorious, hull) {
                if (menuIconVisible) {
                    self.menuButton.show = true;
                    self.menuText.show = true;
                }
                if (interactionVisible) {
                    self.interactSymbol.show = true;
                    self.interactButton.show = true;
                }

                if (!isVictorious) {
                    self.world.worldView.explode(self.world.worldView.player, function () {
                        interaction('game_over', function () {
                            self.nextScene();
                        });
                    });
                    return;
                }
                var promotions = [];
                iterateEntries(self.bridgeCrew, function (officerKey) {
                    if (self.flags['crew_' + officerKey + '_deployed'] === undefined)
                        self.flags['crew_' + officerKey + '_deployed'] = 0;
                    self.flags['crew_' + officerKey + '_deployed']++;

                    var deployed = self.flags['crew_' + officerKey + '_deployed'];
                    var promotionKey;
                    if (deployed == 3) {
                        promotionKey = 'crew_' + officerKey + '_level_2';
                        self.flags[promotionKey] = true;
                        if (self.dialog[promotionKey])
                            promotions.push(promotionKey);
                    } else if (deployed == 3 * 3) {
                        promotionKey = 'crew_' + officerKey + '_level_3';
                        self.flags[promotionKey] = true;
                        if (self.dialog[promotionKey])
                            promotions.push(promotionKey);
                    } else if (deployed == 3 * 3 * 3) {
                        promotionKey = 'crew_' + officerKey + '_level_4';
                        self.flags[promotionKey] = true;
                        if (self.dialog[promotionKey])
                            promotions.push(promotionKey);
                    }
                });

                function getIterator(array) {
                    var nextIndex = 0;

                    return {
                        next: function () {
                            return array[nextIndex++];
                        },
                        hasNext: function () {
                            return nextIndex < array.length;
                        }
                    }
                }

                function endFight() {
                    self.ship.hull = hull;

                    self.__startMusic();

                    if (callback)
                        callback();
                }

                function showAllPromotions(iterator) {
                    if (iterator.hasNext()) {
                        interact(true, iterator.next(), showAllPromotions.bind(undefined, iterator));
                    } else {
                        endFight();
                    }
                }

                showAllPromotions(getIterator(promotions));
            });
        }

        function showMenu(callback) {
            if (self.__itIsOver)
                return;

            if (interactionVisible) {
                self.interactSymbol.show = false;
                self.interactButton.show = false;
            }
            if (menuIconVisible) {
                self.menuButton.show = false;
                self.menuText.show = false;
            }

            var callbacks = {
                save: function (callback) {
                    localStorage.setItem(Storage.MAP, self.mapKey);
                    saveObject(Storage.STATE, self.flags);
                    saveObject(Storage.SHIP, self.ship);
                    saveObject(Storage.CREW, self.bridgeCrew);
                    localStorage.setItem(Storage.SAVED, true);
                    interaction('saved', callback, true);
                },
                fullScreen: function (callback) {
                    var goFullScreen = true;

                    function oneTimeKeyListener(e) {
                        if (goFullScreen && (e.keyCode == Key.SPACE || e.keyCode == Key.ENTER)) {
                            goFullScreen = false;
                            toggleFullScreen();
                            document.removeEventListener('keydown', oneTimeKeyListener);
                        }
                    }

                    document.addEventListener('keydown', oneTimeKeyListener);

                    function toggleFullScreen() {
                        if (self.device.isFullScreen()) {
                            self.device.exitFullScreen();
                        } else {
                            self.device.requestFullScreen();
                        }
                    }

                    interaction(self.device.isFullScreen() ? 'exit_fullscreen' : 'go_fullscreen', callback, true);
                },
                mute: function (callback) {
                    interaction(self.sounds.isMute ? 'unmute' : 'mute', function () {
                        if (self.sounds.isMute) {
                            self.sounds.unmuteAll();
                        } else {
                            self.sounds.muteAll();
                        }
                        if (callback)
                            callback();
                    }, true);
                }
            };
            var menu = new Menu(self.services, callbacks);
            var menuScene = new MVVMScene(self.services, self.services.scenes[Scene.MENU], menu, Scene.MENU);
            menuScene.show(function () {
                if (interactionVisible) {
                    self.interactSymbol.show = true;
                    self.interactButton.show = true;
                }
                if (menuIconVisible) {
                    self.menuButton.show = true;
                    self.menuText.show = true;
                }
                if (callback)
                    callback();
            });
        }

        function endMap(nextMap) {
            if (self.__itIsOver)
                return;

            self.__pause();
            self.__itIsOver = true;
            self.nextScene({
                nextMap: nextMap,
                prevMap: self.mapKey
            });
        }

        this.world = PlayFactory.createWorld(this.stage, this.timer, this.sounds, this.device, this.map, this.npc,
            this.walls, this.background, this.directions, this.gameEvents, this.flags, this.bridgeCrew,
            this.gameCallbacks,
            possibleInteractionStart, possibleInteractionEnd, interaction, fight, showMenu, endMap, this.prevMapKey,
            this.__pause.bind(this), this.__resume.bind(this));

        this.world.init(function () {
            if (self.__itIsOver)
                return;

            self.__resume();
        });

        this.cameraListener = this.events.subscribe(Event.TICK_CAMERA, this.world.updateCamera.bind(this.world));

        this.playerController = PlayFactory.createPlayerController(this.world, this.world.domainGridHelper);
        this.__pause();

        this.pointerHandler = this.events.subscribe(Event.POINTER, function (pointer) {
            if (self.__itIsOver)
                return;

            if (pointer.type == 'down')
                self.playerController.handlePointerDown(pointer.x, pointer.y);
            if (pointer.type == 'up')
                self.playerController.handlePointerUp(pointer.x, pointer.y);
            if (pointer.type == 'move')
                self.playerController.handlePointerMove(pointer.x, pointer.y);
        });

        this.keyBoardHandler = installPlayerKeyBoard(this.events, this.playerController);
        this.gamePadHandler = installPlayerGamePad(this.events, this.playerController);

        this.interactSymbol.show = false;
        self.interactButton.show = false;

        this.__startMusic();
    };

    Game.prototype.__startMusic = function () {
        var self = this;
        self.stopMusic = false;
        self.lastLoop = 0;

        function loopMusic(sound) {
            if (self.stopMusic)
                return;

            var loop = self.lastLoop = self.sounds.play(sound);
            self.sounds.notifyOnce(loop, 'end', loopMusic.bind(undefined, sound));
        }

        if (this.mapKey == MapKey.BLUE) {
            loopMusic(Sound.MUSIC_BLUE);
        } else if (this.mapKey == MapKey.RED) {
            loopMusic(Sound.MUSIC_RED);
        } else {
            loopMusic(Sound.MUSIC_SPACE);
        }
    };

    Game.prototype.__stopMusic = function () {
        this.stopMusic = true;
        if (this.lastLoop !== 0)
            this.sounds.fadeOut(this.lastLoop);
    };

    Game.prototype.preDestroy = function () {
        this.events.unsubscribe(this.pointerHandler);
        this.events.unsubscribe(this.keyBoardHandler);
        this.events.unsubscribe(this.gamePadHandler);
        this.events.unsubscribe(this.cameraListener);
        this.world.preDestroy();

        this.__stopMusic();
    };

    //noinspection JSUnusedGlobalSymbols
    Game.prototype.menuUp = function () {
        this.playerController.handleMenuKey();
    };

    //noinspection JSUnusedGlobalSymbols
    Game.prototype.menuDown = function () {
    };

    //noinspection JSUnusedGlobalSymbols
    Game.prototype.interactUp = function () {
        this.playerController.handleInteractionKey();
    };

    //noinspection JSUnusedGlobalSymbols
    Game.prototype.interactDown = function () {
    };

    return Game;
})(G.PlayFactory, G.installPlayerKeyBoard, G.installPlayerGamePad, G.Scene, H5.MVVMScene, G.Dialog, G.Tile, H5.Event,
    H5.Strings, G.Menu, H5.lclStorage, H5.saveObject, G.Storage, G.createShipFight, G.MapKey, G.Sound, H5.Key,
    H5.iterateEntries);