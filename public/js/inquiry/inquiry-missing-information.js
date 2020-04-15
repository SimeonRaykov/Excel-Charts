;
$(document).ready(function () {
    visualizeAllInputFromGetParams();
    configureStartInputs();
    renderTableHeadings();
    getDataListing();
    getReadings();
});

function renderTableHeadings() {
    const type = missingInfoType.getMeteringType();
    let tHeadSettings = '';

    if (type === informationTypes.HOUR_READINGS_ESO) {
        tHeadSettings = $(`<th>ID на мерене</th><th> Дата на мерене </th> <th> Енергия </th>`);
    } else {
        tHeadSettings = $(`<th>ID на мерене</th>
      <th>Идентификационен код на клиент</th>
      <th>Име на клиент</th>
      <th>Дата на мерене</th>
      <th>ЕРП</th>`);
    }
    $('#inquiry-missing-information-table > thead > tr').append(tHeadSettings);
}

const informationTypes = {
    STP_HOUR_READINGS: 'stp_hour_readings',
    HOUR_READINGS: 'hour_readings',
    STP_GRAPH_READINGS: 'stp_graph_readings',
    GRAPH_READINGS: 'graph_readings',
    HOUR_READINGS_ESO: 'hour_readings_eso'
}

class MissingInfoType {
    constructor() {
        this.meteringType = '';
    }
    getMeteringType() {
        return this.meteringType;
    }
    setMeteringType(meteringType) {
        return this.meteringType = meteringType;
    }
}

missingInfoType = new MissingInfoType();

function getDataListing() {
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
        url: '/api/data-listings/profile-name',
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

$('#searchBtn').on('click', (event) => {
    event.preventDefault();
    dataTable.clear().destroy();
    let fromDate = $('#fromDate').val();
    let toDate = $('#toDate').val();
    let nameOfClient = $('#name').val();
    let clientID = $('#clientID').val();
    let profileName = $('#profile_name').val();
    getReadings([fromDate, toDate, nameOfClient, clientID, profileName]);
});

function getReadings(arr) {
    if (!arr) {
        var name = findGetParameter('name');
        var fromDate = findGetParameter('fromDate');
        var toDate = findGetParameter('toDate');
        var clientID = findGetParameter('clientID');
        var profile_name = findGetParameter('profile_name');
        var erp = []
        var metering_type = findGetParameter('readings');
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
            metering_type = 'stp_hour_readings';
        }

    } else {
        var [
            fromDate,
            toDate,
            name,
            clientID,
            erp,
            metering_type,
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

    const url = getURLForAPI();
    console.log(url);
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
            },
            type: 'POST',
        },
        columns: [{
                data: "id",
                render: function (data, type, row) {
                    const date = row['date'];
                    const fullDate = new Date(date);
                    const fixedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1}-${fullDate.getDate()}`;
                    return `<td><a href=/users/eso-hour-readings/daily/s?id=${row['id']}&date=${fixedDate}>${row['id']}</td>`
                }
            }, {
                data: "date",
                render: function (data, type, row) {
                    const date = row['date'];
                    const fullDate = new Date(date);
                    const formattedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1<10?`0${fullDate.getMonth()+1}`:fullDate.getMonth()+1}-${fullDate.getDate()<10?`0${fullDate.getDate()}`:fullDate.getDate()}`;
                    const fixedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1}-${fullDate.getDate()}`;
                    return '<td>' + fixedDate + '</td>'
                },
            },
            {
                data: "type",
                render: function (data, type, row) {
                    const energyType = row['type'] == 1 ? 'Потребена' : 'Произведена';
                    return '<td>' + energyType + '</td>';
                }
            },
        ],
        retrieve: true
    });
    toastr.clear();
};

function getURLForAPI() {
    const meteringType = missingInfoType.getMeteringType();
    console.log(meteringType)
    switch (meteringType) {
        case informationTypes.HOUR_READINGS_ESO:
            return `/api/filter/inquiry-missing-information/eso`;
            break;
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
}

function removeClientNameInput() {
    $('body > div.container.mt-3 > div.card.card-default > div.card-body > form > div:nth-child(1) > div:nth-child(3)').css('display', 'none');
}

function removeProfileNameInput() {
    $('body > div.container.mt-3 > div.card.card-default > div.card-body > form > div:nth-child(3) > div').css('display', 'none');
}

function removeClientsIdentCodeInput() {
    $('body > div.container.mt-3 > div.card.card-default > div.card-body > form > div.row.my-3.justify-content-around > div').css('display', 'none');
}

function showClientNameInput() {
    $('body > div.container.mt-3 > div.card.card-default > div.card-body > form > div:nth-child(1) > div:nth-child(3)').css('display', 'block');
}

function showProfileNameInput() {
    $('body > div.container.mt-3 > div.card.card-default > div.card-body > form > div:nth-child(3) > div').css('display', 'block');
}

function showClientsIdentCodeInput() {
    $('body > div.container.mt-3 > div.card.card-default > div.card-body > form > div.row.my-3.justify-content-around > div').css('display', 'block');
}

function configurateInputsForESO() {
    removeClientNameInput();
    removeProfileNameInput();
    removeClientsIdentCodeInput();
}

function configurateInputsForSTP() {
    showClientNameInput();
    showProfileNameInput();
    showClientsIdentCodeInput();
}

function configurateInputsForHourReadings() {
    showClientNameInput();
    showClientsIdentCodeInput();
    removeProfileNameInput();
}

function configureStartInputs() {
    const selected = $("input[name='readings']:checked")[0].value || findGetParameter('readings');
    switch (selected) {
        case 'hour_readings_eso':
            configurateInputsForESO();
            missingInfoType.setMeteringType(informationTypes.HOUR_READINGS_ESO);
            break;
        case 'hour_readings':
            configurateInputsForHourReadings();
            missingInfoType.setMeteringType('hour-readings-eso');
            break;
        case 'stp_hour_readings':
            configurateInputsForSTP();
            break;
    }
}

(function addOnClickEventToConfigurateInputs() {
    $('body > div.container.mt-3 > div.card.card-default > div.card-body > form > div:nth-child(3)').on('click', () => {
        configureStartInputs();
    });
}());