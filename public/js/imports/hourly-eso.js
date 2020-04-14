Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

($('body > div.container').click(() => {
    addFileUploadEventListeners();
}));


function processEsoHourReadings(e) {
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
                let allReadingsESO = [];
                let usedEnergyReadingESO = [];
                let producedEnergyReadingESO = [];
                let currUsedEnergyHourValues = [];
                let currProducedEnergyHourValues = [];

                const usedEnergyValue = 1;
                const producedEnergyValue = 2;

                for (let x = 1; x < arr[0].length; x += 1) {
                    let currDateHelper = arr[0][x].split(' ');
                    let secondDateHelper = currDateHelper[0].split('.');
                    let currDate = new Date(`${secondDateHelper[2]}.${secondDateHelper[1]}.${secondDateHelper[0]}`);
                    for (let val = 0; val < 24; val += 1) {
                        let undefinedHour = undefined;
                        const currHourValue = (parseInt(arr[0][x].split(' ')[1].split(':')[0])) - 1;
                        if (currHourValue != val) {
                            if (!(val === 23 && currHourValue === -1)) {
                                undefinedHour = -1;
                                x -= 1;
                            }
                        }
                        usedHourObj = {
                            currHour: val,
                            currValue: undefinedHour || arr[1][x] || 0
                        }
                        producedHourObj = {
                            currHour: val,
                            currValue: undefinedHour || arr[2][x] || 0
                        }
                        currUsedEnergyHourValues.push(usedHourObj);
                        currProducedEnergyHourValues.push(producedHourObj)
                        x += 1;
                    }
                    let formattedDate = `${currDate.getFullYear()}-${currDate.getMonth()+1}-${currDate.getDate()}`;
                    usedEnergyReadingESO.push(formattedDate, currUsedEnergyHourValues, usedEnergyValue, new Date());
                    producedEnergyReadingESO.push(formattedDate, currProducedEnergyHourValues, producedEnergyValue, new Date());
                    allReadingsESO.push(usedEnergyReadingESO);
                    allReadingsESO.push(producedEnergyReadingESO);

                    currUsedEnergyHourValues = [];
                    currProducedEnergyHourValues = [];
                    usedEnergyReadingESO = [];
                    producedEnergyReadingESO = [];
                    x -= 1;
                }
                if (z + 1 === files.length) {
                    saveEsoHourReadingsToDB(allReadingsESO);
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

function saveEsoHourReadingsToDB(readings) {
    $.ajax({
        url: '/api/addEsoHourReadings',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(readings),
        success: function () {},
        error: function (jqXhr) {
            notification(jqXhr.responseText, 'success');
        }
    });
    notification('Данните се обработват', 'success');
};

function addFileUploadEventListeners() {
    document.getElementById('input-excel').addEventListener('drop', processEsoHourReadings, false);
    document.getElementById('upload-excel').addEventListener('change', processEsoHourReadings, false);
}