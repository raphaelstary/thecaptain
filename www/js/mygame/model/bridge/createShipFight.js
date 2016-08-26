G.createShipFight = (function (Bridge, ShipFight, iterateEntries) {
    "use strict";

    function createShipFight(services, dialogs, shipStats, enemyStats, bridgeCrewInfo, crew) {

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

        var enemy = {
            name: enemyStats.name,
            asset: enemyStats.asset,
            shields: enemyStats.shields,
            hull: enemyStats.hull,
            commands: enemyStats.commands
        };

        var bridgeCrew = {};

        if (bridgeCrewInfo.engineering)
            bridgeCrew.engineering = crew[bridgeCrewInfo.engineering];
        if (bridgeCrewInfo.tactics)
            bridgeCrew.tactics = crew[bridgeCrewInfo.tactics];
        if (bridgeCrewInfo.navigation)
            bridgeCrew.navigation = crew[bridgeCrewInfo.navigation];
        if (bridgeCrewInfo.weapons)
            bridgeCrew.weapons = crew[bridgeCrewInfo.weapons];
        if (bridgeCrewInfo.science)
            bridgeCrew.science = crew[bridgeCrewInfo.science];
        if (bridgeCrewInfo.communication)
            bridgeCrew.communication = crew[bridgeCrewInfo.communication];

        iterateEntries(bridgeCrew, function (officer) {
            officer.commands.forEach(function (command) {
                if (command.max !== undefined) {
                    command.count = shipStats[command.dialog + '_count'] !== undefined ?
                        shipStats[command.dialog + '_count'] : command.max;
                }
            });
        });

        var bridgeView = new Bridge(services, bridgeCrew);

        return new ShipFight(bridgeView, dialogs, ship, enemy, shipStats);
    }

    return createShipFight;
})(G.Bridge, G.ShipFight, H5.iterateEntries);