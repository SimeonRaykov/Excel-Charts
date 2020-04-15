;
$(document).ready(function () {
    visualizeAllInputFromGetParams();
    getDataListing();
    listProfiles();
});

function getDataListing() {
    $.ajax({
        url: '/api/data-listings/STP-Hour-Readings',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            convertDataToSet(data);
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
    let clientIds = arr[1]

    for (let name of clientNames) {
        $('#stp-hour-readings-clients').append(`<option value="${name}"></option>`);
    }

    for (let ID of clientIds) {
        $('#idList').append(`<option value="${ID}"></option>`);
    }
}

$('#searchBtn').on('click', (event) => {
    event.preventDefault();
    dataTable.clear().destroy();
    let nameOfProfile = $('#name').val();
    let erp = $('#erp').val();
    listProfiles([nameOfProfile, clientID, erp]);
});

function listProfiles(arr) {
    if (!arr) {
        var name = findGetParameter('name');
        var erp = []
        if (window.location.href.includes('energoPRO')) {
            erp.push(3);
        }
        if (window.location.href.includes('cez')) {
            erp.push(2);
        }
        if (window.location.href.includes('evn')) {
            erp.push(1);
        }

    } else {
        var [
            name,
            erp
        ] = arr;
    }
    notification('Loading...', 'loading');
    dataTable = $('#profiles-table').DataTable({
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
            url: "/api/filter/profiles/",
            data: {
                name,
                erp
            },
            type: 'POST',
        },
        columns: [{
                data: "id",
                render: function (data, type, row) {
                    const date = row['date'];
                    const fullDate = new Date(date);
                    const fixedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1}-${fullDate.getDate()}`;
                    return `<td><a href=/users/profiles/${row['id']}>${row['id']}</td>`
                }
            }, {
                data: "profile_name",
                render: function (data, type, row) {
                    return '<td>' + row['profile_name'] + '</td>';
                },
            },
            {
                data: "type",
                render: function (data, type, row) {
                    const erpType = row['type'] == 1 ? 'EVN' : row['type'] == 2 ? 'ЧЕЗ' : 'ЕнергоПРО';
                    return '<td>' + erpType + '</td>';
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
    findGetParameter('name') === null ? '' : $('#nameOfClient').val(findGetParameter('name'));
    findGetParameter('clientID') === null ? '' : $('#clientID').val(findGetParameter('clientID'));
    findGetParameter('erp') === null ? '' : $('#erp').val(findGetParameter('erp'));
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
}