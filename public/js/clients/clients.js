$(document).ready(function () {
    setSavedInputs();
    addEventListenerToCheckboxes()
    processInitialData();
    getInitialDataListings();
});

function setSavedInputs() {
    try {
        const dataTableSearchName = JSON.parse(localStorage.getItem('DataTables_clients_/users/clients')).columns[2].search.search;
        const dataTableSearchIdentCode = JSON.parse(localStorage.getItem('DataTables_clients_/users/clients')).columns[1].search.search;
        if (dataTableSearchName) {
            $('#client_name').val(dataTableSearchName);
        }
        if (dataTableSearchIdentCode) {
            $('#ident_code').val(dataTableSearchIdentCode);
        }
    } catch (e) {
        console.log(e);
    }
}

function processInitialData() {
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
}

(function filterClientsByName() {
    $('#client_name').on('change', () => {
        const clientNameVal = $('#client_name').val();
        const table = $('#clients').DataTable();
        table.column(2).search(clientNameVal).draw();
    })
}());

(function filterClientsByIdentCode() {
    $('#ident_code').on('change', () => {
        const identCodeVal = $('#ident_code').val();
        const table = $('#clients').DataTable();
        table.column(1).search(identCodeVal).draw();
    })
}());

function getDataListings() {
    $.ajax({
        url: '/api/data-listings/all-clients',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            visualizeDataListings(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function getClientIdentCodeListings(clientName) {
    $.ajax({
        url: `/api/data-listings/ident-codes/${clientName}`,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            visualizeClientIdentCodes(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            getDataListings();
            console.log(errorThrown);
        }
    });
}

function visualizeClientIdentCodes(data) {
    $('#ident_codes').remove();
    let identCodesDataListing = $('<datalist id="ident_codes" >');
    let identCodes = [];
    for (let obj of data) {
        identCodes.push(obj.ident_code);
    }
    const filteredIdentCodes = identCodes.filter((v, i, a) => a.indexOf(v) === i);

    for (let identCode of filteredIdentCodes) {
        let currIdentCode = $(`<option>${identCode}</option>`);
        currIdentCode.appendTo(identCodesDataListing);
    }
    identCodesDataListing.append('</datalist>');
    $('#ident_code').append(identCodesDataListing);
}

function visualizeDataListings(data) {
    $('#client_names').remove();
    $('#ident_codes').remove();
    let namesDataListing = $('<datalist id="client_names" >');
    let identCodesDataListing = $('<datalist id="ident_codes" >');
    let clNames = [];
    let identCodes = [];
    for (let obj of data) {
        clNames.push(obj.client_name);
        identCodes.push(obj.ident_code);
    }
    const filteredNames = clNames.filter((v, i, a) => a.indexOf(v) === i);
    const filteredIdentCodes = identCodes.filter((v, i, a) => a.indexOf(v) === i);

    for (let name of filteredNames) {
        let currName = $(`<option>${name}</option>`);
        currName.appendTo(namesDataListing);
    }

    for (let identCode of filteredIdentCodes) {
        let currIdentCode = $(`<option>${identCode}</option>`);
        currIdentCode.appendTo(identCodesDataListing);
    }
    namesDataListing.append('</datalist>');
    identCodesDataListing.append('</datalist>');
    $('#client_name').append(namesDataListing);
    $('#ident_code').append(identCodesDataListing);
}

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
            .append($('<td>' + (erpType === 1 ? 'EVN' : erpType === 2 ? 'ЧЕЗ' : 'EнергоПРО') + '</td>'))
            .append($('<td>' + (meteringType === 2 ? 'СТП' : 'Почасови') + '</td>'))
            .append($('</tr>'));
        currRow.appendTo($('#tBody'));
    }
    $('#tBody').addClass('text-center');
    $('#clients > thead').addClass('text-center');
    //DESC order 
    dataTable = $('#clients').DataTable({
        stateSave: true,
        "order": [
            [0, "asc"]
        ]
    });
};

function addEventListenerToCheckboxes() {
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
};

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

(function filterClientIdentCodesOnInputChange() {
    $('#client_name').on('change', () => {
        const clientName = $('#client_name').val();
        getClientIdentCodeListings(clientName);
    });
}());

function getInitialDataListings() {
    const clientNameVal = $('#client_name').val();
    if (clientNameVal) {
        getDataListings();
        getClientIdentCodeListings(clientNameVal);
    } else {
        getDataListings();
    }
}