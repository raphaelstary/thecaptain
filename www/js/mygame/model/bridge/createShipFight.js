G.createShipFight = (function (Bridge, ShipFight) {
    "use strict";

    function createShipFight(services, dialogs, shipStats, enemyStats, bridgeCrew, crew, flags) {

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

        var crewMembers = [];
        if (bridgeCrew.engineering)
            crewMembers.push(crew[bridgeCrew.engineering]);
        if (bridgeCrew.tactics)
            crewMembers.push(crew[bridgeCrew.tactics]);
        if (bridgeCrew.navigation)
            crewMembers.push(crew[bridgeCrew.navigation]);
        if (bridgeCrew.weapons)
            crewMembers.push(crew[bridgeCrew.weapons]);
        if (bridgeCrew.science)
            crewMembers.push(crew[bridgeCrew.science]);
        if (bridgeCrew.communication)
            crewMembers.push(crew[bridgeCrew.communication]);

        function isConditionMet(command) {
            if (!command.condition)
                return true;
            return flags[command.condition];
        }

        function setMax(command) {
            if (command.max !== undefined) {
                command.count = shipStats[command.dialog + '_count'] !== undefined ?
                    shipStats[command.dialog + '_count'] : command.max;
            }
        }

        function deepCopy(officer) {
            var commands = officer.commands.filter(isConditionMet);
            commands.forEach(setMax);
            return new Officer(officer.positionKey, officer.position, officer.name, officer.asset, commands);
        }

        var bridgeView = new Bridge(services, crewMembers.map(deepCopy).reduce(toDict, {}));

        return new ShipFight(bridgeView, dialogs, ship, enemy, shipStats);
    }

    function Officer(positionKey, position, name, asset, commands) {
        this.positionKey = positionKey;
        this.position = position;
        this.name = name;
        this.asset = asset;
        this.commands = commands;
    }

    function toDict(prev, officer) {
        prev[officer.positionKey] = officer;
        return prev;
    }

    return createShipFight;
})(G.Bridge, G.ShipFight);