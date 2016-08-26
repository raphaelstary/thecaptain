G.BridgeCrew = (function (Event, Key, ScreenShaker) {
    "use strict";

    function BridgeCrew(services, crew, showOrders) {
        this.events = services.events;
        this.device = services.device;

        this.name = name;
        this.engineering = crew.engineering;
        this.tactics = crew.tactics;
        this.navigation = crew.navigation;
        this.weapons = crew.weapons;
        this.science = crew.science;
        this.communication = crew.communication;

        this.showOrders = showOrders;
    }

    BridgeCrew.prototype.postConstruct = function () {
        this.itIsOver = false;

        var self = this;
        var options = [];
        if (self.engineering)
            options.push({
                selection: self.selectionEngineering,
                officer: self.engineering
            });
        if (self.tactics)
            options.push({
                selection: self.selectionTactics,
                officer: self.tactics
            });
        if (self.navigation)
            options.push({
                selection: self.selectionNavigation,
                officer: self.navigation
            });
        if (self.weapons)
            options.push({
                selection: self.selectionWeapons,
                officer: self.weapons
            });
        if (self.science)
            options.push({
                selection: self.selectionScience,
                officer: self.science
            });
        if (self.communication)
            options.push({
                selection: self.selectionCommunication,
                officer: self.communication
            });

        this.__hideAllSelections();
        options[0].selection.show = true;

        function left() {
            if (options.length < 2)
                return;
            var newSelection = options.pop();
            newSelection.selection.show = true;
            options[0].selection.show = false;
            options.unshift(newSelection);

            if (newSelection.officer) {
                self.showOrders(newSelection.officer);
            } else {
                left();
            }
        }

        function right() {
            if (options.length < 2)
                return;
            options.push(options.shift());
            options[0].selection.show = true;
            options[options.length - 1].selection.show = false;

            var nextOfficer = options[0].officer;
            if (nextOfficer) {
                self.showOrders(nextOfficer);
            } else {
                right();
            }
        }

        this.keyListener = this.events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (self.itIsOver)
                return;

            if (keyBoard[Key.LEFT]) {
                left();
            } else if (keyBoard[Key.RIGHT]) {
                right();
            }
        });

        this.gamePadListener = this.events.subscribe(Event.GAME_PAD, function (gamePad) {
            if (self.itIsOver)
                return;

            if (gamePad.isDPadLeftPressed()) {
                left();
            } else if (gamePad.isDPadRightPressed()) {
                right();
            }
        });

        this.showOrders(options[0].officer);

        // register screen shake
        this.shaker = new ScreenShaker(this.device);
        this.shakerResizeId = this.events.subscribe(Event.RESIZE, this.shaker.resize.bind(this.shaker));
        this.shakerTickId = this.events.subscribe(Event.TICK_MOVE, this.shaker.update.bind(this.shaker));

        this.drawables.forEach(function (drawable) {
            this.shaker.add(drawable);
        }, this);
    };

    BridgeCrew.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
        this.events.unsubscribe(this.gamePadListener);

        // un-register screen shake
        this.events.unsubscribe(this.shakerTickId);
        this.events.unsubscribe(this.shakerResizeId);
    };

    BridgeCrew.prototype.bigShake = function () {
        this.shaker.startBigShake();
    };

    BridgeCrew.prototype.smallShake = function () {
        this.shaker.startSmallShake();
    };

    BridgeCrew.prototype.__hideAllSelections = function () {
        this.selectionEngineering.show = false;
        this.selectionTactics.show = false;
        this.selectionWeapons.show = false;
        this.selectionNavigation.show = false;
        this.selectionScience.show = false;
        this.selectionCommunication.show = false;
    };

    //noinspection JSUnusedGlobalSymbols
    BridgeCrew.prototype.engineeringUp = function () {
        if (!this.engineering)
            return;
        this.__hideAllSelections();
        this.selectionEngineering.show = true;
        this.showOrders(this.engineering);
    };

    //noinspection JSUnusedGlobalSymbols
    BridgeCrew.prototype.engineeringDown = function () {
    };

    //noinspection JSUnusedGlobalSymbols
    BridgeCrew.prototype.tacticsUp = function () {
        if (!this.tactics)
            return;
        this.__hideAllSelections();
        this.selectionTactics.show = true;
        this.showOrders(this.tactics);
    };

    //noinspection JSUnusedGlobalSymbols
    BridgeCrew.prototype.tacticsDown = function () {
    };

    //noinspection JSUnusedGlobalSymbols
    BridgeCrew.prototype.navigationUp = function () {
        if (!this.navigation)
            return;
        this.__hideAllSelections();
        this.selectionNavigation.show = true;
        this.showOrders(this.navigation);
    };

    //noinspection JSUnusedGlobalSymbols
    BridgeCrew.prototype.navigationDown = function () {
    };

    //noinspection JSUnusedGlobalSymbols
    BridgeCrew.prototype.weaponsUp = function () {
        if (!this.weapons)
            return;
        this.__hideAllSelections();
        this.selectionWeapons.show = true;
        this.showOrders(this.weapons);
    };

    //noinspection JSUnusedGlobalSymbols
    BridgeCrew.prototype.weaponsDown = function () {
    };

    //noinspection JSUnusedGlobalSymbols
    BridgeCrew.prototype.scienceUp = function () {
        if (!this.science)
            return;
        this.__hideAllSelections();
        this.selectionScience.show = true;
        this.showOrders(this.science);
    };

    //noinspection JSUnusedGlobalSymbols
    BridgeCrew.prototype.scienceDown = function () {
    };

    //noinspection JSUnusedGlobalSymbols
    BridgeCrew.prototype.communicationUp = function () {
        if (!this.communication)
            return;
        this.__hideAllSelections();
        this.selectionCommunication.show = true;
        this.showOrders(this.communication);
    };

    //noinspection JSUnusedGlobalSymbols
    BridgeCrew.prototype.communicationDown = function () {
    };

    return BridgeCrew;
})(H5.Event, H5.Key, H5.ScreenShaker);