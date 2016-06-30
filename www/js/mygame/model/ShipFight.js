G.ShipFight = (function (range) {
    "use strict";

    function ShipFight(bridgeView, dialogs, ship, enemy) {
        this.bridge = bridgeView;
        this.dialogs = dialogs;
        this.ship = ship;
        this.enemy = enemy;
    }

    ShipFight.prototype.start = function () {
        this.bridge.show();

        this.bridge.setShields(this.ship.shields, this.ship.shieldsMax);
        this.bridge.setHull(this.ship.hull, this.ship.hullMax);
        this.bridge.setEnergy(this.ship.energy, this.ship.energyMax);
        this.bridge.setShieldsEnemy(this.enemy.shields, this.enemy.shields);
        this.bridge.setHullEnemy(this.enemy.hull, this.enemy.hull);

        this.__dialog('FS1', this.waitForOrders.bind(this));
    };

    ShipFight.prototype.waitForOrders = function () {
        this.bridge.showSelection(this.processOrder.bind(this));
    };

    ShipFight.prototype.processOrder = function (command) {
        if (command.type != 'attack')
            return;

        this.__dialog('laser', this.attack.bind(this, command));
    };

    ShipFight.prototype.attack = function (command) {
        if (command.count !== undefined)
            command.count--;

        if (command.energy !== undefined) {
            // decrease energy
        }

        this.__hit(this.enemy, command.damage, this.bridge.setShieldsEnemy.bind(this.bridge),
            this.bridge.setHullEnemy.bind(this.bridge));

        if (this.enemy.hull > 1) {
            this.__chainDialog('critical_hit', 'effective', this.initCounterAttack.bind(this));
        } else {
            this.__chainDialog('critical_hit', 'effective', this.success.bind(this));
        }
    };

    ShipFight.prototype.initCounterAttack = function () {
        var command = selectCommand(this.enemy.commands);

        this.__dialog(command.dialog, this.counterAttack.bind(this, command));
    };

    ShipFight.prototype.counterAttack = function (command) {
        this.__hit(this.ship, command.damage, this.bridge.setShields.bind(this.bridge),
            this.bridge.setHull.bind(this.bridge));

        if (this.ship.hull > 1) {
            this.__chainDialog('critical_hit', 'effective', this.waitForOrders.bind(this));
        } else {
            this.__chainDialog('critical_hit', 'effective', this.failure.bind(this));
        }
    };

    ShipFight.prototype.__hit = function (ship, damage, shieldsViewFn, hullViewFn) {
        if (ship.shields > damage) {
            ship.shields -= damage;
            damage = 0;
        } else {
            damage -= ship.shields;
            ship.shields = 0;
        }

        if (damage > 0) {
            ship.hull -= damage;
        }

        shieldsViewFn(ship.shields);
        hullViewFn(ship.hull);
    };

    ShipFight.prototype.success = function () {
        this.__dialog('defeat', function () {
            console.log('success');
        });
    };

    ShipFight.prototype.failure = function () {
        this.__dialog('failure', function () {
            console.log('failure');
        });
    };

    ShipFight.prototype.__dialog = function (key, callback) {
        this.bridge.showDialog(this.dialogs[key], callback);
    };

    ShipFight.prototype.__chainDialog = function (keyA, keyB, callback) {
        this.__dialog(keyA, this.__dialog.bind(this, keyB, callback));
    };

    function selectCommand(commands) {
        var random = range(0, 100);
        return commands.reduce(function (previous, current) {
            if (isNaN(previous))
                return previous;

            if (random > previous && random <= current.probability + previous)
                return current;
            return current.probability + previous;
        }, 0);
    }

    return ShipFight;
})(H5.range);