window.onload = function () {
    "use strict";

    var app = H5.Bootstrapper.keyBoard().gamePad().pointer().responsive().build(G.MyGameResources, G.installMyScenes);
    app.start();
};