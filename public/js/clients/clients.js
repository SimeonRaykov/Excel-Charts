$(document).ready(function () {
    // Type = 2 STP 
    const meteringType = 'all';
    let url = `/api/getAllClients`;

    // User friendly get params
    if (findGetParameter('erpType') || findGetParameter('meteringType')) {
        let meteringType = findGetParameter('meteringType')
        let erpType = findGetParameter('erpType');
        if (erpType == '' || meteringType == '') {
            erpType = 0;
            url = `/api/filterClients/0/0`
            if (erpType == '') {
                disableAllERPCheckbox();
            }
            if (meteringType == '') {
                disableMeteringTypeCheckbox();
            }
        } else {
            if (meteringType == 1 || meteringType == 2) {
                url = `/api/filterClients/${erpType}/${meteringType}`
                if (meteringType == 1) {
                    disableSTPCheckbox();
                } else if (meteringType == 2) {
                    disableHourlyCheckbox();
                }
            }
            if (!erpType.includes('1')) {
                disableEVNCheckBox();
            }
            if (!erpType.includes('2')) {
                disableCEZCheckbox();
            }
            if (!erpType.includes('3')) {
                disableEnergoPROCheckbox();
            }
        }
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
        const erpType = data[el]['erp_type'];
        currRow
            .append($('<td>' + data[el]['id'] + '</td>'))
            .append($(`<td><a href=/users/clients/info/${data[el]['id']}>${data[el]['ident_code']}</a></td>`))
            .append($('<td>' + data[el]['client_name'] + '</td>'))
            .append($('<td>' + (erpType === 1 ? 'ИВН' : erpType === 2 ? 'ЧЕЗ' : 'EнергоПРО') + '</td>'))
            .append($('<td>' + (meteringType === 2 ? 'СТП' : 'По часови') + '</td>'))
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

(function addEventListenerToCheckboxes() {
    $('input[type=checkbox]').click(() => {
        const checkboxesMeteringType = document.getElementsByName('metering_type');
        const checkboxesERPType = document.getElementsByName('erp_type');
        let meteringValue = [];
        let erpTypeValue = [];
        for (let i = 0, length = checkboxesMeteringType.length; i < length; i++) {
            if (checkboxesMeteringType[i].checked) {
                meteringValue.push(checkboxesMeteringType[i].value === 'stp' ? 2 : 1);
            }
        }
        for (let i = 0, length = checkboxesERPType.length; i < length; i++) {
            if (checkboxesERPType[i].checked) {
                erpTypeValue.push(checkboxesERPType[i].value === 'evn' ? 1 : checkboxesERPType[i].value === 'cez' ? 2 : 3);
            }
        }
        window.history.replaceState(null, null, `clients?erpType=${erpTypeValue}&meteringType=${meteringValue}`)
        filterClients(erpTypeValue, meteringValue);
    })
})();

function filterClients(erpValue, meteringValue) {
    if (meteringValue == 0 || erpValue == 0) {
        erpValue = 0;
        meteringValue = 0;
    }
    if (erpValue.length === 3) {
        erpValue = 'all';
    } else if (erpValue.length === 0) {
        meteringValue = 0;
    }
    if (meteringValue.length === 2) {
        meteringValue = 'all';
    }
    let url = `/api/filterClients/${erpValue}/${meteringValue}`;

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

function findGetParameter(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function disableAllERPCheckbox() {
    disableEVNCheckBox();
    disableCEZCheckbox();
    disableEnergoPROCheckbox();
}

function disableMeteringTypeCheckbox() {
    disableSTPCheckbox();
    disableHourlyCheckbox();
}

function disableEVNCheckBox() {
    $('#evn').prop('checked', false);
}

function disableCEZCheckbox() {
    $('#cez').prop('checked', false);
}

function disableEnergoPROCheckbox() {
    $('#energoPRO').prop('checked', false);
}

function disableSTPCheckbox() {
    $('#stp').prop('checked', false);
}

function disableHourlyCheckbox() {
    $('#hourly').prop('checked', false);
}