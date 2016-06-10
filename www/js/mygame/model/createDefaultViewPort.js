G.createDefaultViewPort = (function (Width, Height) {
    "use strict";

    function createDefaultViewPort(stage) {
        var viewPortRect = stage.createRectangle(false).setPosition(Width.HALF, Height.HALF).setWidth(Width.FULL)
            .setHeight(Height.FULL);
        viewPortRect.show = false;
        return viewPortRect;
    }

    return createDefaultViewPort;
})(H5.Width, H5.Height);