G.Background = (function (Event, ScreenShaker) {
    "use strict";

    function Background(services) {
        this.events = services.events;
        this.device = services.device;
    }

    Background.prototype.postConstruct = function () {
        // register screen shake
        this.shaker = new ScreenShaker(this.device);
        this.shakerResizeId = this.events.subscribe(Event.RESIZE, this.shaker.resize.bind(this.shaker));
        this.shakerTickId = this.events.subscribe(Event.TICK_MOVE, this.shaker.update.bind(this.shaker));

        this.drawables.forEach(function (drawable) {
            var isBackground = drawable.zIndex == 12;
            if (isBackground)
                return;
            this.shaker.add(drawable);
        }, this);
    };

    Background.prototype.preDestroy = function () {
        // un-register screen shake
        this.events.unsubscribe(this.shakerTickId);
        this.events.unsubscribe(this.shakerResizeId);
    };

    Background.prototype.bigShake = function () {
        this.shaker.startBigShake();
    };

    Background.prototype.smallShake = function () {
        this.shaker.startSmallShake();
    };

    return Background;
})(H5.Event, H5.ScreenShaker);