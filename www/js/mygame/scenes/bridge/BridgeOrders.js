G.BridgeOrders = (function (Event, Key, OrderOption, ScreenShaker) {
    "use strict";

    function BridgeOrders(services, name, optionA, optionB, optionC, optionD) {
        this.events = services.events;
        this.device = services.device;

        this.name = name;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
    }

    BridgeOrders.prototype.postConstruct = function () {
        this.itIsOver = false;

        var self = this;
        var selection = OrderOption.A;
        var options = [
            {
                selection: self.selectionA,
                state: OrderOption.A
            }
        ];

        function end() {
            self.itIsOver = true;
            self.nextScene(selection);
        }

        function up() {
            var newSelection = options.pop();
            newSelection.selection.show = true;
            selection = newSelection.state;
            options[0].selection.show = false;
            options.unshift(newSelection);
        }

        function down() {
            options.push(options.shift());
            options[0].selection.show = true;
            selection = options[0].state;
            options[options.length - 1].selection.show = false;
        }

        this.keyListener = this.events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (self.itIsOver)
                return;

            if (keyBoard[Key.UP]) {
                up();
            } else if (keyBoard[Key.DOWN]) {
                down();
            } else if (keyBoard[Key.ENTER] || keyBoard[Key.SPACE]) {
                end();
            }
        });

        this.gamePadListener = this.events.subscribe(Event.GAME_PAD, function (gamePad) {
            if (self.itIsOver)
                return;

            if (gamePad.isDPadUpPressed()) {
                up();
            } else if (gamePad.isDPadDownPressed()) {
                down();
            } else if (gamePad.isAPressed() || gamePad.isStartPressed()) {
                end();
            }
        });

        self.headline.setText(this.name);
        self.textA.setText(this.optionA);

        if (this.optionB) {
            self.textB.setText(this.optionB);
            options.push({
                selection: self.selectionB,
                state: OrderOption.B
            });

        } else {
            selection.textB.show = false;
        }

        if (this.optionC) {
            self.textC.setText(this.optionC);
            options.push({
                selection: self.selectionC,
                state: OrderOption.C
            });
        } else {
            this.textC.show = false;
        }

        if (this.optionD) {
            self.textD.setText(this.optionD);
            options.push({
                selection: self.selectionD,
                state: OrderOption.D
            });
        } else {
            this.textD.show = false;
        }

        self.selectionB.show = false;
        self.selectionC.show = false;
        self.selectionD.show = false;

        this.continueSign.setText('order');

        // register screen shake
        this.shaker = new ScreenShaker(this.device);
        this.shakerResizeId = this.events.subscribe(Event.RESIZE, this.shaker.resize.bind(this.shaker));
        this.shakerTickId = this.events.subscribe(Event.TICK_MOVE, this.shaker.update.bind(this.shaker));

        this.drawables.forEach(function (drawable) {
            this.shaker.add(drawable);
        }, this);
    };

    BridgeOrders.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
        this.events.unsubscribe(this.gamePadListener);

        // un-register screen shake
        this.events.unsubscribe(this.shakerTickId);
        this.events.unsubscribe(this.shakerResizeId);
    };

    BridgeOrders.prototype.bigShake = function () {
        this.shaker.startBigShake();
    };

    BridgeOrders.prototype.smallShake = function () {
        this.shaker.startSmallShake();
    };

    BridgeOrders.prototype.aUp = function () {
        if (this.itIsOver)
            return;

        this.itIsOver = true;
        this.nextScene(OrderOption.A);
    };

    BridgeOrders.prototype.aDown = function () {
    };

    BridgeOrders.prototype.bUp = function () {
        if (this.itIsOver)
            return;

        this.itIsOver = true;
        this.nextScene(OrderOption.B);
    };

    BridgeOrders.prototype.bDown = function () {
    };

    BridgeOrders.prototype.cUp = function () {
        if (this.itIsOver)
            return;

        this.itIsOver = true;
        this.nextScene(OrderOption.C);
    };

    BridgeOrders.prototype.cDown = function () {
    };

    BridgeOrders.prototype.dUp = function () {
        if (this.itIsOver)
            return;

        this.itIsOver = true;
        this.nextScene(OrderOption.D);
    };

    BridgeOrders.prototype.dDown = function () {
    };

    return BridgeOrders;
})(H5.Event, H5.Key, G.OrderOption, H5.ScreenShaker);