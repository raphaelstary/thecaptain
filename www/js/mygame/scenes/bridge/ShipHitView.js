G.ShipHitView = (function (wrap, Transition) {
    "use strict";

    var SHIP_WHITE = 'red-ship-front-big-white';
    var SHIP_BLACK = 'red-ship-front-big-black';
    var Z_INDEX = 15;

    function ShipHitView(services, drawable, shaker, is30fps) {
        this.stage = services.stage;
        this.drawable = drawable;
        this.timer = services.timer;
        this.shaker = shaker;
        this.fadeInSpeed = is30fps ? 1 : 2;
        this.fadeOutSpeed = is30fps ? 2 : 4;
    }

    ShipHitView.prototype.hit = function () {
        var dep = [this.drawable];
        var white = this.stage.createImage(SHIP_WHITE)
            .setPosition(wrap(this.drawable, 'x'), wrap(this.drawable, 'y'), dep).setZIndex(Z_INDEX);
        var black = this.stage.createImage(SHIP_BLACK)
            .setPosition(wrap(this.drawable, 'x'), wrap(this.drawable, 'y'), dep).setZIndex(Z_INDEX + 1).setAlpha(0);
        this.shaker.add(this.drawable);
        this.shaker.add(white);
        this.shaker.add(black);

        black.opacityPattern([
            {
                value: 1,
                duration: this.fadeInSpeed,
                easing: Transition.LINEAR
            }, {
                value: 0,
                duration: this.fadeOutSpeed,
                easing: Transition.LINEAR
            }
        ], true);

        var self = this;
        this.timer.doLater(function () {
            white.remove(white);
            black.remove(black);
            self.shaker.remove(white);
            self.shaker.remove(black);
            self.shaker.remove(self.drawable);
        }, 30);

        this.shaker.startSmallShake();
    };

    return ShipHitView;
})(H5.wrap, H5.Transition);