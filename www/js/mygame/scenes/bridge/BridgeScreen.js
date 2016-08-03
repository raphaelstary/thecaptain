G.BridgeScreen = (function (wrap, Math, calcScreenConst, Event, ScreenShaker, ShipHitView) {
    "use strict";

    function BridgeScreen(services) {
        this.stage = services.stage;
        this.events = services.events;
        this.device = services.device;

        this.services = services;

        this.shields = 0;
        this.shieldsNext = 0;
        this.shieldsMax = 0;
        this.hull = 0;
        this.hullNext = 0;
        this.hullMax = 0;
        this.energy = 0;
        this.energyNext = 0;
        this.energyMax = 0;
        this.shieldsEnemy = 0;
        this.shieldsEnemyNext = 0;
        this.shieldsEnemyMax = 0;
        this.hullEnemy = 0;
        this.hullEnemyNext = 0;
        this.hullEnemyMax = 0;

        this.__itIsOver = false;
    }

    BridgeScreen.prototype.update = function () {
        if (this.shields < this.shieldsNext) {
            this.shields++;
            this.shieldsText.setText(this.shields);
        }
        if (this.shields > this.shieldsNext) {
            this.shields--;
            this.shieldsText.setText(this.shields);
        }
        this.shieldsBarMask.x = this.__shieldsX();
        this.shieldsBarMask.data.width = this.__shieldsWidth();

        if (this.hull < this.hullNext) {
            this.hull++;
            this.hullText.setText(this.hull);
        }
        if (this.hull > this.hullNext) {
            this.hull--;
            this.hullText.setText(this.hull);
        }
        this.hullBarMask.x = this.__hullX();
        this.hullBarMask.data.width = this.__hullWidth();

        if (this.energy < this.energyNext) {
            this.energy++;
            this.energyText.setText(this.energy);
        }
        if (this.energy > this.energyNext) {
            this.energy--;
            this.energyText.setText(this.energy);
        }
        this.energyBarMask.x = this.__energyX();
        this.energyBarMask.data.width = this.__energyWidth();

        if (this.shieldsEnemy < this.shieldsEnemyNext) {
            this.shieldsEnemy++;
            this.shieldsTextEnemy.setText(this.shieldsEnemy);
        }
        if (this.shieldsEnemy > this.shieldsEnemyNext) {
            this.shieldsEnemy--;
            this.shieldsTextEnemy.setText(this.shieldsEnemy);
        }
        this.shieldsBarEnemyMask.x = this.__shieldsEnemyX();
        this.shieldsBarEnemyMask.data.width = this.__shieldsEnemyWidth();

        if (this.hullEnemy < this.hullEnemyNext) {
            this.hullEnemy++;
            this.hullTextEnemy.setText(this.hullEnemy);
        }
        if (this.hullEnemy > this.hullEnemyNext) {
            this.hullEnemy--;
            this.hullTextEnemy.setText(this.hullEnemy);
        }
        this.hullBarEnemyMask.x = this.__hullEnemyX();
        this.hullBarEnemyMask.data.width = this.__hullEnemyWidth();
    };

    BridgeScreen.prototype.setName = function (name) {
        this.enemyName.setText(name);
    };

    BridgeScreen.prototype.setShields = function (next, max) {
        this.shieldsNext = next;
        if (max !== undefined)
            this.shieldsMax = max;
    };

    BridgeScreen.prototype.setHull = function (next, max) {
        this.hullNext = next;
        if (max !== undefined)
            this.hullMax = max;
    };

    BridgeScreen.prototype.setEnergy = function (next, max) {
        this.energyNext = next;
        if (max !== undefined)
            this.energyMax = max;
    };

    BridgeScreen.prototype.setShieldsEnemy = function (next, max) {
        this.shieldsEnemyNext = next;
        if (max !== undefined)
            this.shieldsEnemyMax = max;
    };

    BridgeScreen.prototype.setHullEnemy = function (next, max) {
        this.hullEnemyNext = next;
        if (max !== undefined)
            this.hullEnemyMax = max;
    };

    BridgeScreen.prototype.postConstruct = function () {
        this.__itIsOver = false;

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
        this.shakerTickId = this.events.subscribe(Event.TICK_COLLISION, this.shaker.update.bind(this.shaker));

        this.drawables.forEach(function (drawable) {
            if (this.enemyShip.id == drawable.id)
                return;
            this.shaker.add(drawable);
        }, this);
        this.shaker.add(this.shieldsBarMask);
        this.shaker.add(this.hullBarMask);
        this.shaker.add(this.energyBarMask);
        this.shaker.add(this.shieldsBarEnemyMask);
        this.shaker.add(this.hullBarEnemyMask);

        // register ship screen shake
        this.shipShaker = new ScreenShaker(this.device);
        this.shipShakerResizeId = this.events.subscribe(Event.RESIZE, this.shipShaker.resize.bind(this.shipShaker));
        this.shipShakerTickId = this.events.subscribe(Event.TICK_MOVE, this.shipShaker.update.bind(this.shipShaker));

        this.hitView = new ShipHitView(this.services, this.enemyShip, this.shipShaker);
    };

    BridgeScreen.prototype.preDestroy = function () {
        this.__itIsOver = true;

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