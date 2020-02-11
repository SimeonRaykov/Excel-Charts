;
$(document).ready(function () {
    console.log('CliENTS')
    let url = location.href;
    let clientNum = url.substring(url.lastIndexOf('/') + 1);
    console.log(clientNum);
    getReadingData(clientNum);
});

function getReadingData(clientNum) {
    $.ajax({
        url: `/getClientDetails/${clientNum}`,
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
    $('body > div > div:nth-child(8) > h1').text(`Клиент: ${data[0]['client_name']}`)
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
            .append($('<td>' + data[el]['reading_id'] + '</td>'))
            .append($('<td>' + getJsDate(data[el]['period_from']) + '</td>'))
            .append($('<td>' + getJsDate(data[el]['period_to']) + '</td>'))
            .append($('<td>' + (data[el]['time_zone']) + '</td>'))
            .append($('<td>' + (data[el]['value_bgn'] == 0 ? 'няма стойност' : `${data[el]['value_bgn']} лв.`) + ' </td>'))
            .append($('<td>' + (data[el]['type'] == 1 ? 'Техническа част' : 'Разпределение') + '</td>'))
            .append($('<td>' + (data[el]['operator'] == 2 ? 'ЧЕЗ' : data[el]['operator'] == 1 ? 'EVN' : 'EnergoPRO') + '</td>'))
            .append($(`<td><a href="/users/reading/${data[el]['reading_id']}"><button type="button" class="btn btn-success" data-id="${data[el]['reading_id']}">Детайли на мерене</button></a></td>`))
            .append($('</tr>'));
        currRow.appendTo($('#tBody'));
    }
    $('#tBody').addClass('text-center');
    $('#clients > thead').addClass('text-center');
    //DESC order 
    $('#clients').DataTable({
        "order": [
            [0, "desc"]
        ]
    });
};

function getJsDate(isoFormatDateString) {
    let dateParts = isoFormatDateString.split("-");
    let jsDate = `${dateParts[0]}-${dateParts[1] - 1}-${dateParts[2].substr(0,2)}`;
    return jsDate;
}