;

function getAllHourListings(data) {
    let i = 0;
    for (let el in data) {
        let date = data[el]['date'];
        let fullDate = new Date(date);
        let fixedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1}-${fullDate.getDate()}`;

        let currRow = $('<tr>').attr('role', 'row');
        if (i % 2 == 1) {
            currRow.addClass('even');
        } else {
            currRow.addClass('odd');
        }
        i += 1;
        currRow
            .append(`<td><a href=/users/clients/hour-reading/daily/s?id=${data[el]['id']}&date=${fixedDate}>${data[el]['id']}</td>`)
            .append($(`<td><a href=/users/clients/hour-reading/${data[el]['cId']}>${data[el]['ident_code']}</a></td>`))
            .append($('<td>' + data[el]['client_name'] + '</td>'))
            .append($('<td>' + fixedDate + '</td>'))
            .append($('<td>' + fixedDate + '</td>'))
            .append($('</tr>'));
        currRow.appendTo($('#tBody'));
    }
    // Order DESC
    dataTable = $('#hour-readings-table').DataTable({
        "order": [
            [0, "asc"]
        ],
        retrieve: true
    });
    $('#tBody').addClass('text-center');
    $('#list-readings > thead').addClass('text-center');

}

function callback(data) {
    getAllHourListings(data);
}

$(document).ready(function () {
    getDataListing();
    findGetParameter('date') === null ? '' : $('#date').val(findGetParameter('date'));
    findGetParameter('name') === null ? '' : $('#name').val(findGetParameter('name'));
    findGetParameter('clientID') === null ? '' : $('#clientID').val(findGetParameter('clientID'));
    listAllHourReadings();
});

function getDataListing() {
    $.ajax({
        url: 'http://localhost:3000/getAllClientIDs&Names',
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

    //  VisualiseDataListings([uniqueClientNames, clientIDs]);
}

function VisualiseDataListings(arr) {
    let clientNames = arr[0];
    let clientIds = arr[1]

    for (let name of clientNames) {
        $('#names').append(`<option value=${name}>`);
    }

    for (let ID of clientIds) {
        $('#idList').append(`<option value="${ID}">`);
    }
}

$('#searchBtn').on('click', (event) => {
    event.preventDefault();
    dataTable.clear().destroy();
    dataTable;
    let date = $('#date').val();
    let nameOfClient = $('#name').val();
    let clientID = $('#clientID').val();
    listAllHourReadings([date, nameOfClient, clientID]);
});

function listAllHourReadings(arr) {
    if (!arr) {
        var name = findGetParameter('name');
        var date = findGetParameter('date');
        var clientID = findGetParameter('clientID');
    } else {
        var [
            date,
            name,
            clientID
        ] = arr;
    }
    notification('Loading...', 'loading');
    $.ajax({
        url: `http://localhost:3000/api/filter/getAllHourReadingsTable`,
        method: 'POST',
        data: {
            date,
            name,
            ident_code: clientID
        },
        dataType: 'json',
        success: function (data) {
            callback(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    toastr.clear();
};

function findGetParameter(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

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