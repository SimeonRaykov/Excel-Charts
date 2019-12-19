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

    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files,
        f = files[0];
    var reader = new FileReader();
    var fileName = e.dataTransfer.files[0].name;
    let extension = fileName.slice(fileName.lastIndexOf('.') + 1);

    let clientsAll = []
    let readingsAll = []

    if (extension === 'xls') {
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

            //////////////
            //ENERGO_PRO//
            //////////////
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
                        if (type === 'Техническа част') {
                            type = 1;
                        } else if (type === 'Разпределение') {
                            type = 2;
                        }
                        //ENERGO PRO operator 3
                        let operator = 3;

                        let reading = [value['12'], value['13'], value['14'], value['15'], value['17'], value['18'], value['19'], value['20'], value['21'], value['23'], value['24'], value['25'], value['26'], value['27'], value['28'], value['29'], type, operator];
                        readingsAll.push(reading);
                        clientsAll.push(client);
                    }
                });
                saveClientsToDB(clientsAll);
                saveReadingsToDB(readingsAll);
            }


            /////////
            //CEZ///
            //////// 
            if (companies.CEZ === company.getCompany()) {
                getCols(workbook['Sheets'][`${first_sheet_name}`]).forEach(function (value, i) {
                    if (i !== 0 && i !== 1) {
                        if (value['4'] == '' || value['4'] == undefined) {
                            return;
                        }
                        if (value['7'] == '') {
                            return;
                        }
                        let client = [value['7'], value['4'], new Date()];

                        let type = value['3'];
                        if (type === 'Техническа част') {
                            type = 1;
                        } else if (type === 'Разпределение') {
                            type = 2;
                        }
                        //CEZ operator 2
                        let operator = 2;

                        let reading = [value['12'], value['13'], value['14'], value['15'], value['17'], value['18'], value['19'], value['20'], value['21'], value['23'], value['24'], value['25'], value['26'], value['27'], value['28'], value['29'], type, operator];
                        readingsAll.push(reading);
                        clientsAll.push(client);

                    }
                });
                saveClientsToDB(clientsAll);
                saveReadingsToDB(readingsAll);
            }
            ///////
            //EVN//
            ///////
            if (companies.EVN === company.getCompany()) {
                getCols(workbook['Sheets'][`${first_sheet_name}`]).forEach(function (value, i) {
                    if (i !== 0 && i !== 1 && i !== 2) {
                        if (value['4'] == '' || value['4'] == undefined) {
                            return;
                        }
                        if (value['7'] == '') {
                            return;
                        }
                        let client = [value['7'], value['4'], new Date()];

                        let type = value['3'];
                        if (type === 'Техническа част') {
                            type = 1;
                        } else if (type === 'Разпределение') {
                            type = 2;
                        }
                        //EVN operator 1
                        let operator = 1;

                        let reading = [value['12'], value['13'], value['14'], value['15'], value['17'], value['18'], value['19'], value['20'], value['21'], value['23'], value['24'], value['25'], value['26'], value['27'], value['28'], value['29'], type, operator];
                        readingsAll.push(reading);
                        clientsAll.push(client);
                    }
                });
                saveClientsToDB(clientsAll);
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
        var clientIds = [];
        for (let i = 0; i < text.length; i++) {
            let row = text[i].split(';');
            col.insert(i, row);
        }
        ///////
        //EVN//
        ///////
        if (company.getCompany() === companies.EVN) {
            col.forEach(function (value, i) {
                if (i !== 0 && i !== 1 && i !== 2) {
                    if (value['4'] == '' || value['4'] == undefined) {
                        return;
                    }
                    if (value['7'] == '') {
                        return;
                    }
                    let client = [value['7'], value['4'], new Date()];

                    let type = value['3'];
                    if (type === 'Техническа част') {
                        type = 1;
                    } else if (type === 'Разпределение') {
                        type = 2;
                    }
                    //EVN operator 1
                    let operator = 1;

                    let reading = [value['12'], value['13'], value['14'], value['15'], value['17'], value['18'], value['19'], value['20'], value['21'], value['23'], value['24'], value['25'], value['26'], value['27'], value['28'], value['29'], type, operator];
                    readingsAll.push(reading);
                    clientsAll.push(client);
                }
            });
            saveClientsToDB(clientsAll);
            saveReadingsToDB(readingsAll);
        }
        //////
        //CEZ//
        ////// 
        else if (company.getCompany() === companies.CEZ) {
            col.forEach(function (value, i) {
                if (i !== 0 && i !== 1) {
                    if (value['4'] == '' || value['4'] == undefined) {
                        return;
                    }
                    if (value['7'] == '') {
                        return;
                    }
                    let client = [value['7'].replace(/"/g, ''), value['4'].replace(/"/g, ''), new Date()];

                    let type = value['3'];
                    if (type === 'Техническа част') {
                        type = 1;
                    } else if (type === 'Разпределение') {
                        type = 2;
                    }
                    //CEZ operator 2
                    let operator = 2;

                    let reading = [value['7'], value['12'], value['13'], value['14'], value['15'], value['17'], value['18'], value['19'], value['20'], value['21'], value['23'], value['24'], value['25'], value['26'], value['27'], value['28'], value['29'], type, operator];
                    readingsAll.push(reading);
                    clientIds.push(value['4']);
                    clientsAll.push(client);

                }
            });
            console.log(clientsAll);
            saveClientsToDB(clientsAll);
            var cl = await getClientsFromDB(clientIds);
            console.log(cl);
            saveReadingsToDB(readingsAll, cl);
        }
        //////////////
        //ENERGO_PRO//
        //////////////
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
                    if (type === 'Техническа част') {
                        type = 1;
                    } else if (type === 'Разпределение') {
                        type = 2;
                    }
                    //ENERGO PRO operator 3
                    let operator = 3;

                    let reading = [value['12'], value['13'], value['14'], value['15'], value['17'], value['18'], value['19'], value['20'], value['21'], value['23'], value['24'], value['25'], value['26'], value['27'], value['28'], value['29'], type, operator];
                    readingsAll.push(reading);

                    clientsAll.push(client);
                }
            });
            saveClientsToDB(clientsAll);
            var cl = getClientsFromDB(clientIds);
            console.log(cl);
            saveReadingsToDB(readingsAll);
        }
    }
}

function saveClientsToDB(clients) {
    notification('Loading..', 'loading');
    $.ajax({
        url: 'http://192.168.1.114:3000/addclients',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(clients),
        success: function data() {
            console.log(1);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            notification(errorThrown, 'error');
            console.log('error');
        }
    });
}

async function getClientsFromDB(clients) {
    notification('Loading..', 'loading');
    var retVal;
    $.ajax({
        url: 'http://192.168.1.114:3000/getClient',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(clients),
        success: function (data) {
            console.log(2);
            retVal = data;
        },
        error: function (jqXhr, textStatus, errorThrown) {
            notification(errorThrown, 'error');
            console.log('error');
        }
    });
    return retVal;
}

function saveReadingsToDB(readings) {
    $.ajax({
        url: 'http://192.168.1.114:3000/addreadings',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(readings),
        success: function (data) {

        },
        error: function (jqXhr, textStatus, errorThrown) {
            notification(errorThrown, 'error');
            console.log('error');
        }
    });
    notification('Everything is good', 'success');
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
}