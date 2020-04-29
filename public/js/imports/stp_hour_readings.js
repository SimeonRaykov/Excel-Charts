Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};
$(document).ready(function () {
    document.getElementById('input-excel').addEventListener('drop', processFile, false);
});

const companies = {
    ENERGO_PRO: 'ENERGO_PRO',
    EVN: 'EVN',
    CEZ: 'CEZ'
};

class Company {
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
let company = new Company();
($('body > div.container').click(() => {
    if ($('#energo-pro').is(':checked')) {
        company.setCompany('ENERGO_PRO').setErpType(3);
    } else if ($('#evn').is(':checked')) {
        company.setCompany('EVN').setErpType(1);
    } else if ($('#cez').is(':checked')) {
        company.setCompany('CEZ').setErpType(2);
    }
}));

function processFile(e) {
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
            validateDocument(nameOfThirdCell);
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
                console.log(allSTPHourReadings);
                saveClientsToDB(allClients);
                cl = getClientsFromDB(convertClientIDsToString(clientsIDs));
                changeClientIdForHourReadings(allSTPHourReadings, cl);
                notification('Зареждане', 'loading');
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
                cl = getClientsFromDB(convertClientIDsToString(clientsIDs));
                changeClientIdForHourReadings(allSTPHourReadings, cl);
                notification('Зареждане', 'loading');
                saveSTPHourReadingsToDB(allSTPHourReadings);
            } else if (company.getCompany() === companies.EVN) {

            }
        };
        reader.readAsArrayBuffer(f);
    } else {
        throwErrorForInvalidFileFormat();
    }
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

function throwErrorForInvalidFileFormat() {
    notification('Invalid file format', 'error');
}

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

function saveClientsToDB(clients) {
    notification('Зареждане', 'loading');
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

function getClientsFromDB(clients) {
    notification('Зареждане', 'loading');
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
    notification('Данните се обработват', 'success');
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

function validateDocument(nameOfThirdCell) {
    if (company.getCompany() !== companies.CEZ) {
        if (nameOfThirdCell.includes('Сетълмент')) {
            notification(`Избрана е опция за ${company.getCompany()}, а е подаден документ за ЧЕЗ`, 'error')
            throw new Error(`Избрана е опция за ${company.getCompany()}, а е подаден документ за ЧЕЗ`);
        }
    }
}