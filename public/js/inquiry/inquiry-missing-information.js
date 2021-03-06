;
$(document).ready(function () {
    visualizeAllInputFromGetParams();
    configurateInputs();
    getInitialDataListings();
    renderTableHeadings();
    getReadings();
});

const dataTypes = {
    HOUR_READING: 'hour-reading',
    GRAPH: 'graph'
}

const readingTypes = {
    STP_HOUR_READING: 'stp_hour_reading',
    STP_GRAPH_READING: 'stp_graph_reading',
    HOUR_READING: 'hour_reading',
    GRAPH_READING: 'graph_reading',
    HOUR_READING_ESO: 'hour_reading_eso',
    GRAPH_READING_ESO: 'graph_reading_eso'
}

class MissingInfoType {
    constructor() {
        this.readingType = '';
        this.dataType = '';
    }
    getReadingType() {
        return this.readingType;
    }
    setReadingType(readingType) {
        return this.readingType = readingType;
    }
    getDataType() {
        return this.dataType;
    }
    setDataType(dataType) {
        return this.dataType = dataType;
    }
}

missingInfoType = new MissingInfoType();

const FULL_TABLE_COLUMNS = [{
        data: "id",
        render: function (data, type, row) {
            const classType = row['id'] === 'Липсва' ? 'missing-info' : 'full';
            const date = row['date'];
            const fullDate = new Date(date);
            const fixedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1}-${fullDate.getDate()}`;
            const readingType = missingInfoType.getReadingType();
            switch (readingType) {
                case readingTypes.HOUR_READING:
                    return `<td><a class="${classType}" href=/users/clients/hour-reading/daily/s?id=${row['id']}&date=${fixedDate}&ident_code=${row['ident_code']}>${row['id']}</td>`;
                case readingTypes.STP_HOUR_READING:
                    return `<td><a class="${classType}" href=/users/clients/stp-hour-reading/daily/s?id=${row['id']}&date=${fixedDate}&ident_code=${row['ident_code']}>${row['id']}</td>`;
                case readingTypes.GRAPH_READING:
                    return `<td><a class="${classType}" href=/users/clients/graphs-hour-prediction/daily/s?id=${row['id']}&date=${fixedDate}&ident_code=${row['ident_code']}>${row['id']}</td>`
                case readingTypes.STP_GRAPH_READING:
                    return `<td><a class="${classType}" href=/users/clients/graphs-stp-hour-prediction/monthly/s?id=${row['id']}&date=${fixedDate}&ident_code=${row['ident_code']}>${row['id']}</td>`;
            }
        }
    }, {
        data: "ident_code",
        render: function (data, type, row) {
            let readingType = missingInfoType.getReadingType();
            const date = row['date'];
            const fullDate = new Date(date);
            const formattedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1<10?`0${fullDate.getMonth()+1}`:fullDate.getMonth()+1}-${fullDate.getDate()<10?`0${fullDate.getDate()}`:fullDate.getDate()}`;
            switch (readingType) {
                case readingTypes.HOUR_READING:
                    readingType = 'hour-reading';
                    return `<td><a href=/users/clients/info/${row['cId']}?date=${formattedDate}&type=${readingType}>${row['ident_code']}</a></td>`;
                case readingTypes.STP_HOUR_READING:
                    readingType = 'stp-hour-reading';
                    return `<td><a href=/users/clients/info/${row['cId']}?date=${formattedDate}&type=${readingType}>${row['ident_code']}</a></td>`;
                case readingTypes.GRAPH_READING:
                    readingType = 'graph-hour-prediction';
                    return `<td><a href=/users/clients/info/${row['cId']}?date=${formattedDate}&type=${readingType}>${row['ident_code']}</a></td>`;
                case readingTypes.STP_GRAPH_READING:
                    readingType = 'stp-graph-hour-prediction';
                    return `<td><a href=/users/clients/info/${row['cId']}?date=${formattedDate}&type=${readingType}>${row['ident_code']}</a></td>`;
            }
        },
    }, {
        data: "client_name",
        render: function (data, type, row) {
            return '<td>' + row['client_name'] + '</td>';
        },
    }, {
        data: "date",
        render: function (data, type, row) {
            const date = row['date'];
            const fullDate = new Date(date);
            const formattedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1<10?`0${fullDate.getMonth()+1}`:fullDate.getMonth()+1}-${fullDate.getDate()<10?`0${fullDate.getDate()}`:fullDate.getDate()}`;
            return '<td>' + formattedDate + '</td>'
        },
    },
    {
        data: "erp_type",
        render: function (data, type, row) {
            const erpType = row['erp_type'] == 1 ? 'EVN' : row['erp_type'] == 2 ? 'ЧЕЗ' : 'ЕнергоПРО';
            return '<td>' + erpType + '</td>';
        }
    },
];

const ESO_TABLE_COLUMNS = [{
        data: "id",
        render: function (data, type, row) {
            let readingType;
            const selected = missingInfoType.getReadingType();
            switch (selected) {
                case readingTypes.HOUR_READING_ESO:
                    readingType = 'eso-hour-readings';
                    break;
                case readingTypes.GRAPH_READING_ESO:
                    readingType = 'eso-graph-predictions';
                    break;
            }
            const date = row['date'];
            const fullDate = new Date(date);
            const fixedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1}-${fullDate.getDate()}`;
            const id = row['id'] === '-' ? 'Липсва' : row['id'];
            const classType = id === 'Липсва' ? 'missing-info' : 'full';
            return `<td><a class="${classType}" href=/users/${readingType}/daily/s?id=${id}&date=${fixedDate}>${id}</td>`
        }
    },
    {
        data: "ident_code",
        render: function (data, type, row) {
            let readingType;
            const date = row['date'];
            const fullDate = new Date(date);
            const formattedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1<10?`0${fullDate.getMonth()+1}`:fullDate.getMonth()+1}-${fullDate.getDate()<10?`0${fullDate.getDate()}`:fullDate.getDate()}`;
            const selected = missingInfoType.getReadingType();
            switch (selected) {
                case readingTypes.HOUR_READING_ESO:
                    readingType = 'hour-reading';
                    break;
                case readingTypes.GRAPH_READING_ESO:
                    readingType = 'graph';
                    break;
            }
            return `<a href="/users/clients-eso/info/${row['cId']}?date=${formattedDate}&type=${readingType}">${row['ident_code']}</a>`;
        }
    },
    {
        data: "client_name",
        render: function (data, type, row) {
            return '<td>' + row['client_name'] + '</td>';
        },
    },
    {
        data: "date",
        render: function (data, type, row) {
            const date = row['date'];
            const fullDate = new Date(date);
            const formattedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1<10?`0${fullDate.getMonth()+1}`:fullDate.getMonth()+1}-${fullDate.getDate()<10?`0${fullDate.getDate()}`:fullDate.getDate()}`;
            return '<td>' + formattedDate + '</td>'
        },
    },

]

function renderTableHeadings() {
    const type = missingInfoType.getReadingType();
    let tHeadSettings = '';
    switch (type) {
        case readingTypes.HOUR_READING_ESO:
        case readingTypes.GRAPH_READING_ESO:
            tHeadSettings = $(`<th>ID на мерене</th> <th>Идентификационен код на клиент</th>
            <th>Име на клиент</th><th> Дата на мерене </th>`);
            break;
        default:
            tHeadSettings = $(`<th>ID на мерене</th>
      <th>Идентификационен код на клиент</th>
      <th>Име на клиент</th>
      <th>Дата на мерене</th>
      <th>ЕРП</th>`);
            break;
    }
    $('#inquiry-missing-information-table > thead > tr').append(tHeadSettings);
}

function getDataListings() {
    $.ajax({
        url: '/api/data-listings/imbalances',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            convertDataToSet(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });

    $.ajax({
        url: '/api/data-listings/profiles',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            visualizeProfileNameDataListings(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function convertDataToSet(data) {
    let clientNames = [];
    let clientIDs = [];
    for (let num in data) {
        clientNames.push(data[num].client_name);
        clientIDs.push(data[num].ident_code);
    }
    let uniqueClientNames = removeDuplicatesFromArr(clientNames);
    visualizeDataListings([uniqueClientNames, clientIDs]);
}

function visualizeDataListings(arr) {
    let clientNames = arr[0];
    let clientIds = arr[1];

    $('#idList option').remove();
    for (let name of clientNames) {
        $('#stp-hour-readings-clients').append(`<option value="${name}"></option>`);
    }

    for (let ID of clientIds) {
        $('#idList').append(`<option value="${ID}"></option>`);
    }
}

function visualizeProfileNameDataListings(profileNames) {
    for (let profileName of profileNames) {
        $('#profile_names').append(`<option value="${profileName.profile_name}"></option>`);
    }
}

function getReadings(arr) {
    if (!arr) {
        var name = findGetParameter('name');
        var fromDate = findGetParameter('fromDate');
        var toDate = findGetParameter('toDate');
        var clientID = findGetParameter('clientID');
        var profile_name = findGetParameter('profile_name');
        var erp = []
        var readingType = findGetParameter('readings');
        if (window.location.href.includes('energoPRO')) {
            erp.push(3);
        }
        if (window.location.href.includes('cez')) {
            erp.push(2);
        }
        if (window.location.href.includes('evn')) {
            erp.push(1);
        }
        if (window.location.href.includes('stp_hour_reading')) {
            reading_type = 'stp_hour_readings';
        }

    } else {
        var [
            fromDate,
            toDate,
            name,
            clientID,
            erp,
            reading_type,
            profile_name
        ] = arr;
    }

    if (fromDate == '') {
        fromDate = -1;
    }
    if (toDate == '') {
        toDate = -1;
    }
    if (name == '') {
        name = -1;
    }
    if (clientID == '') {
        clientID = -1;
    }
    if (profile_name == '') {
        profile_name == '';
    }
    const url = getURLForAPI();
    dataTable = $('#inquiry-missing-information-table').DataTable({
        destroy: false,
        "paging": true,
        stateSave: true,
        sAjaxDataProp: 'data',
        "order": [
            [0, "asc"]
        ],
        "processing": true,
        "serverSide": true,
        "columnDefs": [{
            "className": "dt-center",
            "targets": "_all"
        }],
        ajax: {
            url,
            data: {
                fromDate,
                toDate,
                name,
                ident_code: clientID,
                erp,
                profile_name
            },
            type: 'POST',
        },
        columns: missingInfoType.getReadingType() === readingTypes.HOUR_READING_ESO || missingInfoType.getReadingType() === readingTypes.GRAPH_READING_ESO ? ESO_TABLE_COLUMNS : FULL_TABLE_COLUMNS,
        retrieve: true
    });
    toastr.clear();
    //  Check if dataTable is empty / has error
    setTimeout(() => {
        if ($('#inquiry-missing-information-table').dataTable().fnSettings().aoData.length === 0) {
            alert('Възникна грешка в заявката. Опитай с различни филтри и по възможност по-конкретни.');
        }
    }, 60000);
};

function getURLForAPI() {
    const dataType = missingInfoType.getDataType();
    const readingType = missingInfoType.getReadingType();

    switch (dataType) {
        case dataTypes.HOUR_READING:
            switch (readingType) {
                case readingTypes.HOUR_READING:
                    return `/api/filter/inquiry-missing-information/hour-readings`;
                case readingTypes.STP_HOUR_READING:
                    return `/api/filter/inquiry-missing-information/stp-hour-readings`;
                case readingTypes.HOUR_READING_ESO:
                    return `/api/filter/inquiry-missing-information/eso-readings`;
            }
            case dataTypes.GRAPH:
                switch (readingType) {
                    case readingTypes.GRAPH_READING:
                        return `/api/filter/inquiry-missing-information/graphs`;
                    case readingTypes.STP_GRAPH_READING:
                        return `/api/filter/inquiry-missing-information/stp-graphs`;
                    case readingTypes.GRAPH_READING_ESO:
                        return `/api/filter/inquiry-missing-information/eso-graphs`;
                }
    }
}

function visualizeAllInputFromGetParams() {
    visualizeCheckboxesFromHistoryLocation();
    visualizeInputFromGetParams();
}

function visualizeInputFromGetParams() {
    findGetParameter('fromDate') === null ? '' : $('#fromDate').val(findGetParameter('fromDate'));
    findGetParameter('toDate') === null ? '' : $('#toDate').val(findGetParameter('toDate'));
    findGetParameter('name') === null ? '' : $('#nameOfClient').val(findGetParameter('name'));
    findGetParameter('clientID') === null ? '' : $('#clientID').val(findGetParameter('clientID'));
    findGetParameter('erp') === null ? '' : $('#erp').val(findGetParameter('erp'));
    findGetParameter('profile_name') === null ? '' : $('#profile_name').val(findGetParameter('profile_name'));
}

function visualizeCheckboxesFromHistoryLocation() {
    const location = window.location.href;
    if (!location.includes('energoPRO')) {
        $('#energoPRO').prop('checked', false);
    }
    if (!location.includes('cez')) {
        $('#cez').prop('checked', false);
    }
    if (!location.includes('evn')) {
        $('#evn').prop('checked', false);
    }
    if (location.includes('stp_hour_readings')) {
        $('#stp_hour_readings').prop('checked', true);
    } else if (location.includes('hour_readings_eso')) {
        $('#hour_readings_eso').prop('checked', true);
    } else if (location.includes('hour_readings')) {
        $('#hour_readings').prop('checked', true);
    }
    if (location.includes('data_readings')) {
        $('#data_readings').prop('checked', true);
    } else if (location.includes('data_graphs')) {
        $('#data_graphs').prop('checked', true);
    }
}


function removeClientNameInput() {
    $('body > div.container.mt-3 > div.card.card-default > div.card-body > form > div.row.justify-content-around.my-3 > div:nth-child(1)').css('display', 'none');
}

function removeProfileNameInput() {
    $('body > div.container.mt-3 > div.card.card-default > div.card-body > form > div.row.justify-content-around.my-3 > div:nth-child(3)').css('display', 'none');
}

function removeClientsIdentCodeInput() {
    $('body > div.container.mt-3 > div.card.card-default > div.card-body > form > div.row.justify-content-around.my-3 > div:nth-child(2)').css('display', 'none');
}

function removeESORadioOption() {
    $('body > div.container.mt-3 > div.card.card-default > div.card-body > form > div:nth-child(1) > label:nth-child(7)').css('display', 'none');
}

function showESORadioOption() {
    $('body > div.container.mt-3 > div.card.card-default > div.card-body > form > div:nth-child(1) > label:nth-child(7)').css('display', 'block');
}

function showClientNameInput() {
    $('body > div.container.mt-3 > div.card.card-default > div.card-body > form > div.row.justify-content-around.my-3 > div:nth-child(1)').css('display', 'block');
}

function showERPCheckboxes() {
    $('label.checkbox').css('display', 'flex');
    $('.erp').css('display', 'block');
}

function removeERPCheckboxes() {
    $('label.checkbox').css('display', 'none');
    $('.erp').css('display', 'none');
}

function showProfileNameInput() {
    $('body > div.container.mt-3 > div.card.card-default > div.card-body > form > div.row.justify-content-around.my-3 > div:nth-child(3)').css('display', 'block');
}

function showClientsIdentCodeInput() {
    $('body > div.container.mt-3 > div.card.card-default > div.card-body > form > div.row.justify-content-around.my-3 > div:nth-child(2)').css('display', 'block');
}

function configurateInputsForESOReadings() {
    showClientNameInput();
    removeProfileNameInput();
    showClientsIdentCodeInput();
    showERPCheckboxes();
}

function configurateInputsForESOGraphs() {
    showClientNameInput();
    removeProfileNameInput();
    showClientsIdentCodeInput();
    showERPCheckboxes();
}

function configurateInputsForSTPHourReadings() {
    showClientNameInput();
    showClientsIdentCodeInput();
    showERPCheckboxes();
    showProfileNameInput();
}

function configurateInptusForSTPGraphs() {
    showClientNameInput();
    showClientsIdentCodeInput();
    showERPCheckboxes();
    showProfileNameInput();
}

function configurateInputsForGraphReadings() {
    showClientNameInput();
    showClientsIdentCodeInput();
    showERPCheckboxes();
    removeProfileNameInput();
}

function configurateInputsForHourReadings() {
    showClientNameInput();
    showClientsIdentCodeInput();
    showERPCheckboxes();
    removeProfileNameInput();
}

function makeClientIDRequired() {
    $('#clientID').prop('required', true);
}

function makeClientIDNotRequired() {
    $('#clientID').prop('required', false);
}

function configurateInputs() {
    const dataType = $("input[name='data_type']:checked")[0].value || findGetParameter('data_type');
    const selected = $("input[name='readings']:checked")[0].value || findGetParameter('readings');

    switch (dataType) {
        case 'data_readings':
            missingInfoType.setDataType(dataTypes.HOUR_READING);
            showESORadioOption();
            switch (selected) {
                case 'hour_readings':
                    configurateInputsForHourReadings();
                    missingInfoType.setReadingType(readingTypes.HOUR_READING);
                    break;
                case 'stp_hour_readings':
                    configurateInputsForSTPHourReadings();
                    missingInfoType.setReadingType(readingTypes.STP_HOUR_READING);
                    break;
                case 'hour_readings_eso':
                    configurateInputsForESOReadings();
                    missingInfoType.setReadingType(readingTypes.HOUR_READING_ESO);
                    break;
            }
            break;
        case 'data_graphs':
            missingInfoType.setDataType(dataTypes.GRAPH);
            showERPCheckboxes();
            showClientNameInput();
            showClientsIdentCodeInput();
            switch (selected) {

                case 'hour_readings':
                    configurateInputsForGraphReadings();
                    missingInfoType.setReadingType(readingTypes.GRAPH_READING);
                    break;
                case 'stp_hour_readings':
                    configurateInptusForSTPGraphs();
                    missingInfoType.setReadingType(readingTypes.STP_GRAPH_READING);
                    break;
                case 'hour_readings_eso':
                    configurateInputsForESOGraphs();
                    missingInfoType.setReadingType(readingTypes.GRAPH_READING_ESO);
                    break;
            }
            break;

    }
}

(function addOnClickEventToConfigurateInputs() {
    $('body > div').on('click', () => {
        configurateInputs();
    });
}());

(function filterClientIdentCodesOnInputChange() {
    $('#nameOfClient').on('change', () => {
        const clientName = $('#nameOfClient').val();
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
    $('#idList').remove();
    let identCodesDataListing = $('<datalist id="idList" >');
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
    $('#clientID').append(identCodesDataListing);
}

function getInitialDataListings() {
    const clientNameVal = $('#nameOfClient').val();
    if (clientNameVal) {
        getDataListings();
        getClientIdentCodeListings(clientNameVal);
    } else {
        getDataListings();
    }
}