;

function getAllListings(data) {
    let i = 0;
    for (let el in data) {

        let currRow = $('<tr>').attr('role', 'row');
        if (i % 2 == 1) {
            currRow.addClass('even');
        } else {
            currRow.addClass('odd');
        }
        i += 1;
        currRow
            .append($('<td>' + data[el]['client_number'] + '</td>'))
            .append($(`<td><a href=clients/${data[el]['clients_id']}>${data[el]['ident_code']}</a></td>`))
            .append($('<td>' + getJsDate(data[el]['period_from']) + '</td>'))
            .append($('<td>' + getJsDate(data[el]['period_to']) + '</td>'))
            .append($('<td>' + (data[el]['value_bgn'] == 0 ? 'няма стойност' : `${data[el]['value_bgn']} лв`) + '</td>'))
            .append($('<td>' + (data[el]['type'] == 1 ? 'Техническа част' : 'Разпределение') + '</td>'))
            .append($(`<td><a href="reading/${data[el]['reading_id']}"><button type="button" class="btn btn-success" data-id="${data[el]['reading_id']}">Детайли на мерене</button></a></td>`))
            .append($('</tr>'));
        currRow.appendTo($('#tBody'));
    }
    dataTable = $('#list-readings').DataTable({
        retrieve: true
    });
    $('#tBody').addClass('text-center');
    $('#list-readings > thead').addClass('text-center');

}

function callback(data) {
    getAllListings(data);
}

$(document).ready(function () {
    let fromDate = $('body > div > div.mb-3 > input[type=search]:nth-child(1)').val();
    let toDate = $('body > div > div.mb-3 > input[type=search]:nth-child(2)').val();
    listAllReadings(fromDate, toDate);
});

$('body > div > form > div > button').on('click', (event) => {
    event.preventDefault();
    let drawTable = $("#list-readings").on("draw.dt", function () {
        $(this).find(".dataTables_empty").parents('tbody').empty();
    }).DataTable();
    let fromDate = $('body > div > form > div > input:nth-child(1)').val();
    let toDate = $('body > div > form > div > input:nth-child(2)').val();
    $('#list-readings').DataTable().clear().draw();

    listAllReadings(fromDate, toDate);

});

function listAllReadings(fromDate, toDate) {
    let url = 'http://localhost:3000/listReadings';
    fromDate == '' ? fromDate = null : fromDate;
    toDate == '' ? toDate = null : toDate;
    if (fromDate != null || toDate != null) {
        url = `http://localhost:3000/listReadings/${fromDate}/${toDate}`
    }
    $.ajax({
        url,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            callback(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });

};

function getJsDate(isoFormatDateString) {
    let dateParts = isoFormatDateString.split("-");
    let days = Number(dateParts[2].substr(0, 2)) + 1
    let months = dateParts[1];
    if (days == 32) {
        dateParts[1] += 1;
        days -= 31;
        months = Number(months) + 1;
    };
    let jsDate = `${dateParts[0]}-${months}-${days}`;

    return jsDate;
}