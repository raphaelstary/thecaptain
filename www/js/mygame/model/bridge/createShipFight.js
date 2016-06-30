G.createShipFight = (function (Bridge, ShipFight) {
    "use strict";

    function createShipFight(services, dialogs) {

        var bridgeView = new Bridge(services, crew);
        return new ShipFight(bridgeView, dialogs, ship, enemy);
    }

    var ship = {
        shields: 0,
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
                probability: 66
            }, {
                dialog: 'triple_laser_enemy',
                damage: 40,
                probability: 34
            }
        ]
    };

    var crew = {
        engineering: {
            name: 'Lt.Cmdr. Scott',
            position: 'Engineering Officer',
            commands: [
                {
                    type: 'engineering',
                    name: 'more e. shields'
                }, {
                    type: 'engineering',
                    name: 'less e. shields'
                }, {
                    type: 'engineering',
                    name: 'more e. lasers'
                }, {
                    type: 'engineering',
                    name: 'less e. lasers'
                }
            ]
        },
        tactics: {
            name: 'Lt. Giotto',
            position: 'Tactical Officer', // or maybe? Operations Officer
            commands: [
                {
                    type: 'setter',
                    name: 'shields up',
                    dialog: 'shields_up',
                    actions: [
                        {
                            property: 'energy',
                            value: -50
                        }, {
                            property: 'shields',
                            value: 'max'
                        }
                    ]
                }, {
                    type: 'setter',
                    name: 'shields down',
                    dialog: 'shields_down',
                    actions: [
                        {
                            property: 'shields',
                            value: 'min'
                        }, {
                            property: 'energy',
                            value: 30
                        }
                    ]

                }, {
                    type: 'dialog',
                    name: 'decks report',
                    dialog: 'decks_report'
                }
            ]
        },
        navigation: {
            name: 'Lt. Sulu',
            position: 'Navigation Officer',
            commands: [
                {
                    type: 'dialog',
                    name: 'hyper space',
                    dialog: 'hyper_space'
                }, {
                    type: 'navigation',
                    name: 'barrel roll'
                }
            ]
        },
        weapons: {
            name: 'Ens. Checkov',
            position: 'Weapons Officer',
            commands: [
                {
                    type: 'setter',
                    name: 'Laser',
                    dialog: 'laser',
                    actions: [
                        {
                            property: 'energy',
                            value: -20
                        }, {
                            property: 'damage',
                            value: 5
                        }
                    ]
                }, {
                    type: 'setter',
                    name: 'Torpedo',
                    dialog: 'torpedo',
                    count: 5,
                    max: 5,
                    actions: [
                        {
                            property: 'energy',
                            value: -5
                        }, {
                            property: 'damage',
                            value: 20
                        }
                    ]
                }
            ]
        },
        science: {
            name: 'Lt.Cmdr. Spock',
            position: 'Science Officer',
            commands: [
                {
                    type: 'dialog',
                    name: 'scan ship',
                    dialog: 'scan_ship'
                }, {
                    type: 'dialog',
                    name: 'scan weapons',
                    dialog: 'scan_weapons'
                }
            ]
        },
        communication: {
            name: 'Lt. Uhura',
            position: 'Communications Officer',
            commands: [
                {
                    type: 'dialog',
                    name: 'call enemy',
                    dialog: 'call_enemy'
                }, {
                    type: 'dialog',
                    name: 'call fleet',
                    dialog: 'call_fleet'
                }
            ]
        }
    };

    return createShipFight;
})(G.Bridge, G.ShipFight);