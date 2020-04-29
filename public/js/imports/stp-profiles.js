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
    if ($('#profiles-energo-pro').is(':checked')) {
        profile.setCompany('ENERGO_PRO');
    } else if ($('#profiles-evn').is(':checked')) {
        profile.setCompany('EVN');
    } else if ($('#profiles-cez').is(':checked')) {
        profile.setCompany('CEZ');
    }
    const checker = validateProfileInput();
    checker ? showUploadBlocksProfiles() : '';
}));

function showUploadBlocksProfiles() {
    $('#profile-import').removeClass('invisible');
}

function validateProfileInput() {
    let importDataType = false;
    $("input[name='radio']").each(function () {
        const checked = $(this).prop('checked');
        checked ? importDataType = true : '';
    });
    let profileName = $("#profile-name").val();

    if (profileName && importDataType != '') {
        return true;
    }
    return false;
}

Date.prototype.removeDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() - days);
    return date;
}

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};
$(document).ready(function () {
    document.getElementById('profile-import').addEventListener('drop', processFile, false);
    document.getElementById('upload-profiles').addEventListener('change', processFile, false);
});

function processFile(e) {
    notification('Зареждане', 'loading');
    e.stopPropagation();
    e.preventDefault();
    let files = '';
    let f = '';
    try {
        files = e.dataTransfer.files,
            f = files[0];
    } catch (e) {
        files = document.getElementById('upload-profiles').files,
            f = document.getElementById('upload-profiles').files[0];
    }
    var reader = new FileReader();
    let fileName = '';
    try {
        fileName = e.dataTransfer.files[0].name
    } catch (e) {
        fileName = document.getElementById('upload-profiles').files[0].name;
    }
    let extension = fileName.slice(fileName.lastIndexOf('.') + 1);
    if (extension === 'xlsx' || extension === 'xls') {
        reader.onload = function (e) {
            let data = new Uint8Array(e.target.result);
            let workbook = XLSX.read(data, {
                type: 'array'
            });
            let first_sheet_name = workbook.SheetNames[0];
            setProfileNameAndType();
            validateDocument();
            createProfile();
            let profileID = getProfileID();
            let arr = getRows(workbook['Sheets'][`${first_sheet_name}`]);
            let allProfileCoefs = [];
            let currProfileCoef = [];
            let currHourValues = [];
            let currHourObj = {};

            if (profile.getCompany() === companies.CEZ) {
                for (let x = 1; x < arr[0].length; x += 1) {
                    let currDate = new Date(`${arr[0][x]} ${arr[2][x]}`);
                    for (let val = 0; val < 24; val += 1) {

                        let undefinedHour = undefined;
                        try {
                            const timeRangeCurrentHour = arr[2][x].split(' ')[1];
                            if (timeRangeCurrentHour === 'PM' && Number(arr[2][x].split(' ')[0].split(':')[0]) !== 12) {
                                var currHourValue = Number(arr[2][x].split(' ')[0].split(':')[0]) - 1 === -1 ? 23 : Number(arr[2][x].split(' ')[0].split(':')[0]) - 1 + 12;
                            } else if (timeRangeCurrentHour === 'PM' && Number(arr[2][x].split(' ')[0].split(':')[0]) === 12) {
                                var currHourValue = Number(arr[2][x].split(' ')[0].split(':')[0]) - 1;
                            } else if (timeRangeCurrentHour === 'AM' && Number(arr[2][x].split(' ')[0].split(':')[0]) === 12) {
                                var currHourValue = 23;
                            } else {
                                var currHourValue = Number(arr[2][x].split(' ')[0].split(':')[0]) === 12 ? Number(arr[2][x].split(' ')[0].split(':')[0]) - 12 : Number(arr[2][x].split(' ')[0].split(':')[0]) - 1;
                            }
                        } catch (e) {
                            currHourValue = -1
                        }

                        try {
                            const timeRangeNextHour = arr[2][x + 1].split(' ')[1];
                            if (timeRangeNextHour === 'PM' && Number(arr[2][x + 1].split(' ')[0].split(':')[0]) !== 12) {
                                var nextHourValue = Number(arr[2][x + 1].split(' ')[0].split(':')[0]) - 1 === -1 ? 23 : Number(arr[2][x + 1].split(' ')[0].split(':')[0]) - 1 + 12;
                            } else if (timeRangeNextHour === 'PM' && Number(arr[2][x + 1].split(' ')[0].split(':')[0]) === 12) {
                                var nextHourValue = Number(arr[2][x + 1].split(' ')[0].split(':')[0]) - 1;
                            } else if (timeRangeNextHour === 'AM' && Number(arr[2][x + 1].split(' ')[0].split(':')[0]) === 12) {
                                var nextHourValue = 23;
                            } else {
                                var nextHourValue = Number(arr[2][x + 1].split(' ')[0].split(':')[0]) === 12 ? Number(arr[2][x + 1].split(' ')[0].split(':')[0]) - 12 : Number(arr[2][x + 1].split(' ')[0].split(':')[0]) - 1;
                            }
                        } catch (e) {
                            nextHourValue = -1
                        }

                        if (currHourValue === nextHourValue) {
                            undefinedHour = Number(arr[3][x]) + Number(arr[3][x + 1]);
                            x += 1;
                        } else if (currHourValue != val) {
                            undefinedHour = -1;
                            x -= 1;
                        }

                        currHourObj = {
                            currHour: val,
                            currValue: undefinedHour || arr[3][x]
                        }
                        currHourValues.push(currHourObj);
                        x += 1;
                    }
                    let formattedDate = `${currDate.getFullYear()}-${currDate.getMonth()+1}-${currDate.getDate()}`;

                    currProfileCoef.push(profileID, formattedDate, currHourValues, new Date());
                    allProfileCoefs.push(currProfileCoef);
                    currHourValues = [];
                    currProfileCoef = [];
                    currHourObj = {};
                    x -= 1;
                }

                saveProfileReadingsToDB(allProfileCoefs);
                /*    while (true) {
                    if (arr[0][i] != '' && arr[0][i] != undefined && arr[2][i] != '' && arr[2][i] != undefined) {
                        let currDate = new Date(`${arr[0][i]} ${arr[2][i]}`);
                        let nextDate = new Date(`${arr[0][i + 1]} ${arr[2][i+1]}`);
                        let currHourHelper = `${arr[2][i].split(":")[0]}`;
                        currHourHelper -= 1;
                        if (currHourHelper == -1) {
                            currHourHelper = 23;
                        }
                        let currDateHelper = `${arr[0][i]}`;
                        while (currDate.getDate() == nextDate.getDate()) {
                            currDate = new Date(`${arr[0][i]} ${arr[2][i]}`);
                            nextDate = new Date(`${arr[0][i + 1]} ${arr[2][i+1]}`)
                            currHourObj = {
                                currHour: currDate.getHours(),
                                currValue: Number(arr[3][i].replace(/["']/g, ""))
                            }
                            currHourValues.push(currHourObj);
                            i += 1;
                        }

                        let formattedDate = `${currDate.getFullYear()}-${currDate.getMonth()+1}-${currDate.getDate()}`;
                        if (currHourValues.length == 0) {
                            currHourObj = {
                                currHour: currDate.getHours(),
                                currValue: Number(arr[3][i].replace(/["']/g, ""))
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
*/
                //   saveProfileReadingsToDB(allProfileCoefs);
            } else if (profile.getCompany() === companies.ENERGO_PRO || profile.getCompany() === companies.EVN) {

                for (let x = 1; x < arr[0].length; x += 1) {
                    let currDateHelper = `${arr[0][x]}`;
                    let currDate = new Date(currDateHelper.split(" ")[0]);
                    for (let val = 0; val < 24; val += 1) {
                        let undefinedHour = undefined;
                        try {
                            var currHourValue = (arr[0][x].split(' ')[1].split(':')[0]) - 1 === -1 ? 23 : (arr[0][x].split(' ')[1].split(':')[0]) - 1;
                        } catch (e) {
                            currHourValue = -1
                        }

                        try {
                            var nextHourValue = (arr[0][x + 1].split(' ')[1].split(':')[0]) - 1 === -1 ? 23 : (arr[0][x + 1].split(' ')[1].split(':')[0]) - 1;
                        } catch (e) {
                            nextHourValue = -1
                        }

                        if (currHourValue === nextHourValue) {
                            undefinedHour = Number(arr[1][x]) + Number(arr[1][x + 1]);
                            x += 1;
                        } else if (currHourValue != val) {
                            undefinedHour = -1;
                            x -= 1;
                        }

                        currHourObj = {
                            currHour: val,
                            currValue: undefinedHour || arr[1][x]
                        }
                        currHourValues.push(currHourObj);
                        x += 1;
                    }
                    let formattedDate = `${currDate.getFullYear()}-${currDate.getMonth()+1}-${currDate.getDate()}`;
                    if (!formattedDate.includes('NaN')) {
                        currProfileCoef.push(profileID, formattedDate, currHourValues, new Date());
                        allProfileCoefs.push(currProfileCoef);
                        currHourValues = [];
                        currProfileCoef = [];
                        currHourObj = {};
                        x -= 1;
                    }
                }
                saveProfileReadingsToDB(allProfileCoefs);
                //     let i = 1;
                /*     while (true) {
                         if (arr[0][i] != '' && arr[0][i] != undefined && arr[1][i] != '' && arr[1][i] != undefined) {
                             let currDate = new Date(arr[0][i]);
                             let nextDate = new Date(arr[0][i + 1]);
                             while (currDate.getDate() == nextDate.getDate()) {
                                 currDate = new Date(arr[0][i]);
                                 nextDate = new Date(arr[0][i + 1])
                                 currHourObj = {
                                     currHour: currDate.getHours(),
                                     currValue: Number(arr[1][i].replace(/["']/g, ""))
                                 }
                                 currHourValues.push(currHourObj);
                                 i += 1;
                             }

                             let formattedDate = `${currDate.getFullYear()}-${currDate.getMonth()+1}-${currDate.getDate()}`;
                             if (currHourValues.length == 0) {
                                 currHourObj = {
                                     currHour: currDate.getHours(),
                                     currValue: Number(arr[1][i].replace(/["']/g, ""))
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
                     saveProfileReadingsToDB(allProfileCoefs);
                     */
            }
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
    notification('Зареждане', 'loading');
    $.ajax({
        url: '/api/createProfile',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        data: JSON.stringify({
            name: profile.getName(),
            type: profile.getType()
        }),
        success: function data() {},
        error: function (jqXhr, textStatus, errorThrown) {
            notification(jqXhr.responseText, 'success');
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
    notification('Зареждане', 'loading');
    let id = '';
    $.ajax({
        url: '/api/getProfileID',
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
            notification(jqXhr.responseText, 'success');
        }
    });
    return id;
}

function saveProfileReadingsToDB(readings) {
    notification('Зареждане', 'loading');
    $.ajax({
        url: '/api/saveProfileReadings',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(readings),
        success: function (data) {
            notification('Данните се обработват', 'success');
        },
        error: function (jqXhr, textStatus, errorThrown) {
            if (jqXhr.responseText === 'Вече има профил с това име / Данните вече съществуват') {
                notification(jqXhr.responseText, 'error');
            } else {
                notification(jqXhr.responseText, 'success');
            }
        }
    });
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
    let profileName = $('#profile-name').val();
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