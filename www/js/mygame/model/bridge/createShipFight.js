G.createShipFight = (function (Bridge, ShipFight) {
    "use strict";

    function createShipFight(services, dialogs, shipStats, enemy, crew) {

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

        // count: shipStats['barrel_roll_count'] !== undefined ? shipStats['barrel_roll_count'] : 5

        var bridgeCrew = {
            engineering: crew['scotch'],
            tactics: crew['buonanotte'],
            navigation: crew['satoshi'],
            weapons: crew['sputnik'],
            science: crew['pocks'],
            communication: crew['aruhu']
        };

        var bridgeView = new Bridge(services, bridgeCrew);

        return new ShipFight(bridgeView, dialogs, ship, enemy, shipStats);
    }

    return createShipFight;
})(G.Bridge, G.ShipFight);