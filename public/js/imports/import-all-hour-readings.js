const companies = {
    ENERGO_PRO: 'ENERGO_PRO',
    EVN: 'EVN'
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
    }
}));

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};
$(document).ready(function () {
    document.getElementById('input-excel').addEventListener('drop', processFile, false);
    document.getElementById('upload-excel').addEventListener('change', processFile, false);
});

function processFile(e) {
    const meteringType = 1; // Hour-Reading
    const profileID = 0;
    const isManufacturer = 0;
    e.stopPropagation();
    e.preventDefault();
    let files = '';
    let f = '';
    try {
        files = e.dataTransfer.files,
            f = files[0];
    } catch (e) {
        files = document.getElementById('upload-excel').files,
            f = document.getElementById('upload-excel').files[0];
    }
    let allHourReadings = [];
    let clientIDs = [];
    let clientsALL = [];
    for (let z = 0; z < files.length; z += 1) {
        f = files[z];
        var reader = new FileReader();
        let fileName = '';
        try {
            fileName = e.dataTransfer.files[z].name
        } catch (e) {
            fileName = document.getElementById('upload-excel').files[z].name;
        }
        let extension = fileName.slice(fileName.lastIndexOf('.') + 1);
        if (extension === 'xlsx' || extension === 'xls') {
            reader.onload = function (e) {
                let data = new Uint8Array(e.target.result);
                let workbook = XLSX.read(data, {
                    type: 'array'
                });
                let first_sheet_name = workbook.SheetNames[0];
                //let address_of_cell = 'A1';
                /* Get worksheet */
                let worksheet = workbook.Sheets[first_sheet_name];
                /* Find desired cell */
                // let desired_cell = worksheet[address_of_cell];
                /* Get the value */
                // let desired_value = (desired_cell ? desired_cell.v : undefined);
                // console.log(Object.keys(workbook['Sheets']['Sheet1']));
                let clientName;
                let clientID;

                let colSize = getCols(workbook['Sheets'][`${first_sheet_name}`])[0].length;
                if (Object.values(companies).indexOf(company.getCompany()) < 0) {
                    notification('Избери компания', 'error');
                } else {
                    if (company.getCompany() === companies.EVN) {
                        clientName = '';
                        clientID = worksheet['A2'].v;
                    } else if (company.getCompany() === companies.ENERGO_PRO) {
                        clientName = worksheet['A1'].v;
                        clientID = (worksheet['A2'].v).split(" ")[2];
                    }
                    validateDocumentForCEZFunc(clientID, clientName, colSize);
                    // let colSize = getRows(workbook['Sheets'][`${first_sheet_name}`])[0].length;
                    let arr = getRows(workbook['Sheets'][`${first_sheet_name}`]);
                    let allDates = [];
                    let currDaysFiltered = new Set();
                    let allActiveEnergyValues = [];
                    let allReactiveEnergyValues = [];
                    let currActiveEnergyValues = [];
                    let currReactiveEnergyValues = [];
                    let currHourReadingActive = [];
                    let currHourReadingReactive = [];
                    const operator = company.getErpType();
                    for (let x = 4; x < arr[0].length; x += 1) {
                        let currDateHelper = `${arr[0][x]}`;
                        let splitHelper = currDateHelper.split(" ")[0].split('.');
                        let currDate = new Date(`${splitHelper[1]}.${splitHelper[0]}.${splitHelper[2]}`);
                        for (let val = 0; val < 24; val += 1) {
                            currHourActiveEnergyObj = {
                                currHour: val,
                                currValue: arr[1][x]
                            }
                            currReactiveEnergyObj = {
                                currHour: val,
                                currValue: arr[2][x] == '' || arr[2][x] == undefined ? 0 : arr[2][x]
                            }
                            currActiveEnergyValues.push(currHourActiveEnergyObj);
                            currReactiveEnergyValues.push(currReactiveEnergyObj);
                            x += 1;
                        }
                        let formattedDate = `${currDate.getFullYear()}-${currDate.getMonth()+1}-${currDate.getDate()}`;
                        if (!formattedDate.includes('NaN')) {

                            currHourReadingActive.push(clientName, clientID, 0, formattedDate, currActiveEnergyValues, new Date());
                            currHourReadingReactive.push(clientName, clientID, 1, formattedDate, currReactiveEnergyValues, new Date());

                            allHourReadings.push(currHourReadingActive);
                            allHourReadings.push(currHourReadingReactive);

                            currHourReadingActive = [];
                            currHourReadingReactive = [];

                            currActiveEnergyValues = [];
                            currReactiveEnergyValues = [];

                            currHourActiveEnergyObj = {};
                            currReactiveEnergyObj = {};
                            x -= 1;
                        }
                    }
                    let client = [];
                    clientIDs.push(clientID);

                    client.push(0, clientName, clientID, meteringType, profileID, operator, isManufacturer, new Date());
                    clientsALL.push(client);
                    //   console.log(allHourReadings);
                    /*
                                        arr.forEach(function (value, i) {
                                            // Remove for Reac energy
                                            if (i < 3) {
                                                if (i === 0) {
                                                    for (let y = 4; y < value.length; y += 1) {
                                                        allDates.push(value[y]);
                                                        currDaysFiltered.add(value[y].split(" ")[0]);
                                                    }
                                                } else if (i === 1) {
                                                    for (let y = 4; y < value.length; y += 1) {
                                                        allActiveEnergyValues.push(value[y]);
                                                    }
                                                } else if (i === 2) {
                                                    for (let y = 4; y < value.length; y += 1) {
                                                        allReactiveEnergyValues.push(value[y]);
                                                    }
                                                }
                                            }
                                        });
                                        let client = [];
                                        let j = 0;
                                        let currDate;
                                        let nextDate;
                                        let hourReading = [];
                                        let hours = [];
                                        for (let x = 0; x < currDaysFiltered.size; x += 1) {
                                            try {
                                                currDate = 0;
                                                nextDate = 0;
                                                hourReading = [];
                                                hours = [];
                                                while (true) {
                                                    if (currDate !== nextDate) {
                                                        break;
                                                    }
                                                    currDate = allDates[j].split(" ")[0];
                                                    nextDate = allDates[j + 1].split(" ")[0];

                                                    let currHour = allDates[j].split(" ")[1];
                                                    let currValue = allActiveEnergyValues[j];
                                                    let currHourObj = {
                                                        currHour,
                                                        currValue
                                                    }
                                                    hours.push(currHourObj);
                                                    j += 1;
                                                }
                                                hourReading.push(clientName, clientID, 0, currDate, hours, new Date());
                                                //console.log(hourReading);
                                                allHourReadings.push(hourReading);
                                            } catch (err) {
                                                currDate = allDates[allDates.length - 1].split(" ")[0];
                                                let currHour = allDates[allDates.length - 1].split(" ")[1];
                                                let currValue = allActiveEnergyValues[j];
                                                let currHourObj = {
                                                    currHour,
                                                    currValue
                                                }
                                                let hours = [];
                                                hours.push(currHourObj);
                                                hourReading.push(clientName, clientID, 0, currDate, hours, new Date());
                                                allHourReadings.push(hourReading);
                                            }
                                        }
                                        j = 0;
                                        for (let r = 0; r < currDaysFiltered.size; r += 1) {
                                            try {
                                                currDate = 0;
                                                nextDate = 0;
                                                hourReading = [];
                                                hours = [];
                                                while (true) {
                                                    if (currDate !== nextDate) {
                                                        break;
                                                    }
                                                    currDate = allDates[j].split(" ")[0];
                                                    nextDate = allDates[j + 1].split(" ")[0];

                                                    let currHour = allDates[j].split(" ")[1];
                                                    let currValue = allReactiveEnergyValues[j];
                                                    let currHourObj = {
                                                        currHour,
                                                        currValue
                                                    }
                                                    hours.push(currHourObj);
                                                    j += 1;
                                                }
                                                hourReading.push(clientName, clientID, 1, currDate, hours, new Date());
                                                // console.log(hourReading);
                                                allHourReadings.push(hourReading);
                                            } catch (err) {
                                                currDate = allDates[allDates.length - 1].split(" ")[0];
                                                let currHour = allDates[allDates.length - 1].split(" ")[1];
                                                let currValue = allReactiveEnergyValues[j];
                                                let currHourObj = {
                                                    currHour,
                                                    currValue
                                                }
                                                let hours = [];
                                                hours.push(currHourObj);
                                                hourReading.push(clientName, clientID, 1, currDate, hours, new Date());
                                                allHourReadings.push(hourReading);
                                            }
                                        }
                                        client.push(0, clientName, clientID, new Date());
                                        clientsALL.push(client);
                                        clientIDs.push(clientID);
                                        */
                    // Last Iteration of files []
                    if (z + 1 === files.length) {
                        saveClientsToDB(clientsALL);
                        let cl;
                        cl = getClientsFromDB(convertClientIDsToString(clientIDs));
                        changeClientIdForHourReadings(allHourReadings, cl);
                        saveHourReadingsToDB(allHourReadings);
                    }
                };
            }
            reader.readAsArrayBuffer(f);
        } else {
            throwErrorForInvalidFileFormat();
        }
    }
}

function throwErrorForInvalidFileFormat() {
    notification('Invalid file format', 'error');
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

function getRows(sheet) {
    var result = [];
    var row;
    var rowNum;
    var colNum;
    var range = XLSX.utils.decode_range(sheet['!ref']);
    for (colNum = range.s.c; colNum <= range.e.c; colNum++) {
        row = [];
        for (rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
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

function getClientsFromDB(clients) {
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

function saveHourReadingsToDB(readings) {
    $.ajax({
        url: '/api/addHourReadings',
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

function validateDocumentForCEZFunc(clientID, clientName, colSize) {
    if (clientID !== undefined) {
        if (clientID.includes('Уникален номер')) {
            notification(`Избрана е опция за ${company.getCompany()}, а е подаден документ за EnergoPRO`, 'error');
            throw new Error(`Избрана е опция за ${company.getCompany()}, а е подаден документ за EnergoPRO`);
        }
    }
    if (clientName.includes('Ел Екс Корпорейшън АД')) {
        notification(`Избрана е опция за ${company.getCompany()}, а е подаден документ за EVN`, 'error');
        throw new Error(`Избрана е опция за ${company.getCompany()}, а е подаден документ за EVN`);
    }
    if (colSize > 50) {
        notification(`Избрана е опция за ${company.getCompany()}, а е подаден документ за CEZ`, 'error');
        throw new Error(`Избрана е опция за ${company.getCompany()}, а е подаден документ за CEZ`);
    }
}