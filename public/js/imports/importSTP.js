;
(function customizeUploadBTN() {
    $('.labelBtn').on('click', () => {
        $('#upload-excel').click();
    });
})();

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
        $('.clients-no-profile').text('');
        company.setCompany('ENERGO_PRO');
    } else if ($('#cez').is(':checked')) {
        $('.clients-no-profile').text('');
        company.setCompany('CEZ');
    } else if ($('#evn').is(':checked')) {
        company.setCompany('EVN');
    }
    if (company.getCompany() != '') {
        showUploadBlocks();
    }
}));
$(document).ready(function () {
    document.getElementById('input-excel').addEventListener('drop', processFile, false);
    document.getElementById('upload-excel').addEventListener('change', processFile, false);
});

function showUploadBlocks() {
    $('#input-excel').removeClass('invisible');
    $('div.invisible').removeClass('invisible');
}

function processFile(e) {
    const meteringType = 2; // STP metering_type = 2
    let cl;
    let clientIds = [];
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

    var reader = new FileReader();
    let fileName = '';
    try {
        fileName = e.dataTransfer.files[0].name
    } catch (e) {
        fileName = document.getElementById('upload-excel').files[0].name;
    }
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

                        let type = value['3'];
                        if (type === '"Техническа част"') {
                            type = 1;
                        } else if (type === '"Разпределение"') {
                            type = 2;
                        }
                        //ENERGO PRO operator 3
                        let operator = 3;
                        let client = [value['7'], value['4'], operator, new Date()];

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


                        let type = value['3'];
                        if (type === '"Техническа част"') {
                            type = 1;
                        } else if (type === '"Разпределение"') {
                            type = 2;
                        }
                        //CEZ operator 2
                        let operator = 2;

                        let client = [value['7'], value['4'].replace(/"/g, ''), operator, new Date()];

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


                        let type = value['3'];
                        if (type === '"Техническа част"') {
                            type = 1;
                        } else if (type === '"Разпределение"') {
                            type = 2;
                        }
                        //EVN operator 1
                        let operator = 1;
                        let client = [value['7'].replace(/"/g, ''), value['4'].replace(/"/g, ''), operator, new Date()];
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
                console.log(filteredClients);
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
                let clientNumber;
                let ident_code; 
                let client_name;
                if (i !== 0 && i !== 1 && i !== 2) {
                    if (value['10'] != '' && value['10'] != null && value['10'] != undefined) {
                        if (value['7'] !== undefined) {
                            clientNumber = value['7'].replace(/"/g, '');
                        }
                        if (value['10'] !== undefined) {
                            ident_code = value['10'].replace(/"/g, '');
                        }
                        if (value['8'] !== undefined) {

                            client_name = value['8'].replace(/"/g, '');
                        }
                        const profileID = 0;
                        const isManufacturer = 0;

                        let type = value['3'];
                        if (type === '"Техническа част"') {
                            type = 1;
                        } else if (type === '"Разпределение"') {
                            type = 2;
                        }
                        //EVN operator 1  
                        let operator = 1;
                        let client = [clientNumber, client_name, ident_code, meteringType, profileID, operator, isManufacturer, new Date()];
                        console.log(client)
                        let d1 = value['12'].replace(/"/g, '');
                        let arr = d1.split('.');
                        let date_from = `${arr[2]}-${arr[1]}-${arr[0]}`;

                        let d2 = value['13'].replace(/"/g, '');
                        let arr1 = d2.split('.');
                        let date_to = `${arr1[2]}-${arr1[1]}-${arr1[0]}`;

                        let reading = [ident_code, date_from, date_to, value['14'].replace(/"/g, ''), value['15'].replace(/"/g, ''), value['17'].replace(/"/g, ''), value['18'].replace(/"/g, ''), value['19'].replace(/"/g, ''), value['20'].replace(/"/g, ''), value['21'].replace(/"/g, ''), value['23'].replace(/"/g, ''), value['24'].replace(/"/g, ''), value['25'].replace(/"/g, ''), value['26'].replace(/"/g, ''), value['27'].replace(/"/g, ''), value['28'].replace(/"/g, ''), value['29'].replace(/"/g, ''), type, operator];

                        readingsAll.push(reading);
                        clientIds.push(ident_code);
                        clientsAll.push(client);
                    }
                }
            });
            console.log(clientsAll)
            saveClientsToDB(clientsAll);
            const mappedClientsIDs = mapClientsIDsToGetIdentCodeCorrectly(clientIds);
            cl = getClientsFromDB(mappedClientsIDs);
            changeClientIdForReadings(readingsAll, cl)
            saveReadingsToDB(readingsAll);

            let allSTPHourReadings = [];
            let clientsWithoutProfile = [];
            let currHourReadingClient = col[3][10];
            for (let i = 3; i < col.length; i += 1) {
                try {
                    let currentDateFrom = col[i][12].split(".");
                    let currentDateTo = col[i][13].split(".");
                    let formmatedDateFrom = new Date(`${currentDateFrom[1]}.${currentDateFrom[0]}.${currentDateFrom[2]}`)
                    let formattedDateTo = new Date(`${currentDateTo[1]}.${currentDateTo[0]}.${currentDateTo[2]}`)
                    let currValues = 0;
                    let currSTPHourReading = [];
                    let currClientName = col[i][8].replace(/"/g, '');
                    if (getProfile(currHourReadingClient) === 0) {
                        clientsWithoutProfile.push(currHourReadingClient);
                    }
                    while (currHourReadingClient == col[i + 1][10]) {

                        let currDiff = col[i][21].replace(/"/g, '');
                        currDiff = currDiff.replace(/,/g, '\.');
                        if (currDiff != '' && currDiff != undefined && currDiff != null && currDiff != ' ') {
                            currValues += currDiff / 1000;
                            currHourReadingClient = col[i][10];
                        }
                        i += 1;
                    }
                    currSTPHourReading.push(currHourReadingClient, formmatedDateFrom, formattedDateTo, currValues, currClientName);
                    allSTPHourReadings.push(currSTPHourReading);
                    currHourReadingClient = col[i + 1][10];
                } catch (e) {
                    break;
                }
            }

            if (clientsWithoutProfile.length === 0) {
                let finalSTPHourReadings = [];
                for (let x = 0; x < allSTPHourReadings.length; x += 1) {
                    let startDate = allSTPHourReadings[x][1];
                    let endDate = allSTPHourReadings[x][2];
                    let currDate = startDate;

                    while (currDate.getDate() != endDate.getDate() ||
                        currDate.getMonth() != endDate.getMonth() ||
                        currDate.getFullYear() != endDate.getFullYear()) {
                        const formattedDate = `${currDate.getFullYear()}-${currDate.getMonth()+1}-${currDate.getDate()}`;
                        const currClientName = allSTPHourReadings[x][4];
                        const currClientID = allSTPHourReadings[x][0].replace(/"/g, '');;
                        let currHourValues = [];
                        const currAmount = getProfileAmount(currClientID, formattedDate);
                        for (let val = 0; val < 24; val += 1) {
                            currHourObj = {
                                currHour: val,
                                currValue: allSTPHourReadings[x][3] * currAmount[val]
                            }
                            currHourValues.push(currHourObj);
                        }
                        const typeEnergy = 0; // ACTIVE ENERGY
                        const erpType = 1; //  EVN
                        let currHourReading = [];
                        currHourReading.push(currClientName, currClientID, typeEnergy, formattedDate, currHourValues, erpType, new Date());
                        finalSTPHourReadings.push(currHourReading);
                        currDate.setDate(currDate.getDate() + 1);
                    }
                }
                changeClientIdForHourReadings(finalSTPHourReadings, cl);
                saveSTPHourReadingsToDB(finalSTPHourReadings);
            } else {
                $('.clients-no-profile').text('Клиенти ' + clientsWithoutProfile.join(', ') + ' нямат профил и заявката за СТП почасови мерения е отказана! Трябва да им се сложат профили.');
                console.log('Клиенти ' + clientsWithoutProfile.join(', ') + ' нямат профил и заявката за СТП почасови мерения е отказана! Трябва да им се сложат профили.');
                notification('Клиенти ' + clientsWithoutProfile.join(', ') + ' нямат профил и заявката за СТП почасови мерения е отказана! Трябва да им се сложат профили.', 'error');
            }
        }
        ////////////
        //CEZ CSV///
        ////////////
        else if (company.getCompany() === companies.CEZ) {
            col.forEach(function (value, i) {
                let clientNumber;
                let ident_code;
                let client_name;

                if (i !== 0 && i !== 1) {
                    if (value['0'] != '""' && value['0'] != null && value['0'] != undefined && value['0'] != '') {
                        if (value['7'] !== undefined) {
                            clientNumber = value['7'].replace(/"/g, '');
                        }
                        if (value['10'] !== undefined) {
                            ident_code = value['10'].replace(/"/g, '');
                        }
                        if (value['8'] !== undefined) {

                            client_name = value['8'].replace(/"/g, '');
                        }
                        const profileID = 0;
                        const isManufacturer = 0;



                        let type = value['3'];
                        if (type == '"Техническа част"') {
                            type = 1;
                        } else if (type == '"Разпределение"') {
                            type = 2;
                        }
                        //CEZ operator 2
                        let operator = 2;
                        let client = [clientNumber, client_name, ident_code, meteringType, profileID, operator, isManufacturer, new Date()];
                        let dateFromHelper = value['12'].replace(/"/g, '');

                        let arr = dateFromHelper.split('.');
                        let date_from = `${arr[2]}-${arr[1]}-${arr[0]}`;

                        let dateToHelper = value['13'].replace(/"/g, '');
                        let arr1 = dateToHelper.split('.');
                        let date_to = `${arr1[2]}-${arr1[1]}-${arr1[0]}`;

                        let reading = [ident_code, date_from, date_to, value['14'].replace(/"/g, ''), value['15'].replace(/"/g, ''), value['17'].replace(/"/g, ''), value['18'].replace(/"/g, ''), value['19'].replace(/"/g, ''), value['20'].replace(/"/g, ''), value['21'].replace(/"/g, ''), value['23'].replace(/"/g, ''), value['24'].replace(/"/g, ''), value['25'].replace(/"/g, ''), value['26'].replace(/"/g, ''), value['27'].replace(/"/g, ''), value['28'].replace(/"/g, ''), value['29'].replace(/"/g, ''), type, operator];
                        readingsAll.push(reading);
                        clientIds.push(ident_code);
                        clientsAll.push(client);
                    }
                }
            });
            saveClientsToDB(clientsAll);
            const mappedClientsIDs = mapClientsIDsToGetIdentCodeCorrectly(clientIds)
            cl = getClientsFromDB(mappedClientsIDs);
            changeClientIdForReadings(readingsAll, cl)
            saveReadingsToDB(readingsAll);
        }
        //////////////////
        //ENERGO_PRO CSV//
        /////////////////
        else if (company.getCompany() === companies.ENERGO_PRO) {
            col.forEach(function (value, i) {
                let clientNumber;
                let ident_code;
                let client_name;
                if (i !== 0) {
                    if (value['7'] !== undefined) {
                        clientNumber = value['7'].replace(/"/g, '');
                    }
                    if (value['10'] !== undefined) {
                        ident_code = value['10'].replace(/"/g, '');
                    }
                    if (value['8'] !== undefined) {

                        client_name = value['8'].replace(/"/g, '');
                    }
                    const profileID = 0;
                    const isManufacturer = 0;

                    if (value['4'] == '' || value['4'] == undefined) {
                        return;
                    }
                    if (value['7'] == '') {
                        return;
                    }

                    let type = value['3'];
                    if (type === '"Техническа част"') {
                        type = 1;
                    } else if (type === '"Разпределение"') {
                        type = 2;
                    }
                    //ENERGO PRO operator 3
                    let operator = 3;
                    let client = [clientNumber, client_name, ident_code, meteringType, profileID, operator, isManufacturer, new Date()];
                    let d1 = value['12'].replace(/"/g, '');
                    let arr = d1.split('.');
                    let date_from = `${arr[2]}-${arr[1]}-${arr[0]}`;

                    let d2 = value['13'].replace(/"/g, '');
                    let arr1 = d2.split('.');
                    let date_to = `${arr1[2]}-${arr1[1]}-${arr1[0]}`;

                    let reading = [ident_code, date_from, date_to, value['14'].replace(/"/g, ''), value['15'].replace(/"/g, ''), value['17'].replace(/"/g, ''), value['18'].replace(/"/g, ''), value['19'].replace(/"/g, ''), value['20'].replace(/"/g, ''), value['21'].replace(/"/g, ''), value['23'].replace(/"/g, ''), value['24'].replace(/"/g, ''), value['25'].replace(/"/g, ''), value['26'].replace(/"/g, ''), value['27'].replace(/"/g, ''), value['28'].replace(/"/g, ''), value['29'].replace(/"/g, ''), type, operator];

                    readingsAll.push(reading);
                    clientIds.push(ident_code);
                    clientsAll.push(client);
                }
            });
            saveClientsToDB(clientsAll);
            const mappedClientsIDs = mapClientsIDsToGetIdentCodeCorrectly(clientIds)
            cl = getClientsFromDB(mappedClientsIDs);
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
                if (filteredClients != '' && filteredClients != '' && filteredClients != null) {
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
    notification('Зареждане', 'loading');
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
            notification(jqXhr.responseText, 'success');
        }
    });
};

function getClientsFromDB(clients) {
    notification('Зареждане', 'loading');
    let retVal;
    $.ajax({
        url: '/getClient',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        data: JSON.stringify(clients),
        success: function (data) {
            retVal = data;
        },
        error: function (jqXhr, textStatus, errorThrown) {
            notification(jqXhr.responseText, 'success');
        }
    });
    return retVal;
};

function getProfile(identCode) {
    notification('Зареждане', 'loading');
    let profile;
    $.ajax({
        url: `/api/getProfile/${identCode}`,
        method: 'GET',
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        success: function (data) {
            profile = data;
        },
        error: function (jqXhr, textStatus, errorThrown) {
            notification(jqXhr.responseText, 'success');
        }
    });
    return profile;
}

function getProfileAmount(identCode, date) {
    notification('Зареждане', 'loading');
    let amount;
    $.ajax({
        url: `/api/getProfile-HourValue/${identCode}/${date}`,
        method: 'GET',
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        success: function (data) {
            amount = data;
        },
        error: function (jqXhr, textStatus, errorThrown) {
            notification(jqXhr.responseText, 'success');
        }
    });
    return amount;
}

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

function mapClientsIDsToGetIdentCodeCorrectly(clientIds) {
    return clientIds.map(clientID => `'${clientID}'`);
}

function saveReadingsToDB(readings) {
    notification('Данните се обработват', 'loading');
    $.ajax({
        url: '/addreadings',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        data: JSON.stringify(readings),
        success: function (data) {},
        error: function (jqXhr, textStatus, errorThrown) {
            notification(jqXhr.responseText, 'success');
        }
    });
};

function saveSTPHourReadingsToDB(readings) {
    $.ajax({
        url: '/api/addSTPHourReadings',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(readings),
        success: function (data) {
            console.log('Readings saved');
        },
        error: function (jqXhr, textStatus, errorThrown) {
            if (jqXhr.responseText === 'Данните вече съществуват / Грешка') {
                notification(jqXhr.responseText, 'error');
            } else {
                notification(jqXhr.responseText, 'success');
            }
        }
    });
    notification('Данните се обработват', 'loading');
};

function changeClientIdForHourReadings(allSTPHourReadings, cl) {
    allSTPHourReadings.forEach(stp_hour_reading => {
        if (cl != undefined) {
            for (let i = 0; i < cl.length; i++) {
                if (cl[i].ident_code == stp_hour_reading['1']) {
                    stp_hour_reading['1'] = cl[i].id;
                }
            }
        }
    });
};