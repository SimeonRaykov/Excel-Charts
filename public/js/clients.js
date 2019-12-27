;
$(document).ready(function () {
    let url = location.href;
    let clientNum = url.substring(url.indexOf('?') + 37);
    getReadingData(clientNum);
});

function getReadingData(clientNum) {
    $.ajax({
        url: `http://localhost:3000/getClientDetails/${clientNum}`,
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
    $('body > div > div:nth-child(8) > h1').text(`Клиент: ${data[0]['clients_id']}`)
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
            .append($('<td>' + data[el]['readings_id'] + '</td>'))
            .append($('<td>' + data[el]['period_from'] + '</td>'))
            .append($('<td>' + data[el]['period_to'] + '</td>'))
            .append($('<td>' + (data[el]['value_bgn'] == null ? 'няма стойност' : data[el]['value_bgn']) + '</td>'))
            .append($('<td>' + (data[el]['type'] == 2 ? 'Техническа част' : 'Разпределение') + '</td>'))
            .append($(`<td><a href="/users/reading/${data[el]['readings_id']}"><button type="button" class="btn btn-success" data-id="${data[el]['id']}">Детайли на мерене</button></a></td>`))
            .append($('</tr>'));
        currRow.appendTo($('#tBody'));
    }
    $('#tBody').addClass('text-center');
    $('#clients > thead').addClass('text-center');
    $('#clients').DataTable();
};