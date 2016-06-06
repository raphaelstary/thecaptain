function onOpen() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var menuEntries = [
        {
            name: "Export Levels",
            functionName: "exportData"
        }
    ];
    ss.addMenu("Export JSON", menuEntries);
}

function makeTextBox(app, name) {
    return app.createTextArea().setWidth('100%').setHeight('200px').setId(name).setName(name);
}

function exportData() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var sheetsData = {};
    for (var i = 0; i < sheets.length; i++) {
        var sheet = sheets[i];
        var map = exportMap(sheet);
        if (map) {
            sheetsData[sheet.getName()] = map;
            continue;
        }
        var signs = exportSignData(sheet);
        if (signs) {
            sheetsData.signs = signs;
            // continue;
        }
    }
    return displayText_(JSON.stringify(sheetsData));
}

function exportSignData(sheet) {
    if (sheet.getName() != 'signs')
        return false;

    var dict = {};

    var values = sheet.getSheetValues(2, 1, sheet.getLastRow(), 2);
    for (var i = 0; i < values.length; i++) {
        var row = values[i];
        if (row[0])
            dict[row[0]] = row[1];
    }

    return dict;
}

function exportMap(sheet) {
    if (startsWith(sheet.getName(), 'map_')) {
        return getRows(sheet);
    }
    return false;
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
    F: 'F', // floor
    G: 'G', // grass
    W: 'W' // way / walk
};
var ForegroundTiles = {
    S: 'S', // sign
    P: 'P', // player
    N: 'N' // NPC
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
                return cellValue;
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
                return cellValue;
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