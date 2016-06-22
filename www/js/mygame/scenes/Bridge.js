G.Bridge = (function (MVVMScene, BridgeScreen, BridgeCrew, BridgeOrders, Scene) {
    "use strict";

    function Bridge(services) {
        this.services = services;
    }

    Bridge.prototype.show = function (next) {
        var self = this;

        var screen = new BridgeScreen();
        var screenScene = new MVVMScene(this.services, this.services.scenes[Scene.BRIDGE_SCREEN], screen, Scene.BRIDGE_SCREEN);

        var engineering = {
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
        };
        var tactics = {
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
        };
        var navigation = {
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
        };
        var weapons = {
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
        };
        var science = {
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
        };
        var communication = {
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
        };

        var orders;

        function showOrders(officer) {
            var name = officer.name + ' - ' + officer.position;
            var args = officer.commands.map(function (command) {
                return command.name + ' - ' + command.count + ' of ' + command.max;
            });
            args.unshift(name);

            if (orders && orders.viewModel)
                orders.viewModel.nextScene();
            orders = self.__createOrders.apply(self, args);

            orders.show(function (selectedOrder) {
                console.log(selectedOrder);
            });
        }

        var crew = new BridgeCrew(this.services, engineering, tactics, navigation, weapons, science, communication, showOrders);
        var crewScene = new MVVMScene(this.services, this.services.scenes[Scene.BRIDGE_CREW], crew, Scene.BRIDGE_CREW);

        screenScene.show();
        crewScene.show();

    };

    Bridge.prototype.__createOrders = function (name, optionA, optionB, optionC, optionD) {
        var orders = new BridgeOrders(this.services, name, optionA, optionB, optionC, optionD);
        return new MVVMScene(this.services, this.services.scenes[Scene.BRIDGE_ORDERS], orders, Scene.BRIDGE_ORDERS);
    };

    return Bridge;
})(H5.MVVMScene, G.BridgeScreen, G.BridgeCrew, G.BridgeOrders, G.Scene);