G.Camera = (function () {
    "use strict";

    function Camera(viewPort, maxX, maxY) {
        this.viewPort = viewPort;

        // introducing a 3rd universe:
        // 1st grid tiles (u,v)
        // 2nd px screen coordinates (x,y)
        // 3rd px space coordinates (x,y) 
        // - while screen coordinates are relative, space coordinates are an absolute representation of tiles in px
        
        this.minX = this.viewPort.getWidthHalf();
        this.minY = this.viewPort.getHeightHalf();
        this.maxX = maxX;
        this.maxY = maxY;
    }

    Camera.prototype.calcScreenPosition = function (entity, drawable) {
        var cornerX = this.viewPort.getCornerX();
        var cornerY = this.viewPort.getCornerY();
        if (entity.getEndX() < cornerX || entity.getCornerX() > this.viewPort.getEndX() ||
            entity.getEndY() < cornerY || entity.getCornerY() > this.viewPort.getEndY()) {

            drawable.show = false;
            return;
        }

        drawable.show = true;

        drawable.x = entity.x - cornerX * this.viewPort.scale;
        drawable.y = entity.y - cornerY * this.viewPort.scale;
    };

    Camera.prototype.move = function (anchor) {
        this.viewPort.x = anchor.x;
        this.viewPort.y = anchor.y;

        if (this.viewPort.x < this.minX)
            this.viewPort.x = this.minX;
        if (this.viewPort.x > this.maxX)
            this.viewPort.x = this.maxX;
        if (this.viewPort.y < this.minY)
            this.viewPort.y = this.minY;
        if (this.viewPort.y > this.maxY)
            this.viewPort.y = this.maxY;
    };

    return Camera;
})();