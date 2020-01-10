const companies = {
    ENERGO_PRO: 'ENERGO_PRO',
    EVN: 'EVN'
};

class Company {
    constructor() {
        this.company = '';
    }
    getCompany() {
        return this.company;
    }
    setCompany(company) {
        this.company = company;
    }
}
let company = new Company();
($('body > div.container').click(() => {
    if ($('#energo-pro').is(':checked')) {
        company.setCompany('ENERGO_PRO');
    } else if ($('#evn').is(':checked')) {
        company.setCompany('EVN');
    }
}));

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};
$(document).ready(function () {
    document.getElementById('input-excel').addEventListener('drop', processFile, false);
});

function processFile(e) {
    e.stopPropagation();
    e.preventDefault();
    let cl;
    let clientIds = [];
    var files = e.dataTransfer.files,
        f = '';
    let allHourReadings = [];
    for (let z = 0; z < files.length; z += 1) {
        f = files[z];
        var reader = new FileReader();
        var fileName = e.dataTransfer.files[z].name;
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
                let clientIDs = [];
                let clientsALL = [];
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

                    // let colSize = getRows(workbook['Sheets'][`${first_sheet_name}`])[0].length;
                    let arr = getRows(workbook['Sheets'][`${first_sheet_name}`]);
                    let allDates = [];
                    let allActiveEnergyValues = [];
                    let allReactiveEnergyValues = [];
                    arr.forEach(function (value, i) {
                        // Remove for Reac energy
                        if (i < 3) {
                            if (i === 0) {
                                for (let y = 4; y < value.length; y += 1) {
                                    allDates.push(value[y]);
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
                    for (let x = 0; x < 8; x += 1) {
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
                    for (let r = 0; r < 8; r += 1) {
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
                    // Last Iteration of files []
                    if (z + 1 === files.length) {
                        saveClientsToDB(clientsALL);
                        let cl;
                        cl = getClientsFromDB(convertClientIDsToString(clientIDs));
                        changeClientIdForHourReadings(allHourReadings, cl);
                        console.log(allHourReadings);
                        saveHourReadingsToDB(allHourReadings);
                    }
                };
            }
            reader.readAsArrayBuffer(f);
        } else {
            notification('Invalid file format', 'error');
        }

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
    }
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
        url: 'http://192.168.1.114:3000/addclients',
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
        url: 'http://192.168.1.114:3000/api/getClients',
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
        url: 'http://localhost:3000/api/addHourReadings',
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