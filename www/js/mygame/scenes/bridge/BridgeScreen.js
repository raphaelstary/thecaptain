G.BridgeScreen = (function (wrap, Math, calcScreenConst, Event, ScreenShaker, ShipHitView) {
    "use strict";

    function BridgeScreen(services) {
        this.stage = services.stage;
        this.events = services.events;
        this.device = services.device;

        this.services = services;

        this.shields = 0;
        this.shieldsMax = 0;
        this.hull = 0;
        this.hullMax = 0;
        this.energy = 0;
        this.energyMax = 0;
        this.shieldsEnemy = 0;
        this.shieldsEnemyMax = 0;
        this.hullEnemy = 0;
        this.hullEnemyMax = 0;
    }

    BridgeScreen.prototype.setShields = function (current, max) {
        this.shields = current;
        if (max !== undefined)
            this.shieldsMax = max;
        this.shieldsBarMask.x = this.__shieldsX();
        this.shieldsBarMask.data.width = this.__shieldsWidth();
        this.shieldsText.setText(current);
    };

    BridgeScreen.prototype.setHull = function (current, max) {
        this.hull = current;
        if (max !== undefined)
            this.hullMax = max;
        this.hullBarMask.x = this.__hullX();
        this.hullBarMask.data.width = this.__hullWidth();
        this.hullText.setText(current);
    };

    BridgeScreen.prototype.setEnergy = function (current, max) {
        this.energy = current;
        if (max !== undefined)
            this.energyMax = max;
        this.energyBarMask.x = this.__energyX();
        this.energyBarMask.data.width = this.__energyWidth();
        this.energyText.setText(current);
    };

    BridgeScreen.prototype.setShieldsEnemy = function (current, max) {
        this.shieldsEnemy = current;
        if (max !== undefined)
            this.shieldsEnemyMax = max;
        this.shieldsBarEnemyMask.x = this.__shieldsEnemyX();
        this.shieldsBarEnemyMask.data.width = this.__shieldsEnemyWidth();
        this.shieldsTextEnemy.setText(current);
    };

    BridgeScreen.prototype.setHullEnemy = function (current, max) {
        this.hullEnemy = current;
        if (max !== undefined)
            this.hullEnemyMax = max;
        this.hullBarEnemyMask.x = this.__hullEnemyX();
        this.hullBarEnemyMask.data.width = this.__hullEnemyWidth();
        this.hullTextEnemy.setText(current);
    };

    BridgeScreen.prototype.postConstruct = function () {
        this.shieldsBarMask = this.__createMask(this.shieldsBar, this.__shieldsX.bind(this),
            this.__shieldsWidth.bind(this));
        this.hullBarMask = this.__createMask(this.hullBar, this.__hullX.bind(this), this.__hullWidth.bind(this));
        this.energyBarMask = this.__createMask(this.energyBar, this.__energyX.bind(this),
            this.__energyWidth.bind(this));

        this.shieldsBarEnemyMask = this.__createMask(this.shieldsBarEnemy, this.__shieldsEnemyX.bind(this),
            this.__shieldsEnemyWidth.bind(this));
        this.hullBarEnemyMask = this.__createMask(this.hullBarEnemy, this.__hullEnemyX.bind(this),
            this.__hullEnemyWidth.bind(this));

        // register screen shake
        this.shaker = new ScreenShaker(this.device);
        this.shakerResizeId = this.events.subscribe(Event.RESIZE, this.shaker.resize.bind(this.shaker));
        this.shakerTickId = this.events.subscribe(Event.TICK_MOVE, this.shaker.update.bind(this.shaker));

        this.drawables.forEach(function (drawable) {
            if (this.enemyShip.id == drawable.id)
                return;
            this.shaker.add(drawable);
        }, this);

        // register ship screen shake
        this.shipShaker = new ScreenShaker(this.device);
        this.shipShakerResizeId = this.events.subscribe(Event.RESIZE, this.shipShaker.resize.bind(this.shipShaker));
        this.shipShakerTickId = this.events.subscribe(Event.TICK_MOVE, this.shipShaker.update.bind(this.shipShaker));

        this.hitView = new ShipHitView(this.services, this.enemyShip, this.shipShaker);
    };

    BridgeScreen.prototype.preDestroy = function () {
        // un-register screen shake
        this.events.unsubscribe(this.shakerTickId);
        this.events.unsubscribe(this.shakerResizeId);

        // un-register ship screen shake
        this.events.unsubscribe(this.shipShakerTickId);
        this.events.unsubscribe(this.shipShakerResizeId);
    };

    BridgeScreen.prototype.bigShake = function () {
        this.shaker.startBigShake();
    };

    BridgeScreen.prototype.smallShake = function () {
        this.shaker.startSmallShake();
    };

    BridgeScreen.prototype.hitEnemy = function () {
        this.hitView.hit();
    };

    BridgeScreen.prototype.__createMask = function (base, xFn, widthFn) {
        var mask = this.stage.createRectangle().setPosition(xFn, wrap(base, 'y'), [base]).setWidth(widthFn, [base])
            .setHeight(this.__maskHeight.bind(this), [base]);
        base.setMask(mask);
        return mask;
    };

    BridgeScreen.prototype.__maskHeight = function () {
        return this.shieldsBar.getHeight();
    };

    BridgeScreen.prototype.__shieldsX = function () {
        return this.shieldsBar.getCornerX() + Math.floor(this.__shieldsWidth() / 2);
    };

    BridgeScreen.prototype.__shieldsWidth = function () {
        return calcScreenConst(this.shieldsBar.getWidth(), this.shieldsMax, this.shields);
    };

    BridgeScreen.prototype.__hullX = function () {
        return this.hullBar.getCornerX() + Math.floor(this.__hullWidth() / 2);
    };

    BridgeScreen.prototype.__hullWidth = function () {
        return calcScreenConst(this.hullBar.getWidth(), this.hullMax, this.hull);
    };

    BridgeScreen.prototype.__energyX = function () {
        return this.energyBar.getCornerX() + Math.floor(this.__energyWidth() / 2);
    };

    BridgeScreen.prototype.__energyWidth = function () {
        return calcScreenConst(this.energyBar.getWidth(), this.energyMax, this.energy);
    };

    BridgeScreen.prototype.__shieldsEnemyX = function () {
        return this.shieldsBarEnemy.getCornerX() + Math.floor(this.__shieldsEnemyWidth() / 2);
    };

    BridgeScreen.prototype.__shieldsEnemyWidth = function () {
        return calcScreenConst(this.shieldsBarEnemy.getWidth(), this.shieldsEnemyMax, this.shieldsEnemy);
    };

    BridgeScreen.prototype.__hullEnemyX = function () {
        return this.hullBarEnemy.getCornerX() + Math.floor(this.__hullEnemyWidth() / 2);
    };

    BridgeScreen.prototype.__hullEnemyWidth = function () {
        return calcScreenConst(this.hullBarEnemy.getWidth(), this.hullEnemyMax, this.hullEnemy);
    };

    return BridgeScreen;
})(H5.wrap, Math, H5.calcScreenConst, H5.Event, H5.ScreenShaker, G.ShipHitView);