$(document).ready(function () {
    // Type = 2 STP 
    const meteringType = 'all';
    let url = `/api/getAllClients`;

    // User friendly get params
    if (location.search.match('ERP')) {
        let erpValue = location.search.match('ERP').input.substr(6);
        url = `/api/filterSTPClientsByERP/${erpValue}`
    }
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
    console.log(data);
    let i = 0;
    for (let el in data) {
        let currRow = $('<tr>').attr('role', 'row');
        if (i % 2 == 1) {
            currRow.addClass('even');
        } else {
            currRow.addClass('odd');
        }
        i += 1;
        const meteringType = data[el]['metering_type'];
        currRow
            .append($('<td>' + data[el]['id'] + '</td>'))
            .append($(`<td><a href=/users/clients/STP-Details/${data[el]['id']}>${data[el]['ident_code']}</a></td>`))
            .append($('<td>' + data[el]['client_name'] + '</td>'))
            .append($('<td>' + (meteringType === 1 ? 'СТП' : 'По часови') + '</td>'))
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
    $('input[type=checkbox]').click(() => {
        const checkboxes = document.getElementsByName('metering_type');
        let meteringValue = [];
        for (let i = 0, length = checkboxes.length; i < length; i++) {
            if (checkboxes[i].checked) {
                meteringValue.push(checkboxes[i].value === 'stp' ? 2 : 1);
            }
        }
        window.history.replaceState(null, null, `listClients-STP?&ERP=${meteringValue}`)
        if (meteringValue != undefined) {
            filterClientsByMeteringType(meteringValue);
        }
    })
})();

function filterClientsByMeteringType(erpValue) {
    let url = `/api/filterClientsByMeteringType/${erpValue[0]}`;
    if (erpValue.length === 2) {
        url = `/api/getAllClients`;
    } else if (erpValue.length === 0) {
        url = `/api/filterClientsByMeteringType/3`;
    }
    $.ajax({
        url,
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