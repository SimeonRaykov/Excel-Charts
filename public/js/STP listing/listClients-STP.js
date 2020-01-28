$(document).ready(function () {
    // Type = 2 STP 
    $.ajax({
        url: `/api/getAllClients/2`,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            visualizeDataTable(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
});

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
            .append($(`<td><a href=/users/clients/STP-Details/${data[el]['id']}>${data[el]['ident_code']}</a></td>`))
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

(function addEventListenerToRadioERP() {
    $('input[type=radio]').click(() => {
        let radios = document.getElementsByName('ERP');
        let erpValue;
        for (let i = 0, length = radios.length; i < length; i++) {
            if (radios[i].checked) {
                erpValue = radios[i].value === 'CEZ' ? 2 : radios[i].value === 'EVN' ? 1 : 3;
            }
        }
        if (erpValue != undefined) {
            getFilteredClientsByERP(erpValue);
        }
    })
})();

function getFilteredClientsByERP(erpValue) {
    $.ajax({
        url: `/api/filterSTPClientsByERP/${erpValue}`,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            redrawDataTable(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function redrawDataTable(data) {
    dataTable.clear().destroy();
    visualizeDataTable(data);
}