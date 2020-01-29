$(document).ready(function () {
    let url = `/api/graph-STP/getAllClients`;
    getInitialData(url);
});

function getInitialData(url) {
    $.ajax({
        url,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            visualizeDataTable(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function visualizeDataTable(data) {
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
            .append($('<td>' + data[el]['id'] + '</td>'))
            .append($(`<td><a href=/users/graphs/STP/${data[el]['id']}>${data[el]['ident_code']}</a></td>`))
            .append($('<td>' + data[el]['client_name'] + '</td>'))
            .append($('</tr>'));
        currRow.appendTo($('#tBody'));
    }
    $('#tBody').addClass('text-center');
    $('#clients > thead').addClass('text-center');
    //DESC order 
    dataTable = $('#clients').DataTable({
        "order": [
            [0, "asc"]
        ]
    });
};