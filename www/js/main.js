window.onload = function () {
    "use strict";

    var app = H5.Bootstrapper.keyBoard().gamePad().responsive().build(G.MyGameResources, G.installMyScenes);
    app.start();
};