;
$(document).ready(function () {
    listAllReadings();
});

function listAllReadings() {

    $.ajax({
        url: 'http://localhost:3000/listReadings',
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

function callback(data) {
    getAllListings(data);
}

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
            .append($(`<td><a href=clients/${data[el]['ident_code']}>${data[el]['ident_code']}</a></td>`))
            .append($('<td>' + data[el]['period_from'] + '</td>'))
            .append($('<td>' + data[el]['period_to'] + '</td>'))
            .append($('<td>' + (data[el]['value_bgn'] == null ? 'няма стойност' : `${data[el]['value_bgn']} лв`) + '</td>'))
            .append($('<td>' + (data[el]['type'] == 2 ? 'Техническа част' : 'Разпределение') + '</td>'))
            .append($(`<td><a href="reading/${data[el]['id']}"><button type="button" class="btn btn-success" data-id="${data[el]['id']}">Детайли на мерене</button></a></td>`))
            .append($('</tr>'));
        currRow.appendTo($('#tBody'));
    }
    $('#tBody').addClass('text-center');
    $('#list-readings > thead').addClass('text-center');
    $('#list-readings').DataTable();
}