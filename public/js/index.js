const companies = {
    CEZ: 'CEZ',
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
    } else if ($('#cez').is(':checked')) {
        company.setCompany('CEZ');
    } else if ($('#evn').is(':checked')) {
        company.setCompany('EVN');
    }
}));
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

    let clientsAll = []
    let readingsAll = []

    if (extension === 'xls' || extension === 'xlsx') {
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

            //////////////////
            //ENERGO_PRO XLS//
            //////////////////
            if (companies.ENERGO_PRO === company.getCompany()) {
                getCols(workbook['Sheets'][`${first_sheet_name}`]).forEach(function (value, i) {
                    if (i !== 0) {
                        if (value['4'] == '' || value['4'] == undefined) {
                            return;
                        }
                        if (value['7'] == '') {
                            return;
                        }
                        let client = [value['7'], value['4'], new Date()];

                        let type = value['3'];
                        if (type === '"Техническа част"') {
                            type = 1;
                        } else if (type === '"Разпределение"') {
                            type = 2;
                        }
                        //ENERGO PRO operator 3
                        let operator = 3;

                        let d1 = value['12'].replace(/"/g, '');
                        let arr = d1.split('.');
                        let date_from = `${arr[2]}-${arr[1]}-${arr[0]}`;

                        let d2 = value['13'].replace(/"/g, '');
                        let arr1 = d2.split('.');
                        let date_to = `${arr1[2]}-${arr1[1]}-${arr1[0]}`;

                        let reading = [value['4'].replace(/"/g, ''), date_from, date_to, value['14'].replace(/"/g, ''), value['15'].replace(/"/g, ''), value['17'].replace(/"/g, ''), value['18'].replace(/"/g, ''), value['19'].replace(/"/g, ''), value['20'].replace(/"/g, ''), value['21'].replace(/"/g, ''), value['23'].replace(/"/g, ''), value['24'].replace(/"/g, ''), value['25'].replace(/"/g, ''), value['26'].replace(/"/g, ''), value['27'].replace(/"/g, ''), value['28'].replace(/"/g, ''), value['29'].replace(/"/g, ''), type, operator];

                        readingsAll.push(reading);
                        clientIds.push(value['4']);
                        clientsAll.push(client);
                    }
                });
                let filteredClients = filterClients(clientsAll);
                saveClientsToDB(filteredClients);
                cl = getClientsFromDB(clientIds);
                changeClientIdForReadings(readingsAll, cl)
                saveReadingsToDB(readingsAll);
            }


            ////////////
            //CEZ XLS///
            /////////// 
            if (companies.CEZ === company.getCompany()) {
                getCols(workbook['Sheets'][`${first_sheet_name}`]).forEach(function (value, i) {
                    if (i !== 0 && i !== 1) {
                        if (value['4'] == '' || value['4'] == undefined) {
                            return;
                        }
                        if (value['7'] == '') {
                            return;
                        }
                        let client = [value['7'], value['4'].replace(/"/g, ''), new Date()];

                        let type = value['3'];
                        if (type === '"Техническа част"') {
                            type = 1;
                        } else if (type === '"Разпределение"') {
                            type = 2;
                        }
                        //CEZ operator 2
                        let operator = 2;

                        let d1 = value['12'].replace(/"/g, '');
                        let arr = d1.split('.');
                        let date_from = `${arr[2]}-${arr[1]}-${arr[0]}`;

                        let d2 = value['13'].replace(/"/g, '');
                        let arr1 = d2.split('.');
                        let date_to = `${arr1[2]}-${arr1[1]}-${arr1[0]}`;

                        let reading = [value['4'].replace(/"/g, ''), date_from, date_to, value['14'].replace(/"/g, ''), value['15'].replace(/"/g, ''), value['17'].replace(/"/g, ''), value['18'].replace(/"/g, ''), value['19'].replace(/"/g, ''), value['20'].replace(/"/g, ''), value['21'].replace(/"/g, ''), value['23'].replace(/"/g, ''), value['24'].replace(/"/g, ''), value['25'].replace(/"/g, ''), value['26'].replace(/"/g, ''), value['27'].replace(/"/g, ''), value['28'].replace(/"/g, ''), value['29'].replace(/"/g, ''), type, operator];

                        readingsAll.push(reading);
                        clientIds.push(value['4']);
                        clientsAll.push(client);

                    }
                });
                let filteredClients = filterClients(clientsAll);
                saveClientsToDB(filteredClients);
                cl = getClientsFromDB(clientIds);
                changeClientIdForReadings(readingsAll, cl)
                saveReadingsToDB(readingsAll);
            }
            ///////////
            //EVN XLS//
            ///////////
            if (companies.EVN === company.getCompany()) {
                getCols(workbook['Sheets'][`${first_sheet_name}`]).forEach(function (value, i) {
                    if (i !== 0 && i !== 1 && i !== 2) {
                        if (value['4'] == '' || value['4'] == undefined) {
                            return;
                        }
                        if (value['7'] == '') {
                            return;
                        }
                        let client = [value['7'].replace(/"/g, ''), value['4'].replace(/"/g, ''), new Date()];

                        let type = value['3'];
                        if (type === '"Техническа част"') {
                            type = 1;
                        } else if (type === '"Разпределение"') {
                            type = 2;
                        }
                        //EVN operator 1
                        let operator = 1;

                        let d1 = value['12'].replace(/"/g, '');
                        let arr = d1.split('.');
                        let date_from = `${arr[2]}-${arr[1]}-${arr[0]}`;

                        let d2 = value['13'].replace(/"/g, '');
                        let arr1 = d2.split('.');
                        let date_to = `${arr1[2]}-${arr1[1]}-${arr1[0]}`;

                        let reading = [value['4'].replace(/"/g, ''), date_from, date_to, value['14'].replace(/"/g, ''), value['15'].replace(/"/g, ''), value['17'].replace(/"/g, ''), value['18'].replace(/"/g, ''), value['19'].replace(/"/g, ''), value['20'].replace(/"/g, ''), value['21'].replace(/"/g, ''), value['23'].replace(/"/g, ''), value['24'].replace(/"/g, ''), value['25'].replace(/"/g, ''), value['26'].replace(/"/g, ''), value['27'].replace(/"/g, ''), value['28'].replace(/"/g, ''), value['29'].replace(/"/g, ''), type, operator];

                        readingsAll.push(reading);
                        clientIds.push(value['4']);
                        clientsAll.push(client);
                    }
                });
                let filteredClients = filterClients(clientsAll);
                saveClientsToDB(filteredClients);
                cl = getClientsFromDB(clientIds);
                changeClientIdForReadings(readingsAll, cl)
                saveReadingsToDB(readingsAll);
            }
        };
        reader.readAsArrayBuffer(f);
    } else if (extension === 'csv') {

        reader.readAsText(f, 'CP1251');
        reader.onload = loadHandler;
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

    function loadHandler(event) {

        let csv = event.target.result;
        processData(csv);
    }

    Array.prototype.insert = function (index, item) {
        this.splice(index, 0, item);
    };

    function processData(csv) {
        let text = csv.split(/\r?\n/);
        var col = [];
        for (let i = 0; i < text.length; i++) {
            let row = text[i].split(';');
            col.insert(i, row);
        }
        ////////////
        //EVN CSV///
        ////////////
        if (company.getCompany() === companies.EVN) {
            col.forEach(function (value, i) {
                if (i !== 0 && i !== 1 && i !== 2) {
                    if (value['4'] == '' || value['4'] == undefined) {
                        return;
                    }
                    if (value['7'] == '') {
                        return;
                    }
                    let client = [value['7'].replace(/"/g, ''), value['4'].replace(/"/g, ''), new Date()];

                    let type = value['3'];
                    if (type === '"Техническа част"') {
                        type = 1;
                    } else if (type === '"Разпределение"') {
                        type = 2;
                    }
                    //EVN operator 1
                    let operator = 1;

                    let d1 = value['12'].replace(/"/g, '');
                    let arr = d1.split('.');
                    let date_from = `${arr[2]}-${arr[1]}-${arr[0]}`;

                    let d2 = value['13'].replace(/"/g, '');
                    let arr1 = d2.split('.');
                    let date_to = `${arr1[2]}-${arr1[1]}-${arr1[0]}`;

                    let reading = [value['4'].replace(/"/g, ''), date_from, date_to, value['14'].replace(/"/g, ''), value['15'].replace(/"/g, ''), value['17'].replace(/"/g, ''), value['18'].replace(/"/g, ''), value['19'].replace(/"/g, ''), value['20'].replace(/"/g, ''), value['21'].replace(/"/g, ''), value['23'].replace(/"/g, ''), value['24'].replace(/"/g, ''), value['25'].replace(/"/g, ''), value['26'].replace(/"/g, ''), value['27'].replace(/"/g, ''), value['28'].replace(/"/g, ''), value['29'].replace(/"/g, ''), type, operator];

                    readingsAll.push(reading);
                    clientIds.push(value['4']);
                    clientsAll.push(client);
                }
            });
            let filteredClients = filterClients(clientsAll);
            saveClientsToDB(filteredClients);
            cl = getClientsFromDB(clientIds);
            changeClientIdForReadings(readingsAll, cl)
            saveReadingsToDB(readingsAll);
        }
        ////////////
        //CEZ CSV///
        ////////////
        else if (company.getCompany() === companies.CEZ) {
            col.forEach(function (value, i) {
                let clientName = value['8'];
                let timeZone = value['18'];
                if (i !== 0 && i !== 1) {
                    if (value['4'] == '' || value['4'] == undefined) {
                        return;
                    }
                    if (value['7'] == '') {
                        return;
                    }
                    let client = [value['7'].replace(/"/g, ''), clientName, value['10'].replace(/"/g, ''), new Date()];

                    let type = value['3'];
                    if (type == '"Техническа част"') {
                        type = 1;
                    } else if (type == '"Разпределение"') {
                        type = 2;
                    }
                    //CEZ operator 2
                    let operator = 2;
                    let d1 = value['12'].replace(/"/g, '');
                    let arr = d1.split('.');
                    let date_from = `${arr[2]}-${arr[1]}-${arr[0]}`;

                    let d2 = value['13'].replace(/"/g, '');
                    let arr1 = d2.split('.');
                    let date_to = `${arr1[2]}-${arr1[1]}-${arr1[0]}`;

                    let reading = [value['10'].replace(/"/g, ''), date_from, date_to, value['14'].replace(/"/g, ''), value['15'].replace(/"/g, ''), value['17'].replace(/"/g, ''), value['18'].replace(/"/g, ''), value['19'].replace(/"/g, ''), value['20'].replace(/"/g, ''), value['21'].replace(/"/g, ''), value['23'].replace(/"/g, ''), value['24'].replace(/"/g, ''), value['25'].replace(/"/g, ''), value['26'].replace(/"/g, ''), value['27'].replace(/"/g, ''), value['28'].replace(/"/g, ''), value['29'].replace(/"/g, ''), type, operator];
                    readingsAll.push(reading);
                    clientIds.push(value['10']);
                    clientsAll.push(client);
                }
            });
            let filteredClients = filterClients(clientsAll);
            saveClientsToDB(filteredClients);
            cl = getClientsFromDB(clientIds);
            changeClientIdForReadings(readingsAll, cl)
            saveReadingsToDB(readingsAll);
        }
        //////////////////
        //ENERGO_PRO CSV//
        /////////////////
        else if (company.getCompany() === companies.ENERGO_PRO) {
            col.forEach(function (value, i) {
                if (i !== 0) {
                    if (value['4'] == '' || value['4'] == undefined) {
                        return;
                    }
                    if (value['7'] == '') {
                        return;
                    }
                    let client = [value['7'].replace(/"/g, ''), value['4'].replace(/"/g, ''), new Date()];

                    let type = value['3'];
                    if (type === '"Техническа част"') {
                        type = 1;
                    } else if (type === '"Разпределение"') {
                        type = 2;
                    }
                    //ENERGO PRO operator 3
                    let operator = 3;

                    let d1 = value['12'].replace(/"/g, '');
                    let arr = d1.split('.');
                    let date_from = `${arr[2]}-${arr[1]}-${arr[0]}`;

                    let d2 = value['13'].replace(/"/g, '');
                    let arr1 = d2.split('.');
                    let date_to = `${arr1[2]}-${arr1[1]}-${arr1[0]}`;

                    let reading = [value['4'].replace(/"/g, ''), date_from, date_to, value['14'].replace(/"/g, ''), value['15'].replace(/"/g, ''), value['17'].replace(/"/g, ''), value['18'].replace(/"/g, ''), value['19'].replace(/"/g, ''), value['20'].replace(/"/g, ''), value['21'].replace(/"/g, ''), value['23'].replace(/"/g, ''), value['24'].replace(/"/g, ''), value['25'].replace(/"/g, ''), value['26'].replace(/"/g, ''), value['27'].replace(/"/g, ''), value['28'].replace(/"/g, ''), value['29'].replace(/"/g, ''), type, operator];

                    readingsAll.push(reading);
                    clientIds.push(value['4']);
                    clientsAll.push(client);
                }
            });
            let filteredClients = filterClients(clientsAll);
            saveClientsToDB(filteredClients);
            cl = getClientsFromDB(clientIds);
            changeClientIdForReadings(readingsAll, cl)
            saveReadingsToDB(readingsAll);
        }
    }
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
        url: 'http://192.168.1.114:3000/getClient',
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

function changeClientIdForReadings(readingsAll, cl) {
    readingsAll.forEach(reading => {
        if (cl != undefined) {
            for (let i = 0; i < cl.length; i++) {
                if (cl[i].ident_code == reading['0']) {
                    reading['0'] = cl[i].id;
                }
            }
        }
    });
};

function saveReadingsToDB(readings) {
    $.ajax({
        url: 'http://localhost:3000/addreadings',
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