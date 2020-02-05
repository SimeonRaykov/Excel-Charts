const companies = {
    ENERGO_PRO: 'ENERGO_PRO',
    EVN: 'EVN',
    CEZ: 'CEZ'
};

class GraphPrediction {
    constructor() {
        this.company = '';
        this.name = '';
        this.ERP = '';
    }
    getCompany() {
        return this.company;
    }
    getType() {
        return this.ERP;
    }
    setCompany(company) {
        this.company = company;
        return this;
    }
    setType(ERP) {
        this.ERP = ERP;
        return this;
    }
}

let graphPrediction = new GraphPrediction();
Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

$(document).ready(function () {
    document.getElementById('input-excel').addEventListener('drop', processFile, false);
});

($('body > div.container').click(() => {
    if ($('#energo-pro').is(':checked')) {
        graphPrediction.setCompany('ENERGO_PRO').setType(3);
    } else if ($('#evn').is(':checked')) {
        graphPrediction.setCompany('EVN').setType(1);
    } else if ($('#cez').is(':checked')) {
        graphPrediction.setCompany('CEZ').setType(2);
    }
}));

function processFile(e) {
    e.stopPropagation();
    e.preventDefault();

    const meteringType = 1; // Hour-Reading
    const profileID = 0;
    const isManufacturer = 0;


    var files = e.dataTransfer.files,
        f = files[0];
    var reader = new FileReader();
    var fileName = e.dataTransfer.files[0].name;
    let helperDate = fileName.split('.');
    let documentDate = `${helperDate[1]}.${helperDate[0]}.${helperDate[2]}`;
    let extension = fileName.slice(fileName.lastIndexOf('.') + 1);

    if (extension === 'xlsx' || extension === 'xls') {
        reader.onload = function (e) {
            fileName = fileName.replace(extension, "");
            fileName = fileName.substring(0, fileName.length - 1);
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, {
                type: 'array'
            });
            let first_sheet_name = workbook.SheetNames[0];
            //    console.log(getCols(workbook['Sheets'][`${first_sheet_name}`]));

            let client = [];
            let clientsAll = [];
            let clientID;
            let allGraphHourReadings = [];
            let graph_hour_reading = [];
            let currHourValues = [];
            let type = 1;
            let ERP = graphPrediction.getType();
            let arr = getCols(workbook['Sheets'][`${first_sheet_name}`]);

            validateDocument();
            for (let i = 1; i < arr.length; i += 1) {
                let clientName = arr[i][0];
                let clientIdentCode = arr[i][1];
                if (clientIdentCode != null && clientIdentCode != undefined) {
                    client.push(0, clientName, clientIdentCode, meteringType, profileID,graphPrediction.getType(), isManufacturer, new Date());
                    clientsAll.push(client);
                    client = [];
                }
            }
            saveClientsToDB(clientsAll);
            let date = new Date(documentDate);
            for (let i = 1; i < arr.length; i += 1) {
                let ident_code = arr[i][1];
                for (let y = 2; y < arr[i].length; y += 1) {
                    let currHourHelper = arr[0][y].split(":");
                    let currHour = currHourHelper[0] - 1;
                    if (currHour == -1) {
                        currHour = 23;
                    }
                    let currValue = arr[i][y];
                    let currHourObj = {
                        currHour,
                        currValue
                    }
                    currHourValues.push(currHourObj);
                }
                if (ident_code != '' && ident_code != undefined && ident_code != null) {
                    clientID = getClientIDFromDB(ident_code);
                    let createdDate = new Date();
                    graph_hour_reading.push(clientID, date, currHourValues, type, ERP, createdDate);
                    allGraphHourReadings.push(graph_hour_reading);
                    graph_hour_reading = [];
                    currHourValues = [];
                }
            }
            saveHourReadingsToDB(allGraphHourReadings);
            return;
        };
        reader.readAsArrayBuffer(f);
    } else {
        throwErrorForInvalidFileFormat();
    }
}

function throwErrorForInvalidFileFormat() {
    notification('Invalid file format', 'error');
}

function getCols(sheet) {
    var result = [];
    var row;
    var rowNum;
    var colNum;
    var range = XLSX.utils.decode_range(sheet['!ref']);
    for (rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
        row = [];
        for (colNum = range.s.c; colNum <= range.e.c; colNum++) {
            var nextCell = sheet[
                XLSX.utils.encode_cell({
                    r: rowNum,
                    c: colNum
                })
            ];
            if (typeof nextCell === 'undefined') {
                row.push(void 0);
            } else row.push(nextCell.w);
        }
        result.push(row);
    }
    return result;
}

function changeClientIdForHourReadings(allHourReadings, cl) {
    allHourReadings.forEach(hour_reading => {
        if (cl != undefined) {
            for (let i = 0; i < cl.length; i++) {
                if (cl[i].ident_code == hour_reading['1']) {
                    hour_reading['1'] = cl[i].id;
                }
            }
        }
    });
};

function convertClientIDsToString(clientIDs) {
    return clientIDs.map(clientID => convertClientIDToString(clientID));
}

function convertClientIDToString(clientID) {
    return `"${clientID}"`;
}

function filterClients(clientsAll) {
    let filteredclientsAll = [];
    let filteredClients = '';
    let isFalse = false;

    for (let i = 0; i <= clientsAll.length; i += 1) {
        if (clientsAll[i] != undefined) {
            if (clientsAll[i].length > 1) {
                isFalse = false;
                filteredClients = clientsAll[i].filter(el => {
                    if (el == "") {
                        isFalse = true;
                        return false;
                    }
                    return true;
                });
                if (filteredClients != undefined && filteredClients != '' && filteredClients != null) {
                    if (!isFalse) {
                        filteredclientsAll.push(filteredClients);
                    }
                }
            }
        }
    }
    return filteredclientsAll;
}

function saveClientsToDB(clients) {
    notification('Loading..', 'loading');
    $.ajax({
        url: '/addclients',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        data: JSON.stringify(clients),
        success: function data() {
            console.log('Clients saved');
        },
        error: function (jqXhr, textStatus, errorThrown) {
            //  notification(errorThrown, 'error');
            console.log('error in save clients');
        }
    });
};

function getClientIDFromDB(client) {
    notification('Loading..', 'loading');
    let retVal;
    $.ajax({
        url: '/api/getSingleClient',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        data: JSON.stringify({
            ident_code: client
        }),
        success: function (data) {
            retVal = data;
        },
        error: function (jqXhr, textStatus, errorThrown) {
            notification(errorThrown, 'error');
            console.log('error');
        }
    });
    return retVal;
};

function saveHourReadingsToDB(readings) {
    $.ajax({
        url: '/api/saveGraphHourReadings',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(readings),
        success: function (data) {
            console.log('Readings saved');
        },
        error: function (jqXhr, textStatus, errorThrown) {
            //   notification(errorThrown, 'error');
            console.log('error in save readings');
        }
    });
    notification('Everything is good', 'success');
};

function notification(msg, type) {
    toastr.clear();
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    if (type == 'error') {
        toastr.error(msg);
    } else if (type == 'success') {
        toastr.success(msg);
    } else if (type == 'loading') {
        toastr.info(msg);
    }
};

function validateDocument() {
    if (graphPrediction.getCompany() == '') {
        notification('Избери компания', 'error');
        throw new Error('Избери компания');
    }
}