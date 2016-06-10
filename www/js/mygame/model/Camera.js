G.Camera = (function () {
    "use strict";

    function Camera(viewPort, minX, minY, maxX, maxY) {
        this.viewPort = viewPort;

        // introducing a 3rd universe:
        // 1st grid tiles (u,v)
        // 2nd px screen coordinates (x,y)
        // 3rd px space coordinates (x,y) 
        // - while screen coords are relative, space coords are an absolute representation of tiles in px
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    Camera.prototype.calcScreenPosition = function (entity, drawable) {
        if (entity.getEndX() < this.viewPort.getCornerX() || entity.getCornerX() > this.viewPort.getEndX() ||
            entity.getEndY() < this.viewPort.getCornerY() || entity.getCornerY() > this.viewPort.getEndY()) {
            
            drawable.show = false;
            return;
        }

        drawable.show = true;

        drawable.x = entity.x - this.viewPort.getCornerX() * this.viewPort.scale;
        drawable.y = entity.y - this.viewPort.getCornerY() * this.viewPort.scale;
        drawable.rotation = this.viewPort.rotation + entity.rotation;
        drawable.scale = (entity.scale + this.viewPort.scale);
        drawable.flipHorizontally = entity.flipHorizontally;
        drawable.flipHorizontally = this.viewPort.flipHorizontally;
        drawable.flipVertically = entity.flipVertically;
        drawable.flipVertically = this.viewPort.flipVertically;
    };

    Camera.prototype.move = function (anchor) {
        this.viewPort.x = anchor.x;
        this.viewPort.y = anchor.y;

        // if (this.viewPort.x < this.minX)
        //     this.viewPort.x = this.minX;
        // if (this.viewPort.x > this.maxX)
        //     this.viewPort.x = this.maxX;
        // if (this.viewPort.y < this.minY)
        //     this.viewPort.y = this.minY;
        // if (this.viewPort.y > this.maxY)
        //     this.viewPort.y = this.maxY;
    };

    return Camera;
})();