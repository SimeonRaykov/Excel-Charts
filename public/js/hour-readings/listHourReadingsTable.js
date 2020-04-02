;
$(document).ready(function () {
    visualizeAllInputFromGetParams();
    getDataListing();
    listAllHourReadings();
});

function getAllHourListings(data) {
    const readingType = 'hour-reading';
    /*  let i = 0;
     for (let el in data) {
         const date = data[el]['date'];
         const fullDate = new Date(date);
         const fixedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1}-${fullDate.getDate()}`;
         const formattedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1<10?`0${fullDate.getMonth()+1}`:fullDate.getMonth()+1}-${fullDate.getDate()<10?`0${fullDate.getDate()}`:fullDate.getDate()}`;
         const erpType = data[el]['erp_type'] == 1 ? 'ИВН' : data[el]['erp_type'] == 2 ? 'ЧЕЗ' : 'ЕнергоПРО';
         const amount = data[el]['amount'];
         let currRow = $('<tr>').attr('role', 'row');
         if (i % 2 == 1) {
             currRow.addClass('even');
         } else {
             currRow.addClass('odd');
         }
         i += 1;
         currRow
             .append(`<td><a href=/users/clients/hour-reading/daily/s?id=${data[el]['id']}&date=${fixedDate}>${data[el]['id']}</td>`)
             .append($(`<td><a href=/users/clients/info/${data[el]['cId']}?date=${formattedDate}&type=${readingType}>${data[el]['ident_code']}</a></td>`))
             .append($('<td>' + data[el]['client_name'] + '</td>'))
             .append($('<td>' + fixedDate + '</td>'))
             .append($('<td>' + erpType + '</td>'))
             .append($('<td>' + amount + '</td>'))
             .append($('</tr>'));
         currRow.appendTo($('#tBody')); */
}
// Order DESC

/*    $('#tBody').addClass('text-center');
   $('#list-readings > thead').addClass('text-center'); */


function getDataListing() {
    $.ajax({
        url: '/api/data-listings/hour-readings',
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
        $('#hour-readings-clients').append(`<option value="${name}">`);
    }

    for (let ID of clientIds) {
        $('#idList').append(`<option value="${ID}">`);
    }
}

$('#searchBtn').on('click', (event) => {
    event.preventDefault();
    dataTable.clear().destroy();
    dataTable;
    let fromDate = $('#fromDate').val();
    let toDate = $('#toDate').val();
    let nameOfClient = $('#name').val();
    let clientID = $('#clientID').val();
    let erp = $('#erp').val();
    listAllHourReadings([fromDate, toDate, nameOfClient, clientID, erp]);
});

function listAllHourReadings(arr) {
    if (!arr) {
        var name = findGetParameter('name');
        var fromDate = findGetParameter('fromDate');
        var toDate = findGetParameter('toDate');
        var clientID = findGetParameter('clientID');
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
            fromDate,
            toDate,
            name,
            clientID,
            erp
        ] = arr;
    }

    notification('Loading...', 'loading');
    dataTable = $('#hour-readings-table').DataTable({
        destroy: false,
        "paging": true,
        stateSave: true,
        sAjaxDataProp: 'data',
        "order": [
            [0, "asc"]
        ],
        "processing": true,
        "serverSide": true,
        "columnDefs": [
            {"className": "dt-center", "targets": "_all"}
          ],
        ajax: {
            dataFilter: function (data) {
                var json = jQuery.parseJSON(data);
                json.recordsTotal = json.total;
                json.recordsFiltered = json.total;
                json.data = json.list;

                return JSON.stringify(json); // return JSON string
            },
            url: "/api/filter/getAllHourReadingsTable",
            data: {
                fromDate,
                toDate,
                name,
                ident_code: clientID,
                erp
            },
            dataSrc: "",
            type: 'POST',
        },
        columns: [{
                data: "id",
                render: function (data, type, row) {
                    const date = row['date'];
                    const fullDate = new Date(date);
                    const fixedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1}-${fullDate.getDate()}`;
                    return `<td><a href=/users/clients/hour-reading/daily/s?id=${row['id']}&date=${fixedDate}>${row['id']}</td>`
                }
            },
            {
                data: "ident_code",
                render: function (data, type, row) {
                    const readingType = 'hour-reading';
                    const date = row['date'];
                    const fullDate = new Date(date);
                    const formattedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1<10?`0${fullDate.getMonth()+1}`:fullDate.getMonth()+1}-${fullDate.getDate()<10?`0${fullDate.getDate()}`:fullDate.getDate()}`;

                    return `<td><a href=/users/clients/info/${row['cId']}?date=${formattedDate}&type=${readingType}>${row['ident_code']}</a></td>`;
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
                    const fixedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1}-${fullDate.getDate()}`;
                    return '<td>' + fixedDate + '</td>'
                },
            },
            {
                data: "erp_type",
                render: function (data, type, row) {
                    const erpType = row['erp_type'] == 1 ? 'ИВН' : row['erp_type'] == 2 ? 'ЧЕЗ' : 'ЕнергоПРО';
                    return '<td>' + erpType + '</td>';
                }
            },
            {
                data: "amount"
            },
        ],
        retrieve: true
    });
    toastr.clear();
    /* $.ajax({
        url: `/api/filter/getAllHourReadingsTable`,
        method: 'POST',
        data: {
            fromDate,
            toDate,
            name,
            ident_code: clientID,
            erp
        },
        dataType: 'json',
        success: function (data) {
            getAllHourListings(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    toastr.clear(); */
};

function getThisAndLastMonthDates() {
    let today = new Date();
    let thisMonthDate = `${today.getFullYear()}-${Number(today.getMonth())+1}-${today.getDay()}`;
    let lastMonthDate = `${today.getFullYear()}-${Number(today.getMonth())}-${today.getDay()}`;
    if (Number(today.getMonth()) - 1 === -1) {
        lastMonthDate = `${Number(today.getFullYear())-1}-${Number(today.getMonth())+12}-${today.getDay()}`;
    }
    return [thisMonthDate, lastMonthDate];
}

function removeDuplicatesFromArr(arr) {
    let uniqueNames = [];
    $.each(arr, function (i, el) {
        if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
    });
    return uniqueNames;
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