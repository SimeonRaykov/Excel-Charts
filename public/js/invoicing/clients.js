;
$(document).ready(function () {
    let url = location.href;
    let clientNum = url.substring(url.lastIndexOf('/') + 1);
    getReadingData(clientNum);
});

function getReadingData(clientNum) {
    $.ajax({
        url: `/getClientDetails/${clientNum}`,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            renderDataTable(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
};

function renderDataTable(data) {
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
        const periodFrom = new Date(data[el]['period_from']);
        const periodTo = new Date(data[el]['period_to']);
        const formattedPeriodFrom = `${periodFrom.getFullYear()}-${periodFrom.getMonth()+1<10?`0${periodFrom.getMonth()+1}`:periodFrom.getMonth()+1}-${periodFrom.getDate()<10?`0${periodFrom.getDate()}`:periodFrom.getDate()}`;
        const formattedPeriodTo = `${periodTo.getFullYear()}-${periodTo.getMonth()+1<10?`0${periodTo.getMonth()+1}`:periodTo.getMonth()+1}-${periodTo.getDate()<10?`0${periodTo.getDate()}`:periodTo.getDate()}`;
        currRow
            .append($('<td>' + data[el]['reading_id'] + '</td>'))
            .append($('<td>' + formattedPeriodFrom + '</td>'))
            .append($('<td>' + formattedPeriodTo + '</td>'))
            .append($('<td>' + (data[el]['time_zone']) + '</td>'))
            .append($('<td>' + (data[el]['value_bgn'] == 0 ? '' : `${data[el]['value_bgn']} лв.`) + ' </td>'))
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