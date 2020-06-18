;
(function addFileUploadEventListeners() {
    document.getElementById('input-excel').addEventListener('drop', processExchangePricesReadings, false);
    document.getElementById('upload-excel').addEventListener('change', processExchangePricesReadings, false);
}());

(function customizeUploadBTN() {
    $('.labelBtn').on('click', () => {
        $('#upload-excel').click();
    });
})();

function processExchangePricesReadings(e) {
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
                let arr = getRows(workbook['Sheets'][`${first_sheet_name}`]);
                let allExchangePriceReadings = [];
                let exchangePriceReadings = [];
                let currExchangePriceReading = [];
                let currProducedEnergyHourValues = [];
                for (let i = 1; i < arr.length; i += 1) {
                    if (!arr[i][4] || arr[i][4] == undefined) {
                        break;
                    }
                    for (let x = 4; x < 28; x += 1) {
                        const currDateHelper = arr[i][x].split('/');
                        const year = currDateHelper[2].length === 2 ? '20' + currDateHelper[2] : currDateHelper[2];
                        const currDate = new Date(`${year}-${currDateHelper[0]}-${currDateHelper[1]}`);
                        for (let val = 0; val < 24; val += 1) {
                            exchangePriceObj = {
                                currHour: val,
                                currValue: arr[i][x + 1] || -1
                            }
                            currExchangePriceReading.push(exchangePriceObj);
                            x += 1;
                        }
                        let formattedDate = `${currDate.getFullYear()}-${currDate.getMonth()+1}-${currDate.getDate()}`;
                        exchangePriceReadings.push(formattedDate, currExchangePriceReading, new Date());
                        allExchangePriceReadings.push(exchangePriceReadings);

                        currExchangePriceReading = [];
                        exchangePriceReadings = [];
                        x -= 1;
                    }
                }
                if (z + 1 === files.length) {
                    saveExchangePricesReadingsToDB(allExchangePriceReadings);
                }
            }
            reader.readAsArrayBuffer(f);
        } else {
            throwErrorForInvalidFileFormat();
        }
    }
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

function saveExchangePricesReadingsToDB(readings) {
    $.ajax({
        url: '/api/addExchangePriceReadings',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(readings),
        success: function () {},
        error: function (jqXhr) {
            if (jqXhr.responseText === 'Данните вече съществуват / Грешка') {
                notification(jqXhr.responseText, 'error');
            } else {
                notification(jqXhr.responseText, 'success');
            }
        }
    });
    notification('Данните се обработват', 'loading');
};