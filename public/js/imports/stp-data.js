;
(function customizeSTPUploadBTN() {
    $('.labelBtn').on('click', () => {
        $('#upload-stp').click();
    });
})();

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

(function showHideSTPHourReadingEVNEvent() {
    $('#hour-reading').on('click', function hideEVNRadioBTN() {
        $('#data > div:nth-child(5) > label:nth-child(1)').hide();
    });
    $('#prediction').on('click', function showEVNRadioBTN() {
        $('#data > div:nth-child(5) > label:nth-child(1)').show();
    })
}())

($('body > div.container').click(() => {
    if ($('#hour-reading').is(':checked')) {
        importType.setType(importTypes.hour_reading);
        handleEventListeners(importTypes.hour_reading);
    } else if ($('#prediction').is(':checked')) {
        importType.setType(importTypes.prediction);
        handleEventListeners(importTypes.prediction);
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
    const checker = validateSTPInput();
    checker ? showUploadBlocksSTP() : '';
}));

function showUploadBlocksSTP() {
    $('#data-import').removeClass('invisible');
    $('#data > div:nth-child(7)').removeClass('invisible');
}

function validateSTPInput() {
    let importDataType = false;
    $("input[name='importDataType']").each(function () {
        const checked = $(this).prop('checked');
        checked ? importDataType = true : '';
    });
    let importDataERP = false;
    $("input[name='data-erp']").each(function () {
        const checked = $(this).prop('checked');
        checked ? importDataERP = true : '';
    });

    if (importDataERP && importDataType) {
        return true;
    }
    return false;
}

function processHourReadingFile(e) {

    $('.clients-no-profile').remove();
    e.stopPropagation();
    e.preventDefault();
    notification('Зареждане', 'loading');
    const meteringType = 2; // STP Hourly
    const profileID = 0;
    const isManufacturer = 0;
    const erp_type = company.getErpType();
    try {
        files = e.dataTransfer.files,
            f = files[0];
    } catch (e) {
        files = document.getElementById('upload-stp').files,
            f = document.getElementById('upload-stp').files[0];
    }
    var reader = new FileReader();
    let fileName = '';
    try {
        fileName = e.dataTransfer.files[0].name
    } catch (e) {
        fileName = document.getElementById('upload-stp').files[0].name;
    }
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

            let worksheetX = workbook.Sheets[workbook.SheetNames[0]];
            let nameOfThirdCell = worksheetX['A1'].v || 0;
            validateHourReadingDocument(nameOfThirdCell);
            if (company.getCompany() === companies.CEZ) {
                let first_sheet_name = workbook.SheetNames[0];
                var worksheet = workbook.Sheets[first_sheet_name];
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
                            let undefinedHour = undefined;

                            try {
                                var currHourValue = (arr[0][y].split(' ')[1].split(':')[0]) - 1 === -1 ? 23 : (arr[0][y].split(' ')[1].split(':')[0]) - 1;
                            } catch (e) {
                                currHourValue = -1
                            }

                            try {
                                var nextHourValue = (arr[0][y + 1].split(' ')[1].split(':')[0]) - 1 === -1 ? 23 : (arr[0][y + 1].split(' ')[1].split(':')[0]) - 1;
                            } catch (e) {
                                nextHourValue = -1
                            }


                            if (currHourValue === nextHourValue) {
                                undefinedHour = Number(arr[i][y]) + Number(arr[i][y + 1]);
                                y += 1;
                            } else if (currHourValue != val) {
                                undefinedHour = -1;
                                y -= 1;
                            }

                            currHourObj = {
                                currHour: val,
                                currValue: undefinedHour || arr[i][y]
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
                                let currDate = currDateHelper.split(" ")[0].split('.');
                                const fixedDate = currDate[0];
                                const currMonth = currDate[1];
                                const currYear = currDate[2];
                                const realDate = new Date(`${currMonth}-${fixedDate}-${currYear}`);
                                for (let val = 0; val < 24; val += 1) {
                                    currHourObj = {
                                        currHour: val,
                                        currValue: arr[x][y]
                                    }
                                    currHourValues.push(currHourObj);
                                    y += 1;
                                }

                                let formattedDate = `${realDate.getFullYear()}-${realDate.getMonth()+1}-${realDate.getDate()}`;
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
                saveSTPHourReadingsToDB(allSTPHourReadings);
            } else if (company.getCompany() === companies.EVN) {
                notification('Опцията за EVN е преместена в импорти - фактуриране.', 'error');
            }
        };
        reader.readAsArrayBuffer(f);
    } else {
        throwErrorForInvalidFileFormat();
    }
}

function processPredictionFile(e) {
    $('.clients-no-profile').remove();
    e.stopPropagation();
    e.preventDefault();
    notification('Зареждане', 'loading');
    try {
        files = e.dataTransfer.files,
            f = files[0];
    } catch (e) {
        files = document.getElementById('upload-stp').files,
            f = document.getElementById('upload-stp').files[0];
    }
    var reader = new FileReader();
    let fileName = '';
    try {
        fileName = e.dataTransfer.files[0].name
    } catch (e) {
        fileName = document.getElementById('upload-stp').files[0].name;
    }
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
            const meteringType = 2; // STP
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
            saveClientsToDB(clientsAll);

            // ImportSTP Predictions
            let clientsWithoutProfile = [];
            let startingIndexOfLoadValues = stpPrediction.getStartingIndexOfAmountValues();
            for (let i = 1; i < arr.length; i += 1) {
                let ident_code = arr[i][clientIdentCodeIndex];
                if (getProfile(ident_code) === 0) {
                    clientsWithoutProfile.push(ident_code);
                }
                for (let y = startingIndexOfLoadValues; y < arr[i].length; y += 1) {
                    if (ident_code != '' && ident_code != undefined && ident_code != null) {
                        clientID = getClientsFromDB(ident_code);
                        let dateHelper = arr[0][y].split('.');
                        let currAmount = arr[i][y];
                        let date = `${dateHelper[1]}-${dateHelper[0]}-01`;
                        let createdDate = new Date();
                        stpPredictionReading.push(clientID, `${date}`, currAmount, type, createdDate);
                        allSTPpredictions.push(stpPredictionReading);
                        stpPredictionReading = [];
                    }
                }
            }
            if (clientsWithoutProfile.length > 0) {
                let clientsNoProfile = $('<div class="clients-no-profile mt-5"></div>');
                clientsNoProfile.text('Клиенти ' + clientsWithoutProfile.join(', ') + ' нямат профил! Трябва да им се сложат профили, за да се изчислят графиците!');
                clientsNoProfile.appendTo($('#data'));
                console.log('Клиенти ' + clientsWithoutProfile.join(', ') + ' нямат профил! Трябва да им се сложат профили.');
            }
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
    console.log(clients)
    $.ajax({
        url: '/addclients',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        data: JSON.stringify(clients),
        success: function data() {},
        error: function (jqXhr, textStatus, errorThrown) {
            notification(jqXhr.responseText, 'success');
        }
    });
};

function getClientsFromDB(client) {
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
        }
    });
    return retVal;
};

function getClientsHourlyFromDB(clients) {
    let retVal;
    $.ajax({
        url: '/api/getClients',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        data: JSON.stringify(clients),
        success: function (data) {
            retVal = data;
        },
        error: function (jqXhr, textStatus, errorThrown) {
            notification(errorThrown, 'error');
        }
    });
    return retVal;
};

function saveGraphHourReadingsToDB(readings) {
    console.log(readings);
    $.ajax({
        url: '/api/saveGraphHourReadings',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(readings),
        success: function (data) {},
        error: function (jqXhr, textStatus, errorThrown) {
            notification(jqXhr.responseText, 'success');
        }
    });
    notification('Данните се обработват', 'loading');
};

function saveSTPHourReadingsToDB(readings) {
    $.ajax({
        url: '/api/addSTPHourReadings',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(readings),
        success: function (data) {},
        error: function (jqXhr, textStatus, errorThrown) {
            notification(jqXhr.responseText, 'success');
        }
    });
    notification('Данните се обработват', 'loading');
};


function saveSTPpredictionsToDB(STPPredictions) {
    $.ajax({
        url: '/api/STP-Predictions',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(STPPredictions),
        success: function (data) {},
        error: function (jqXhr, textStatus, errorThrown) {
            notification(jqXhr.responseText, 'success');
        }
    });
    notification('Данните се обработват', 'success');
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

function handleEventListeners(dataImportType) {
    if (dataImportType == importTypes.hour_reading) {
        removePredictionEventListeners();
        addHourReadingEventListeners();
    } else if (dataImportType == importTypes.prediction) {
        removeHourReadingEventListeners();
        addPredictionEventListeners();
    }
}

function addHourReadingEventListeners() {
    document.getElementById('data-import').addEventListener('drop', processHourReadingFile, false);
    document.getElementById('upload-stp').addEventListener('change', processHourReadingFile, false);
}

function addPredictionEventListeners() {
    document.getElementById('data-import').addEventListener('drop', processPredictionFile, false);
    document.getElementById('upload-stp').addEventListener('change', processPredictionFile, false);
}

function removePredictionEventListeners() {
    document.getElementById('data-import').removeEventListener('drop', processPredictionFile, false);
    document.getElementById('upload-stp').removeEventListener('change', processPredictionFile, false);
}

function removeHourReadingEventListeners() {
    document.getElementById('data-import').removeEventListener('drop', processHourReadingFile, false);
    document.getElementById('upload-stp').removeEventListener('change', processHourReadingFile, false);
}

function validateDocumentSTPPrediction() {
    if (stpPrediction.getCompany() == '') {
        notification('Избери компания', 'error');
        throw new Error('Избери компания');
    }
}

function getProfile(identCode) {
    let profile;
    $.ajax({
        url: `/api/getProfile/${identCode}`,
        method: 'GET',
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        success: function (data) {
            profile = data;
        },
        error: function (jqXhr, textStatus, errorThrown) {
            notification(jqXhr.responseText, 'success');
        }
    });
    return profile;
}