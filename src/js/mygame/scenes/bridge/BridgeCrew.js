G.BridgeCrew = (function (Event, Key) {
    "use strict";

    function BridgeCrew(services, crew, showOrders) {
        this.events = services.events;

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
        var options = [
            {
                selection: self.selectionEngineering,
                officer: self.engineering
            }, {
                selection: self.selectionTactics,
                officer: self.tactics
            }, {
                selection: self.selectionNavigation,
                officer: self.navigation
            }, {
                selection: self.selectionWeapons,
                officer: self.weapons
            }, {
                selection: self.selectionScience,
                officer: self.science
            }, {
                selection: self.selectionCommunication,
                officer: self.communication
            }
        ];

        options.forEach(function (option, index) {
            if (index > 0)
                option.selection.show = false;
        });

        function left() {
            var newSelection = options.pop();
            newSelection.selection.show = true;
            options[0].selection.show = false;
            options.unshift(newSelection);

            self.showOrders(newSelection.officer);
        }

        function right() {
            options.push(options.shift());
            options[0].selection.show = true;
            options[options.length - 1].selection.show = false;

            self.showOrders(options[0].officer);
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

        right();
        right();
        right();
    };

    BridgeCrew.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
        this.events.unsubscribe(this.gamePadListener);
    };

    return BridgeCrew;
})(H5.Event, H5.Key);