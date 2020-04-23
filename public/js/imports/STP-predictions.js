const companies = {
    ENERGO_PRO: 'ENERGO_PRO',
    EVN: 'EVN',
    CEZ: 'CEZ'
};

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

let stpPrediction = new STPPrediction();

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

$(document).ready(function () {
    document.getElementById('input-excel').addEventListener('drop', processFile, false);
});

($('body > div.container').click(() => {
    if ($('#energo-pro').is(':checked')) {
        stpPrediction.setCompany('ENERGO_PRO').setType(3).setStartingIndexOfAmountValues(7).setIndexOfIdentCode(3);
    } else if ($('#evn').is(':checked')) {
        stpPrediction.setCompany('EVN').setType(1).setStartingIndexOfAmountValues(6).setIndexOfIdentCode(1);
    } else if ($('#cez').is(':checked')) {
        stpPrediction.setCompany('CEZ').setType(2).setStartingIndexOfAmountValues(5).setIndexOfIdentCode(2);
    }
}));

async function processFile(e) {
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
            validateDocument();

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
                        clientID = getClientIDFromDB(ident_code);
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

function saveClientsToDB(clients) {
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

function validateDocument() {
    if (stpPrediction.getCompany() == '') {
        notification('Избери компания', 'error');
        throw new Error('Избери компания');
    }
}