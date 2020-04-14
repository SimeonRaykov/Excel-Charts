;
$(document).ready(function () {
    visualizeAllInputFromGetParams();
    listESOHourReadings();
});

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
                type
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

function visualizeAllInputFromGetParams() {
    visualizeCheckboxesFromHistoryLocation();
    visualizeInputFromGetParams();
}

function visualizeInputFromGetParams() {
    findGetParameter('fromDate') === null ? '' : $('#fromDate').val(findGetParameter('fromDate'));
    findGetParameter('toDate') === null ? '' : $('#toDate').val(findGetParameter('toDate'));
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