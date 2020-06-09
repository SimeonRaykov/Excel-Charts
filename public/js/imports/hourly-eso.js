;
$(document).ready(function () {
    getDataListings();
});

function showUploadBlocks() {
    $('#form-group').removeClass('invisible');
    $('div.invisible').removeClass('invisible');
}

(function validateInputClientIdentCode() {
    $('#ident_code').on('change', () => {
        if ($('#ident_code').val() != null) {
            showUploadBlocks();
        }
    });
}());

(function customizeUploadBTN() {
    $('.labelBtn').on('click', () => {
        $('#upload-excel').click();
    });
})();

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

                const identCode = $('#ident_code').val();
                const clID = getClientIDByIdentCode(identCode);

                const usedEnergyValue = 1;
                const producedEnergyValue = 2;

                for (let x = 1; x < arr[0].length; x += 1) {
                    let currDateHelper = arr[0][x].split(' ');
                    let secondDateHelper = currDateHelper[0].split('.');
                    let currDate = new Date(`${secondDateHelper[2]}.${secondDateHelper[1]}.${secondDateHelper[0]}`);
                    for (let val = 0; val < 24; val += 1) {
                        let undefinedHour = undefined;
                        try {
                            var currHourValue = (arr[0][x].split(' ')[1].split(':')[0]) - 1 === -1 ? 23 : (arr[0][x].split(' ')[1].split(':')[0]) - 1;
                        } catch (e) {
                            currHourValue = null
                        }

                        try {
                            var nextHourValue = (arr[0][x + 1].split(' ')[1].split(':')[0]) - 1 === -1 ? 23 : (arr[0][x + 1].split(' ')[1].split(':')[0]) - 1;
                        } catch (e) {
                            nextHourValue = null
                        }

                        if (currHourValue === nextHourValue) {
                            undefinedHour = Number(arr[1][x]) + Number(arr[1][x + 1]);
                            x += 1;
                        } else if (currHourValue != val) {
                            undefinedHour = null;
                            x -= 1;
                        }

                        usedHourObj = {
                            currHour: val,
                            currValue: undefinedHour === null? undefinedHour : arr[1][x] || -1
                        }
                        producedHourObj = {
                            currHour: val,
                            currValue: undefinedHour === null? undefinedHour : arr[2][x] || 0
                        }
                        currUsedEnergyHourValues.push(usedHourObj);
                        currProducedEnergyHourValues.push(producedHourObj)
                        x += 1;
                    }
                    let formattedDate = `${currDate.getFullYear()}-${currDate.getMonth()+1}-${currDate.getDate()}`;
                    usedEnergyReadingESO.push(formattedDate, currUsedEnergyHourValues, usedEnergyValue, new Date(), clID);
                    producedEnergyReadingESO.push(formattedDate, currProducedEnergyHourValues, producedEnergyValue, new Date(), clID);
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

function getClientIDByIdentCode(identCode) {
    let result;
    $.ajax({
        url: `/api/client/${identCode}`,
        method: 'GET',
        contentType: 'application/json',
        async: false,
        dataType: 'json',
        success: function (data) {
            result = data;
        },
        error: function (jqXhr) {
            notification(jqXhr.responseText, 'success');
        }
    });
    notification('Данните се обработват', 'loading');
    return result;
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
            if (jqXhr.responseText === 'Данните вече съществуват / Грешка') {
                notification(jqXhr.responseText, 'error');
            } else {
                notification(jqXhr.responseText, 'success');
            }
        }
    });
    notification('Данните се обработват', 'loading');
};

function getDataListings() {
    $.ajax({
        url: '/api/data-listings/all-clients',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            visualizeDataListings(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function visualizeDataListings(data) {
    $('#client_names').remove();
    $('#ident_codes').remove();
    let namesDataListing = $('<datalist id="client_names" >');
    let identCodesDataListing = $('<datalist id="ident_codes" >');
    let clNames = [];
    let identCodes = [];
    for (let obj of data) {
        clNames.push(obj.client_name);
        identCodes.push(obj.ident_code);
    }
    const filteredNames = clNames.filter((v, i, a) => a.indexOf(v) === i);
    const filteredIdentCodes = identCodes.filter((v, i, a) => a.indexOf(v) === i);

    for (let name of filteredNames) {
        let currName = $(`<option>${name}</option>`);
        currName.appendTo(namesDataListing);
    }

    for (let identCode of filteredIdentCodes) {
        let currIdentCode = $(`<option>${identCode}</option>`);
        currIdentCode.appendTo(identCodesDataListing);
    }
    namesDataListing.append('</datalist>');
    identCodesDataListing.append('</datalist>');
    $('#client_name').append(namesDataListing);
    $('#ident_code').append(identCodesDataListing);
}

(function filterClientIdentCodesOnInputChange() {
    $('#client_name').on('change', () => {
        const clientName = $('#client_name').val();
        getClientIdentCodeListings(clientName);
    });
}());

function getClientIdentCodeListings(clientName) {
    $.ajax({
        url: `/api/data-listings/ident-codes/${clientName}`,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            visualizeClientIdentCodes(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            getDataListings();
            console.log(errorThrown);
        }
    });
}

function visualizeClientIdentCodes(data) {
    $('#ident_codes').remove();
    let identCodesDataListing = $('<datalist id="ident_codes" >');
    let identCodes = [];
    for (let obj of data) {
        identCodes.push(obj.ident_code);
    }
    const filteredIdentCodes = identCodes.filter((v, i, a) => a.indexOf(v) === i);

    for (let identCode of filteredIdentCodes) {
        let currIdentCode = $(`<option>${identCode}</option>`);
        currIdentCode.appendTo(identCodesDataListing);
    }
    identCodesDataListing.append('</datalist>');
    $('#ident_code').append(identCodesDataListing);
}

function addFileUploadEventListeners() {
    document.getElementById('input-excel').addEventListener('drop', processEsoHourReadings, false);
    document.getElementById('upload-excel').addEventListener('change', processEsoHourReadings, false);
}