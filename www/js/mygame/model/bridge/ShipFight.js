G.ShipFight = (function (range, isNaN, Math) {
    "use strict";

    function ShipFight(bridgeView, dialogs, ship, enemy) {
        this.bridge = bridgeView;
        this.dialogs = dialogs;
        this.ship = ship;
        this.enemy = enemy;
    }

    ShipFight.prototype.start = function () {
        this.bridge.show();

        this.__updateView();
        this.bridge.setShieldsEnemy(this.enemy.shields, this.enemy.shields);
        this.bridge.setHullEnemy(this.enemy.hull, this.enemy.hull);

        this.__dialog('FS1', this.waitForOrders.bind(this));
    };

    ShipFight.prototype.waitForOrders = function () {
        this.bridge.showSelection(this.processOrder.bind(this));
    };

    ShipFight.prototype.processOrder = function (command) {
        if (command.count !== undefined) {
            if (command.count === 0) {
                this.__dialog('out_of_attempts', this.waitForOrders.bind(this));
                return;
            }
            command.count--;
        }

        if (command.precondition) {
            if (isNaN(command.precondition.value) && command.precondition.value == 'not_max' &&
                this.ship[command.precondition.property] == this.ship[command.precondition.property + 'Max']) {
                this.__dialog(command.precondition.dialog, this.waitForOrders.bind(this));
                return;

            } else if (this.ship[command.precondition.property] < command.precondition.value) {
                this.__dialog(command.precondition.dialog, this.waitForOrders.bind(this));
                return;
            }
        }

        if (command.type == 'setter') {
            this.__dialog(command.dialog, this.execute.bind(this, command));
            return;
        }

        if (command.type == 'dialog') {
            this.__dialog(command.dialog, this.waitForOrders.bind(this));
            // return;
        }
    };

    ShipFight.prototype.execute = function (command) {
        var isAttack = false;
        command.actions.forEach(function (action) {
            if (action.property == 'damage') {
                isAttack = true;
                this.__hit(this.enemy, action.value, this.bridge.setShieldsEnemy.bind(this.bridge),
                    this.bridge.setHullEnemy.bind(this.bridge));
                return;
            }

            if (action.value == 'max') {
                this.ship[action.property] = this.ship[action.property + 'Max'];
            } else if (action.value == 'min') {
                this.ship[action.property] = 0;
            } else {
                this.ship[action.property] = Math.min(this.ship[action.property + 'Max'],
                    this.ship[action.property] + action.value);
            }

            this.__updateView();
        }, this);

        if (isAttack) {
            if (this.enemy.hull > 1) {
                this.__chainDialog('critical_hit', 'effective', this.initCounterAttack.bind(this));
            } else {
                this.__chainDialog('critical_hit', 'effective', this.success.bind(this));
            }
        } else {
            this.initCounterAttack();
        }
    };

    ShipFight.prototype.__updateView = function () {
        this.bridge.setShields(this.ship.shields, this.ship.shieldsMax);
        this.bridge.setHull(this.ship.hull, this.ship.hullMax);
        this.bridge.setEnergy(this.ship.energy, this.ship.energyMax);
    };

    ShipFight.prototype.initCounterAttack = function () {
        var command = selectCommand(this.enemy.commands);

        this.__dialog(command.dialog, this.counterAttack.bind(this, command));
    };

    ShipFight.prototype.counterAttack = function (command) {
        if (this.ship.defense) {
            this.ship.defense = 0;
            this.__dialog('miss', this.waitForOrders.bind(this));
            return;
        }

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

        if (ship.hull > damage) {
            ship.hull -= damage;
        } else {
            ship.hull = 0;
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
})(H5.range, isNaN, Math);