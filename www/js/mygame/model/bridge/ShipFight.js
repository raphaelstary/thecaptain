G.ShipFight = (function (range, isNaN, Math, DecisionAI, Sound) {
    "use strict";

    function ShipFight(bridgeView, dialogs, ship, enemy, shipStats) {
        this.bridge = bridgeView;
        this.dialogs = dialogs;
        this.ship = ship;
        this.enemy = enemy;
        this.shipStats = shipStats;
    }

    ShipFight.prototype.start = function (next) {
        this.bridge.show(next);

        this.__updateView();
        this.bridge.setName(this.enemy.name);
        this.bridge.setShip(this.enemy.asset);
        this.bridge.setShieldsEnemy(this.enemy.shields, this.enemy.shields);
        this.bridge.setHullEnemy(this.enemy.hull, this.enemy.hull);

        var self = this;
        this.__dialog('FS1', function () {
            self.__dialog('FS2', function () {
                self.__dialog('FS3', self.waitForOrders.bind(self));
            });
            self.bridge.play(Sound.ALERT_LONG);
        });
        this.bridge.play(Sound.ALERT_SHORT);
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
            this.shipStats[command.dialog + '_count'] = command.count;
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

            if (command.sound) {
                var isAttack = command.actions.some(function (action) {
                    return action.property == 'damage';
                });

                if (isAttack)
                    this.bridge.play(command.sound);
            }
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
                this.__dialog('hit', this.initCounterAttack.bind(this));
                this.bridge.hitEnemy();
                this.bridge.play(Sound.WON_THE_BATTLE);
            } else {
                this.__dialog('hit', this.success.bind(this));
                this.bridge.hitEnemy();
                this.bridge.play(Sound.WON_THE_BATTLE);
            }
        } else {
            if (command.sound)
                this.bridge.play(command.sound);
            this.initCounterAttack();
        }
    };

    ShipFight.prototype.__updateView = function () {
        this.bridge.setShields(this.ship.shields, this.ship.shieldsMax);
        this.bridge.setHull(this.ship.hull, this.ship.hullMax);
        this.bridge.setEnergy(this.ship.energy, this.ship.energyMax);
    };

    ShipFight.prototype.initCounterAttack = function () {
        var command = DecisionAI.selectCommand(this.enemy.commands, DecisionAI.getRandom());

        this.__dialog(command.dialog, this.counterAttack.bind(this, command));
        this.bridge.play(command.sound);
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
            this.__dialog('hit', this.waitForOrders.bind(this));
            this.bridge.bigShake();
            this.bridge.play(Sound.WON_THE_BATTLE);
        } else {
            this.__dialog('hit', this.failure.bind(this));
            this.bridge.bigShake();
            this.bridge.play(Sound.WON_THE_BATTLE);
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
        this.__dialog('defeat', this.bridge.nextScene.bind(this.bridge, true, this.ship.hull));
    };

    ShipFight.prototype.failure = function () {
        this.__dialog('failure', this.bridge.nextScene.bind(this.bridge, false, this.ship.hull));
    };

    ShipFight.prototype.__dialog = function (key, callback) {
        if (!this.dialogs[key])
            throw 'dialog not set: ' + key;
        this.bridge.showDialog(this.dialogs[key], callback);
    };

    return ShipFight;
})(H5.range, isNaN, Math, G.DecisionAI, G.Sound);