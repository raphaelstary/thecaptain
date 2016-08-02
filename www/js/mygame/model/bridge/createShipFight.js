G.createShipFight = (function (Bridge, ShipFight) {
    "use strict";

    function createShipFight(services, dialogs, shipStats, enemy) {

        var ship = {
            shields: 0,
            shieldsMax: 80,
            hull: shipStats.hull,
            hullMax: 90,
            energy: 100,
            energyMax: 100,
            defense: 0,
            defenseMax: 1
        };

        var crew = {
            engineering: {
                name: 'Lt.Cmdr. Scotch',
                position: 'Engineering Officer',
                commands: [
                    {
                        type: 'setter',
                        name: 'recharge e.',
                        dialog: 'recharge_energy',
                        actions: [
                            {
                                property: 'energy',
                                value: 80
                            }
                        ],
                        precondition: {
                            property: 'energy',
                            value: 'not_max',
                            dialog: 'energy_max'
                        }
                    }, {
                        type: 'dialog',
                        name: 'e. to lasers',
                        dialog: 'energy'
                    }, {
                        type: 'dialog',
                        name: 'e. to shields',
                        dialog: 'energy'
                    }
                ]
            },
            tactics: {
                name: 'Lt. Buonanotte',
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
                        ],
                        precondition: {
                            property: 'energy',
                            value: 50,
                            dialog: 'energy_low'
                        }
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
                        ],
                        precondition: {
                            property: 'shields',
                            value: 1,
                            dialog: 'no_shields'
                        }

                    }, {
                        type: 'dialog',
                        name: 'decks report',
                        dialog: 'decks_report'
                    }
                ]
            },
            navigation: {
                name: 'Lt. Satoshi',
                position: 'Navigation Officer',
                commands: [
                    {
                        type: 'dialog',
                        name: 'hyper space',
                        dialog: 'hyper_space'
                    }, {
                        type: 'setter',
                        name: 'barrel roll',
                        dialog: 'barrel_roll',
                        count: shipStats['barrel_roll_count'] !== undefined ? shipStats['barrel_roll_count'] : 5,
                        max: 5,
                        actions: [
                            {
                                property: 'energy',
                                value: -5
                            }, {
                                property: 'defense',
                                value: 'max'
                            }
                        ],
                        precondition: {
                            property: 'energy',
                            value: 5,
                            dialog: 'energy_low'
                        }
                    }
                ]
            },
            weapons: {
                name: 'Ens. Sputnik',
                position: 'Weapons Officer',
                commands: [
                    {
                        type: 'setter',
                        name: 'Laser',
                        dialog: 'laser',
                        actions: [
                            {
                                property: 'energy',
                                value: -10
                            }, {
                                property: 'damage',
                                value: 10
                            }
                        ],
                        precondition: {
                            property: 'energy',
                            value: 10,
                            dialog: 'energy_low'
                        }
                    }, {
                        type: 'setter',
                        name: 'Laser Burst',
                        dialog: 'laser_burst',
                        actions: [
                            {
                                property: 'energy',
                                value: -30
                            }, {
                                property: 'damage',
                                value: 20
                            }
                        ],
                        precondition: {
                            property: 'energy',
                            value: 30,
                            dialog: 'energy_low'
                        }
                    }, {
                        type: 'setter',
                        name: 'Torpedo',
                        dialog: 'torpedo',
                        count: shipStats['torpedo_count'] !== undefined ? shipStats['torpedo_count'] : 5,
                        max: 5,
                        actions: [
                            {
                                property: 'energy',
                                value: -5
                            }, {
                                property: 'damage',
                                value: 30
                            }
                        ],
                        precondition: {
                            property: 'energy',
                            value: 5,
                            dialog: 'energy_low'
                        }
                    }
                ]
            },
            science: {
                name: 'Cmdr. Pocks',
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
                name: 'Lt. Aruhu',
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

        var bridgeView = new Bridge(services, crew);

        return new ShipFight(bridgeView, dialogs, ship, enemy, shipStats);
    }

    return createShipFight;
})(G.Bridge, G.ShipFight);