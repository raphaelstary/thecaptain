G.createShipFight = (function (Bridge, ShipFight) {
    "use strict";

    function createShipFight(services, dialogs) {

        var bridgeView = new Bridge(services, crew);
        return new ShipFight(bridgeView, dialogs, ship, enemy);
    }

    var ship = {
        shields: 80,
        shieldsMax: 80,
        hull: 90,
        hullMax: 90,
        energy: 100,
        energyMax: 100
    };

    var enemy = {
        shields: 30,
        hull: 20,
        commands: [
            {
                dialog: 'laser_enemy',
                damage: 20,
                probability: 60
            }, {
                dialog: 'triple_laser_enemy',
                damage: 40,
                probability: 40
            }
        ]
    };

    var crew = {
        engineering: {
            name: 'Lt.Cmdr. Scott',
            position: 'Engineering Officer',
            commands: [
                {
                    name: 'more e. shields'
                }, {
                    name: 'less e. shields'
                }, {
                    name: 'more e. lasers'
                }, {
                    name: 'less e. lasers'
                }
            ]
        },
        tactics: {
            name: 'Lt. Giotto',
            position: 'Tactical Officer', // or maybe? Operations Officer
            commands: [
                {
                    name: 'shields up'
                }, {
                    name: 'shields down'
                }, {
                    name: 'decks report'
                }
            ]
        },
        navigation: {
            name: 'Lt. Sulu',
            position: 'Navigation Officer',
            commands: [
                {
                    name: 'hyper space'
                }, {
                    name: 'barrel roll'
                }
            ]
        },
        weapons: {
            name: 'Ens. Checkov',
            position: 'Weapons Officer',
            commands: [
                {
                    type: 'attack',
                    name: 'Laser',
                    dialog: 'laser',
                    energy: 5,
                    damage: 5
                }, {
                    type: 'attack',
                    name: 'Torpedo',
                    dialog: 'torpedo',
                    count: 5,
                    max: 5,
                    damage: 20
                }
            ]
        },
        science: {
            name: 'Lt.Cmdr. Spock',
            position: 'Science Officer',
            commands: [
                {
                    name: 'scan ship'
                }, {
                    name: 'scan weapons'
                }
            ]
        },
        communication: {
            name: 'Lt. Uhura',
            position: 'Communications Officer',
            commands: [
                {
                    name: 'call enemy'
                }, {
                    name: 'call fleet'
                }
            ]
        }
    };

    return createShipFight;
})(G.Bridge, G.ShipFight);