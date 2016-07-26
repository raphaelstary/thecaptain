G.Bridge = (function (MVVMScene, BridgeScreen, BridgeCrew, BridgeOrders, Scene, Dialog, OrderOption, Background) {
    "use strict";

    function Bridge(services, crew) {
        this.services = services;
        this.crew = crew;
    }

    Bridge.prototype.show = function (next) {
        this.next = next;

        this.bridge = this.__showBridge();
        this.screen = this.__showScreen();
    };

    Bridge.prototype.nextScene = function () {
        this.screen.nextScene();
        if (this.next)
            this.next();
    };

    Bridge.prototype.showSelection = function (callback) {
        this.crewSelection = this.__createCrewSelection();
        this.crewSelection.show(callback);
    };

    Bridge.prototype.showDialog = function (dialog, callback) {
        var dialogScene = this.__createDialog(dialog);
        dialogScene.show(callback);
    };

    Bridge.prototype.setShields = function (current, max) {
        this.screen.setShields(current, max);
    };

    Bridge.prototype.setHull = function (current, max) {
        this.screen.setHull(current, max);
    };

    Bridge.prototype.setEnergy = function (current, max) {
        this.screen.setEnergy(current, max);
    };

    Bridge.prototype.setShieldsEnemy = function (current, max) {
        this.screen.setShieldsEnemy(current, max);
    };

    Bridge.prototype.setHullEnemy = function (current, max) {
        this.screen.setHullEnemy(current, max);
    };

    Bridge.prototype.__createDialog = function (dialog) {
        var dialogScreen = new Dialog(this.services, dialog);
        return new MVVMScene(this.services, this.services.scenes[Scene.DIALOG], dialogScreen, Scene.DIALOG);
    };

    Bridge.prototype.__showScreen = function () {
        var screen = new BridgeScreen(this.services);
        new MVVMScene(this.services, this.services.scenes[Scene.BRIDGE_SCREEN], screen, Scene.BRIDGE_SCREEN).show();
        return screen;
    };

    Bridge.prototype.__showBridge = function () {
        var bridge = new Background(this.services);
        new MVVMScene(this.services, this.services.scenes[Scene.BRIDGE], bridge, Scene.BRIDGE).show();
        return bridge;
    };

    Bridge.prototype.__createCrewSelection = function () {
        var crew = new BridgeCrew(this.services, this.crew, this.__showOrders.bind(this));
        return new MVVMScene(this.services, this.services.scenes[Scene.BRIDGE_CREW], crew, Scene.BRIDGE_CREW);
    };

    Bridge.prototype.__showOrders = function (officer) {
        var name = officer.name + ' - ' + officer.position;
        var args = officer.commands.map(function (command) {
            if (command.count !== undefined && command.max !== undefined)
                return command.name + ' - ' + command.count + ' of ' + command.max;
            return command.name;
        });
        args.unshift(name);

        if (this.orders && this.orders.viewModel)
            this.orders.viewModel.nextScene();
        this.orders = this.__createOrders.apply(this, args);

        var self = this;
        this.orders.show(function (selection) {
            if (!selection)
                return;

            self.crewSelection.viewModel.nextScene(getCommand(officer.commands, selection));
        });
    };

    Bridge.prototype.__createOrders = function (name, optionA, optionB, optionC, optionD) {
        var orders = new BridgeOrders(this.services, name, optionA, optionB, optionC, optionD);
        return new MVVMScene(this.services, this.services.scenes[Scene.BRIDGE_ORDERS], orders, Scene.BRIDGE_ORDERS);
    };

    function getCommand(commands, selection) {
        return commands.filter(match(selection))[0];
    }

    function match(selection) {
        return function (command, index) {
            if (index === 0)
                return selection == OrderOption.A;
            if (index === 1)
                return selection == OrderOption.B;
            if (index === 2)
                return selection == OrderOption.C;
            if (index === 3)
                return selection == OrderOption.D;
            return false;
        }
    }

    return Bridge;
})(H5.MVVMScene, G.BridgeScreen, G.BridgeCrew, G.BridgeOrders, G.Scene, G.Dialog, G.OrderOption, G.Background);