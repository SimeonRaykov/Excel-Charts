const companies = {
    ENERGO_PRO: 'ENERGO_PRO',
    EVN: 'EVN',
    CEZ: 'CEZ'
};

const importTypes = {
    graph: 'graph',
    hour_reading: 'hour-reading',
    prediction: 'prediction'
}

class DataImportType {
    constructor() {
        this.type = '';
    }
    getImportType() {
        return this.type;
    }
    setType(type) {
        this.type = type;
    }
}

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

class HourReadingInfo {
    constructor() {
        this.company = '';
        this.erpType = '';
    }
    getCompany() {
        return this.company;
    }
    getErpType() {
        return this.erpType;
    }
    setCompany(company) {
        this.company = company;
        return this;
    }
    setErpType(type) {
        this.erpType = type;
        return this;
    }
}

class STPPrediction {
    constructor() {}
    getCompany() {
        return this.company;
    }
    getType() {
        return this.ERP;
    }
    getStartingIndexOfAmountValues() {
        return this.amountIndex;
    }
    getIndexOfIdentCode() {
        return this.indexID;
    }
    setCompany(company) {
        this.company = company;
        return this;
    }
    setType(ERP) {
        this.ERP = ERP;
        return this;
    }
    setStartingIndexOfAmountValues(amountIndex) {
        this.amountIndex = amountIndex;
        return this;
    }
    setIndexOfIdentCode(indexID) {
        this.indexID = indexID;
        return this;
    }
}

let importType = new DataImportType();
let graphPrediction = new GraphPrediction();
let company = new HourReadingInfo();
let stpPrediction = new STPPrediction();

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

$(document).ready(function () {
    openDataImportTab();
});

($('body > div.container').click(() => {
    if ($('#hour-reading').is(':checked')) {
        importType.setType(importTypes.hour_reading);
        addDropEventListener(importTypes.hour_reading);
    } else if ($('#prediction').is(':checked')) {
        importType.setType(importTypes.prediction);
        addDropEventListener(importTypes.prediction);
    }

    if ($('#data-energo-pro').is(':checked')) {
        company.setCompany('ENERGO_PRO').setErpType(3);
        stpPrediction.setCompany('ENERGO_PRO').setType(3).setStartingIndexOfAmountValues(7).setIndexOfIdentCode(3);
    } else if ($('#data-evn').is(':checked')) {
        company.setCompany('EVN').setErpType(1);
        stpPrediction.setCompany('EVN').setType(1).setStartingIndexOfAmountValues(6).setIndexOfIdentCode(1);
    } else if ($('#data-cez').is(':checked')) {
        company.setCompany('CEZ').setErpType(2);
        stpPrediction.setCompany('CEZ').setType(2).setStartingIndexOfAmountValues(5).setIndexOfIdentCode(2);
    }
}));

function processHourReadingFile(e) {
    e.stopPropagation();
    e.preventDefault();
    const meteringType = 2; // STP Hourly
    const profileID = 0;
    const isManufacturer = 0;
    const erp_type = company.getErpType();
    var files = e.dataTransfer.files,
        f = files[0];
    var reader = new FileReader();
    var fileName = e.dataTransfer.files[0].name;
    let extension = fileName.slice(fileName.lastIndexOf('.') + 1);

    if (extension === 'xlsx' || extension === 'xls') {
        reader.onload = function (e) {

            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, {
                type: 'array'
            });

            let cl = [];
            let clientsIDs = [];
            let allClients = [];
            let allSTPHourReadings = [];
            let currHourValues = [];
            let currSTPHourReading = [];

            let first_sheet_nameX = workbook.SheetNames[0];
            let worksheetX = workbook.Sheets[first_sheet_nameX];
            let nameOfThirdCell = worksheetX['C1'].v;
            validateHourReadingDocument(nameOfThirdCell);
            if (company.getCompany() === companies.CEZ) {
                let first_sheet_name = workbook.SheetNames[0];
                //var address_of_cell = 'A139';
                /* Get worksheet */
                var worksheet = workbook.Sheets[first_sheet_name];
                /* Find desired cell */
                //var desired_cell = worksheet[address_of_cell];
                /* Get the value */
                //var desired_value = (desired_cell ? desired_cell.v : undefined);
                // console.log(Object.keys(workbook['Sheets']['Sheet1']));
                //console.log(desired_value);

                //   console.log(getCols(workbook['Sheets'][`${first_sheet_name}`]));
                let arr = getCols(workbook['Sheets'][`${first_sheet_name}`]);
                let client = [];
                for (let i = 1; i < arr.length; i += 1) {
                    let clientName = arr[i][0];
                    let clientID = arr[i][1];
                    let typeEnergy = arr[i][2];
                    for (let y = 4; y < arr[i].length; y += 1) {
                        let currDateHelper = `${arr[0][y]}`;
                        let currDate = new Date(currDateHelper.split(" ")[0]);
                        for (let val = 0; val < 24; val += 1) {
                            currHourObj = {
                                currHour: val,
                                currValue: arr[i][y]
                            }
                            currHourValues.push(currHourObj);
                            y += 1;
                        }
                        let formattedDate = `${currDate.getFullYear()}-${currDate.getMonth()+1}-${currDate.getDate()}`;
                        if (!formattedDate.includes('NaN')) {
                            typeEnergy === "Активна енергия - Del" ? typeEnergy = 0 : typeEnergy = 1;
                            currSTPHourReading.push(clientName, clientID, typeEnergy, formattedDate, currHourValues, company.getErpType(), new Date());
                            allSTPHourReadings.push(currSTPHourReading);
                            currHourValues = [];
                            currSTPHourReading = [];
                            clientsIDs.push(clientID);
                            currHourObj = {};
                            client = [];
                            y -= 1;
                        }
                    }
                    client.push(0, clientName, clientID, meteringType, profileID, erp_type, isManufacturer, new Date());
                    allClients.push(client);
                }
                saveClientsToDB(allClients);
                cl = getClientsHourlyFromDB(convertClientIDsToString(clientsIDs));
                changeClientIdForHourReadings(allSTPHourReadings, cl);
                notification('loading', 'loading');
                saveSTPHourReadingsToDB(allSTPHourReadings);
            } else if (company.getCompany() === companies.ENERGO_PRO) {

                for (let i = 0; i < workbook.SheetNames.length; i += 1) {
                    let currentSheetName = workbook.SheetNames[i];
                    let arr = getCols(workbook['Sheets'][currentSheetName]);
                    if (arr[1] == '' || arr[1] == undefined || arr[1] == null) {
                        continue;
                    } else {
                        for (let x = 1; x < arr.length; x += 1) {
                            currHourValues = [];
                            const clientName = arr[x][0];
                            const clientIdentCode = arr[x][1];
                            const typeEnergy = 0;
                            for (let y = 3; y <= arr[x].length; y += 1) {
                                let currDateHelper = `${arr[0][y]}`;
                                let currDate = new Date(currDateHelper.split(" ")[0]);
                                for (let val = 0; val < 24; val += 1) {
                                    currHourObj = {
                                        currHour: val,
                                        currValue: arr[x][y]
                                    }
                                    currHourValues.push(currHourObj);
                                    y += 1;
                                }
                                let formattedDate = `${currDate.getFullYear()}-${currDate.getMonth()+1}-${currDate.getDate()}`;
                                if (!formattedDate.includes('NaN')) {
                                    currSTPHourReading.push(clientName, clientIdentCode, typeEnergy, formattedDate, currHourValues, company.getErpType(), new Date());
                                    allSTPHourReadings.push(currSTPHourReading);
                                    currHourValues = [];
                                    currSTPHourReading = [];
                                    clientsIDs.push(clientIdentCode);
                                    currHourObj = {};
                                    client = [];
                                    y -= 1;
                                }
                            }
                            client.push(0, clientName, clientIdentCode, meteringType, profileID, erp_type, isManufacturer, new Date());
                            allClients.push(client);
                        }
                    }
                }
                saveClientsToDB(allClients);
                cl = getClientsHourlyFromDB(convertClientIDsToString(clientsIDs));
                changeClientIDForReadings(allSTPHourReadings, cl);
                notification('loading', 'loading');
                saveSTPHourReadingsToDB(allSTPHourReadings);
            } else if (company.getCompany() === companies.EVN) {

            }
        };
        reader.readAsArrayBuffer(f);
    } else {
        throwErrorForInvalidFileFormat();
    }
}

async function processPredictionFile(e) {
    e.stopPropagation();
    e.preventDefault();
    await notification('Loading..', 'loading');
    var files = e.dataTransfer.files,
        f = files[0];
    var reader = new FileReader();
    var fileName = e.dataTransfer.files[0].name;
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

            const profileID = 0;
            const meteringType = 1; // Hour-Reading
            const isManufacturer = 0;

            let client = [];
            let clientsAll = [];
            let clientID;
            let allSTPpredictions = [];
            let stpPredictionReading = [];
            let type = stpPrediction.getType();
            let arr = getCols(workbook['Sheets'][`${first_sheet_name}`]);
            validateDocumentSTPPrediction();

            // ImportClients
            let clientIdentCodeIndex = stpPrediction.getIndexOfIdentCode();
            for (let i = 1; i < arr.length; i += 1) {
                let clientIdentCode = arr[i][clientIdentCodeIndex];
                if (clientIdentCode != null && clientIdentCode != undefined) {
                    client.push(0, 'NULL', clientIdentCode, meteringType, profileID, stpPrediction.getType(), isManufacturer, new Date());
                    clientsAll.push(client);
                    client = [];
                }
            }
            notification('Loading..', 'loading');
            saveClientsToDB(clientsAll);

            // ImportSTP Predictions
            let startingIndexOfLoadValues = stpPrediction.getStartingIndexOfAmountValues();
            for (let i = 1; i < arr.length; i += 1) {
                let ident_code = arr[i][clientIdentCodeIndex];
                for (let y = startingIndexOfLoadValues; y < arr[i].length; y += 1) {
                    if (ident_code != '' && ident_code != undefined && ident_code != null) {
                        clientID = getClientsFromDB(ident_code);
                        let dateHelper = arr[0][y].split('.');
                        let currAmount = arr[i][y];
                        let date = `${dateHelper[1]}-${dateHelper[0]}-01`;
                        console.log(date);
                        let createdDate = new Date();
                        stpPredictionReading.push(clientID, `${date}`, currAmount, type, createdDate);
                        allSTPpredictions.push(stpPredictionReading);
                        stpPredictionReading = [];
                    }
                }
            }
            notification('Loading..', 'loading');
            saveSTPpredictionsToDB(allSTPpredictions);
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

function changeClientIDForReadings(allHourReadings, cl) {
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

function changeClientIdForHourReadings(allSTPHourReadings, cl) {
    allSTPHourReadings.forEach(stp_hour_reading => {
        if (cl != undefined) {
            for (let i = 0; i < cl.length; i++) {
                if (cl[i].ident_code == stp_hour_reading['1']) {
                    stp_hour_reading['1'] = cl[i].id;
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

function getClientsFromDB(client) {
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

function getClientsHourlyFromDB(clients) {
    notification('Loading..', 'loading');
    let retVal;
    $.ajax({
        url: '/api/getClients',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        data: JSON.stringify(clients),
        success: function (data) {
            console.log('Got clients');
            retVal = data;
        },
        error: function (jqXhr, textStatus, errorThrown) {
            notification(errorThrown, 'error');
            console.log('error');
        }
    });
    return retVal;
};

function saveGraphHourReadingsToDB(readings) {
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

function saveSTPHourReadingsToDB(readings) {
    $.ajax({
        url: '/api/addSTPHourReadings',
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

function saveSTPpredictionsToDB(STPPredictions) {
    $.ajax({
        url: '/api/STP-Predictions',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(STPPredictions),
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

function validateGraphDocument() {
    if (graphPrediction.getCompany() == '') {
        notification('Избери компания', 'error');
        throw new Error('Избери компания');
    }
}

function validateHourReadingDocument(nameOfThirdCell) {
    if (company.getCompany() !== companies.CEZ) {
        console.log(nameOfThirdCell);
        if (nameOfThirdCell.includes('Сетълмент')) {
            notification(`Избрана е опция за ${company.getCompany()}, а е подаден документ за ЧЕЗ`, 'error')
            throw new Error(`Избрана е опция за ${company.getCompany()}, а е подаден документ за ЧЕЗ`);
        }
    }
}

function openDataImportTab() {
    $('body > div.container.mt-3 > ul > li:nth-child(1) > a').click();
}

function addDropEventListener(dataImportType) {
    if (dataImportType == importTypes.graph) {
        document.getElementById('data-import').addEventListener('drop', processGraphFile, false);
    } else if (dataImportType == importTypes.hour_reading) {
        document.getElementById('data-import').addEventListener('drop', processHourReadingFile, false);
    } else if (dataImportType == importTypes.prediction) {
        document.getElementById('data-import').addEventListener('drop', processPredictionFile, false);
    }
}

function validateDocumentSTPPrediction() {
    if (stpPrediction.getCompany() == '') {
        notification('Избери компания', 'error');
        throw new Error('Избери компания');
    }
}