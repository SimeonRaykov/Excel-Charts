Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};
$(document).ready(function () {
    document.getElementById('input-excel').addEventListener('drop', processFile, false);
});

function processFile(e) {
    let cl;
    let clientIds = [];

    e.stopPropagation();
    e.preventDefault();
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
            let first_sheet_name = workbook.SheetNames[0];
            //var address_of_cell = 'A139';
            /* Get worksheet */
            //var worksheet = workbook.Sheets[first_sheet_name];
            /* Find desired cell */
            //var desired_cell = worksheet[address_of_cell];
            /* Get the value */
            //var desired_value = (desired_cell ? desired_cell.v : undefined);
            // console.log(Object.keys(workbook['Sheets']['Sheet1']));
            //console.log(desired_value);

            //   console.log(getCols(workbook['Sheets'][`${first_sheet_name}`]));
            let colSize = getCols(workbook['Sheets'][`${first_sheet_name}`])[0].length;
            console.log(colSize);
            let cl = [];
            let clientsIDs = [];
            let clientsAll = [];
            let client = [];
            let dates = [];
            let allHourReadings = [];
            let hour_reading = [];
            getCols(workbook['Sheets'][`${first_sheet_name}`]).forEach(function (value, i) {
                if (i === 0) {
                    for (let x = 4; x <= colSize; x += 1) {
                        if (value[x] !== undefined) {
                            dates.push(value[x]);
                        }
                    }
                    console.log(dates);

                } else if (i !== 0) {
                    let client = [];
                    let clientName = value['0'];
                    let clientID = value['1'].replace(/"/g, '');;
                    let typeEnergy = value['2'];
                    typeEnergy === "Активна енергия - Del" ? typeEnergy = 0 : typeEnergy = 1;
                    let hours = [];
                    let currDate = dates[0].split(" ")[0];
                    let j = 0;

                    for (let y = 0; y < 8; y += 1) {
                        while (true) {
                            if (dates[j].split(" ")[0] != currDate) {
                                break;
                            }
                            currDate = dates[j].split(" ")[0];

                            let currHour = dates[j].split(" ")[1];
                            let currValue = value[j + 4];
                            let currHourObj = {
                                currHour,
                                currValue
                            }
                            hours.push(currHourObj);
                            j += 1;
                        }
                        hour_reading.push(clientName, clientID, typeEnergy, currDate, hours, new Date());
                        allHourReadings.push(hour_reading);
                        hour_reading = [];
                        hours = [];
                        try {
                            currDate = dates[j + 1].split(" ")[0];

                        } catch (Exception) {
                            currDate = dates[dates.length - 1].split(" ")[0];
                            let currHour = dates[dates.length - 1].split(" ")[1];
                            let currValue = value[j + 4];
                            let currHourObj = {
                                currHour,
                                currValue
                            }
                            hours.push(currHourObj);
                            hour_reading.push(clientName, clientID, typeEnergy, currDate, hours, new Date());
                            allHourReadings.push(hour_reading);
                            hours = []
                            hour_reading = [];
                            break;
                        }
                    }
                    client.push(0, clientName, clientID, new Date());
                    clientsIDs.push(clientID);
                    clientsAll.push(client);
                }
            });
            saveClientsToDB(clientsAll);
            cl = getClientsFromDB(convertClientIDsToString(clientsIDs));
            changeClientIdForHourReadings(allHourReadings, cl);
            console.log(allHourReadings);
            saveHourReadingsToDB(allHourReadings);

            /*
              let filteredClients = filterClients(clientsAll);
              saveClientsToDB(filteredClients);
              cl = getClientsFromDB(clientIds);
              changeClientIdForReadings(readingsAll, cl)
              saveReadingsToDB(readingsAll);
              */
        };
        reader.readAsArrayBuffer(f);
    } else {
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