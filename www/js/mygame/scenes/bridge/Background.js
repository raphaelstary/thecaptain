G.Background = (function (Event, ScreenShaker, Sound) {
    "use strict";

    function Background(services, crew) {
        this.events = services.events;
        this.device = services.device;
        this.stage = services.stage;
        this.sounds = services.sounds;
        this.crew = crew;
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

        ['engineering', 'tactics', 'navigation', 'weapons', 'science', 'communication'].forEach(function (key) {
            var officer = this.crew[key];
            if (officer) {
                this[key].data = this.stage.getGraphic(officer.asset);
                this.shaker.remove(this[key + 'Chair']);
                this[key + 'Chair'].remove();
            } else {
                this.shaker.remove(this[key]);
                this[key].remove();
            }
        }, this);

        var self = this;
        self.stopMusic = false;
        self.lastLoop = 0;

        function loopMusic(sound) {
            if (self.stopMusic)
                return;

            var loop = self.lastLoop = self.sounds.play(sound);
            self.sounds.notifyOnce(loop, 'end', loopMusic.bind(undefined, sound));
        }

        loopMusic(Sound.MUSIC_RED);
    };

    Background.prototype.preDestroy = function () {
        // un-register screen shake
        this.events.unsubscribe(this.shakerTickId);
        this.events.unsubscribe(this.shakerResizeId);

        this.stopMusic = true;
        if (this.lastLoop !== 0)
            this.sounds.fadeOut(this.lastLoop);
    };

    Background.prototype.bigShake = function () {
        this.shaker.startBigShake();
    };

    Background.prototype.smallShake = function () {
        this.shaker.startSmallShake();
    };

    return Background;
})(H5.Event, H5.ScreenShaker, G.Sound);