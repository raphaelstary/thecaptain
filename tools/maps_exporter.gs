function onOpen() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var menuEntries = [
        {
            name: "Export Levels",
            functionName: "exportLevels"
        }
    ];
    ss.addMenu("Export JSON", menuEntries);
}

function makeTextBox(app, name) {
    return app.createTextArea().setWidth('100%').setHeight('200px').setId(name).setName(name);
}

function exportLevels() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var sheetsData = {};
    for (var i = 0; i < sheets.length; i++) {
        var sheet = sheets[i];
        var sheetName = sheet.getName();
        if (startsWith(sheetName, 'map_')) {
            sheetsData[sheetName.substring(4)] = getRows(sheet);
        }
    }
    return displayText_(JSON.stringify(sheetsData));
}

function displayText_(text) {
    var app = UiApp.createApplication().setTitle('Exported JSON');
    app.add(makeTextBox(app, 'json'));
    app.getElementById('json').setText(text);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ss.show(app);
    return app;
}

var BackgroundTiles = {
    F: 'F' // floor
};
var ForegroundTiles = {
    P: 'P' // player
};

function getRows(sheet) {
    var returnObject = {
        back: [],
        front: []
    };
    var values = sheet.getSheetValues(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());

    for (var i = 0; i < values.length; i++) {
        var row = values[i];
        var foregroundRow = [];
        var backgroundRow = [];

        for (var j = 0; j < row.length; j++) {
            var cell = row[j];
            var tileValues = cell.split(',');

            foregroundRow.push(getTileCode(tileValues));
            backgroundRow.push(getBackgroundTileCode(tileValues));

        }
        returnObject.front.push(foregroundRow);
        returnObject.back.push(backgroundRow);
    }
    return returnObject;
}

function getTileCode(cellValues) {
    for (var i = 0; i < cellValues.length; i++) {
        var cellValue = cellValues[i];
        for (var key in ForegroundTiles) {
            if (startsWith(cellValue, key)) {
                var tile = ForegroundTiles[key];
                return tile === ForegroundTiles.B ? tile + boxCounter++ : tile;
            }
        }
    }
    return 0;
}

function getBackgroundTileCode(cellValues) {
    for (var i = 0; i < cellValues.length; i++) {
        var cellValue = cellValues[i];
        for (var key in BackgroundTiles) {
            if (startsWith(cellValue, key))
                return BackgroundTiles[key];
        }
    }
    return 0;
}

function contains(actualString, searchString) {
    return actualString.indexOf(searchString) !== -1;
}

function startsWith(actualString, searchString) {
    return actualString.indexOf(searchString, 0) === 0;
}