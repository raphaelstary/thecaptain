G.BridgeOrders = (function (Event, Key, OrderOption) {
    "use strict";

    function BridgeOrders(services, name, optionA, optionB, optionC, optionD) {
        this.events = services.events;

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
    };

    BridgeOrders.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
        this.events.unsubscribe(this.gamePadListener);
    };

    return BridgeOrders;
})(H5.Event, H5.Key, G.OrderOption);