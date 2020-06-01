;
$(document).ready(function () {
    visualizeAllInputFromGetParams();
    getInitialDataListings();
    listESOHourReadings();
});

function getInitialDataListings() {
    const clientNameVal = $('#client_name').val();
    if (clientNameVal) {
        getDataListings();
        getClientIdentCodeListings(clientNameVal);
    } else {
        getDataListings();
    }
}

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

$('#searchBtn').on('click', (event) => {
    event.preventDefault();
    dataTable.clear().destroy();
    const fromDate = $('#fromDate').val();
    const toDate = $('#toDate').val();
    let type = [];
    if ($('#used_energy').is(':checked')) {
        type.push(1);
    }
    if ($('#produced_energy').is(':checked')) {
        type.push(2);
    }
    listESOHourReadings([fromDate, toDate, type]);
});

function listESOHourReadings(arr) {
    if (!arr) {
        var fromDate = findGetParameter('fromDate');
        var toDate = findGetParameter('toDate');
        var client_name = findGetParameter('client_name');
        var ident_code = findGetParameter('ident_code');
        var type = []
        if (window.location.href.includes('used-energy')) {
            type.push(1);
        }
        if (window.location.href.includes('produced-energy')) {
            type.push(2);
        }

    } else {
        var [
            fromDate,
            toDate,
            type
        ] = arr;
    }
    notification('Loading...', 'loading');
    dataTable = $('#eso-hour-readings-table').DataTable({
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
            url: "/api/filter/eso-hour-readings",
            data: {
                fromDate,
                toDate,
                type,
                client_name,
                ident_code
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
            },
            {
                data: "ident_code",
                render: function (data, type, row) {
                    const readingType = 'hour-reading';
                    const date = row['date'];
                    const fullDate = new Date(date);
                    const formattedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1<10?`0${fullDate.getMonth()+1}`:fullDate.getMonth()+1}-${fullDate.getDate()<10?`0${fullDate.getDate()}`:fullDate.getDate()}`;
                    return `<a href="/users/clients-eso/info/${row['cId']}?date=${formattedDate}&type=${readingType}">${row['ident_code']}</a>`;
                },
            }, {
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

function visualizeAllInputFromGetParams() {
    visualizeCheckboxesFromHistoryLocation();
    visualizeInputFromGetParams();
}

function visualizeInputFromGetParams() {
    findGetParameter('fromDate') === null ? '' : $('#fromDate').val(findGetParameter('fromDate'));
    findGetParameter('toDate') === null ? '' : $('#toDate').val(findGetParameter('toDate'));
    findGetParameter('client_name') === null ? '' : $('#client_name').val(findGetParameter('client_name'));
    findGetParameter('ident_code') === null ? '' : $('#ident_code').val(findGetParameter('ident_code'));
}

function visualizeCheckboxesFromHistoryLocation() {
    const location = window.location.href;
    if (!location.includes('used-energy')) {
        $('#used-energy').prop('checked', false);
    }
    if (!location.includes('produced-energy')) {
        $('#produced-energy').prop('checked', false);
    }
}