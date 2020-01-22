const companies = {
    ENERGO_PRO: 'ENERGO_PRO',
    EVN: 'EVN',
    CEZ: 'CEZ'
};

class Profile {
    constructor() {
        this.company = '';
        this.name = '';
        this.type = '';
    }
    getCompany() {
        return this.company;
    }
    getName() {
        return this.name;
    }
    getType() {
        return this.type;
    }
    setCompany(company) {
        this.company = company;
        return this;
    }
    setType(type) {
        this.type = type;
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
}

let profile = new Profile();

($('body > div.container').click(() => {
    if ($('#energo-pro').is(':checked')) {
        profile.setCompany('ENERGO_PRO');
    } else if ($('#evn').is(':checked')) {
        profile.setCompany('EVN');
    } else if ($('#cez').is(':checked')) {
        profile.setCompany('CEZ');
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
    var files = e.dataTransfer.files,
        f = '';
    let allHourReadings = [];
    f = files[0];
    var reader = new FileReader();
    var fileName = e.dataTransfer.files[0].name;
    let extension = fileName.slice(fileName.lastIndexOf('.') + 1);
    if (extension === 'xlsx' || extension === 'xls') {
        reader.onload = function (e) {
            let data = new Uint8Array(e.target.result);
            let workbook = XLSX.read(data, {
                type: 'array'
            });
            let first_sheet_name = workbook.SheetNames[0];

            let clientName;
            let clientID;
            let clientIDs = [];
            let clientsALL = [];

            setProfileNameAndType();
            validateDocument();
            createProfile();
            let profileID = getProfileID();
            let arr = getRows(workbook['Sheets'][`${first_sheet_name}`]);
            let allProfileCoefs = [];
            let currProfileCoef = [];
            let currHourValues = [];
            let currHourObj = {};
            let currHour;
            let currValue;
            let isCompleted = false;

            let i = 1;
            while (true) {
                if (arr[0][i] != '' && arr[0][i] != undefined && arr[1][i] != '' && arr[1][i] != undefined) {
                    let currDate = new Date(arr[0][i]);
                    let nextDate = new Date(arr[0][i + 1]);
                    while (currDate.getDate() == nextDate.getDate()) {
                        currDate = new Date(arr[0][i]);
                        nextDate = new Date(arr[0][i + 1])
                        currHourObj = {
                            currHour: currDate.getHours(),
                            currValue: arr[1][i]
                        }
                        currHourValues.push(currHourObj);
                        i += 1;
                    }

                    let formattedDate = `${currDate.getFullYear()}-${currDate.getMonth()+1}-${currDate.getDate()}`;
                    if (currHourValues.length == 0) {
                        currHourObj = {
                            currHour: currDate.getHours(),
                            currValue: arr[1][i]
                        }
                        currHourValues.push(currHourObj);
                        currProfileCoef.push(profileID, formattedDate, currHourValues, new Date());
                        allProfileCoefs.push(currProfileCoef);
                        break;
                    }
                    currProfileCoef.push(profileID, formattedDate, currHourValues, new Date());
                    allProfileCoefs.push(currProfileCoef);

                    currProfileCoef = [];
                    currHourObj = {};
                    currHourValues = [];
                }
            }
            console.log(allProfileCoefs);
            saveProfileReadingsToDB(allProfileCoefs);
        }
        reader.readAsArrayBuffer(f);
    } else {
        throwErrorForInvalidFileFormat();
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

function throwErrorForInvalidFileFormat() {
    notification('Invalid file format', 'error');
}

function createProfile() {

    notification('Loading..', 'loading');
    $.ajax({
        url: 'http://localhost:3000/api/createProfile',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        data: JSON.stringify({
            name: profile.getName(),
            type: profile.getType()
        }),
        success: function data() {
            console.log('Profile saved');
        },
        error: function (jqXhr, textStatus, errorThrown) {
            //  notification(errorThrown, 'error');
            console.log('error in client save');
        }
    });
}

function convertClientIDsToString(clientIDs) {
    return clientIDs.map(clientID => convertClientIDToString(clientID));
}

function convertClientIDToString(clientID) {
    return `"${clientID}"`;
}

function getProfileID() {
    notification('Loading..', 'loading');
    let id = '';
    $.ajax({
        url: 'http://localhost:3000/api/getProfileID',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
            name: profile.getName()
        }),
        success: function data(data) {
            id = data
        },
        async: false,
        error: function (jqXhr, textStatus, errorThrown) {
            //  notification(errorThrown, 'error');
            console.log('error in get profileID');
        }
    });
    return id;
}

function saveProfileReadingsToDB(readings) {

    $.ajax({
        url: 'http://localhost:3000/api/saveProfileReadings',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(readings),
        async: false,
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

function validateDocument() {
    validateProfileName();
    validateCompany();
}

function validateCompany() {
    if (Object.values(companies).indexOf(profile.getCompany()) < 0) {
        notification('Избери компания', 'error');
        throw new Error('Избери компания');
    }
}

function validateProfileName() {
    if (profile.getName() == '') {
        notification('Напиши име на профил', 'error');
        throw new Error('Напиши име на профил');
    }
}

function setProfileName() {
    let profileName = $('body > div.container.mt-3 > div.container > div > input').val();
    profile.setName(profileName);
}

function setProfileType() {
    if (profile.getCompany() === companies.EVN) {
        profile.setType(1);
    } else if (profile.getCompany() === companies.CEZ) {
        profile.setType(2);
    } else if (profile.getCompany() === companies.ENERGO_PRO) {
        profile.setType(3);
    }
}

function setProfileNameAndType() {
    setProfileName();
    setProfileType();
}