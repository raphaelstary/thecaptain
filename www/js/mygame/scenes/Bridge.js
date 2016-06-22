G.Bridge = (function (MVVMScene, BridgeScreen, BridgeCrew, BridgeOrders, Scene) {
    "use strict";

    function Bridge(services) {
        this.services = services;
    }

    Bridge.prototype.show = function (next) {
        var screen = new BridgeScreen();
        var screenScene = new MVVMScene(this.services, this.services.scenes[Scene.BRIDGE_SCREEN], screen, Scene.BRIDGE_SCREEN);
        var crew = new BridgeCrew();
        var crewScene = new MVVMScene(this.services, this.services.scenes[Scene.BRIDGE_CREW], crew, Scene.BRIDGE_CREW);
        var orders = new BridgeOrders();
        var ordersScene = new MVVMScene(this.services, this.services.scenes[Scene.BRIDGE_ORDERS], orders, Scene.BRIDGE_ORDERS);

        screenScene.show();
        crewScene.show();
        ordersScene.show();
    };

    Bridge.prototype.__createOrders = function () {
        var orders = new BridgeOrders();
        var ordersScene = new MVVMScene(this.services, this.services.scenes[Scene.BRIDGE_ORDERS], orders, Scene.BRIDGE_ORDERS);
    };

    return Bridge;
})(H5.MVVMScene, G.BridgeScreen, G.BridgeCrew, G.BridgeOrders, G.Scene);