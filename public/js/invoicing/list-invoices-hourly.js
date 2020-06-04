;
$(document).ready(function () {
    visualizeHistoryParams();
    getInitialDataListings();
    getInvoicesHourly();
});

function getDataListings() {
    $.ajax({
        url: '/invoicingClientIDs&NamesHourly',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            convertDataToSet(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function convertDataToSet(data) {
    let clientNames = [];
    let clientIdentCodes = [];
    for (let num in data) {
        clientNames.push(data[num].client_name);
        clientIdentCodes.push(data[num].ident_code);
    }
    let uniqueClientNames = removeDuplicatesFromArr(clientNames);

    visualizeDataListings([uniqueClientNames, clientIdentCodes]);
}

function visualizeDataListings(arr) {
    let clientNames = arr[0];
    let clientIdentCodes = arr[1];
    $('#idList option').remove();
    for (let name of clientNames) {
        $('#names').append(`<option value="${name}"></option>`);
    }

    for (let identCode of clientIdentCodes) {
        $('#idList').append(`<option value="${identCode}"></option>`);
    }
}

(function filterClientData() {
    $('#search').on('click', (event) => {
        try {
            dataTable.clear().destroy();
        } catch (err) {}
        let fromDate = $('#fromDate').val();
        let toDate = $('#toDate').val();
        let nameOfClient = $('#nameOfClient').val();
        let clientID = $('#clientID').val();
        let erp = [];
        if (window.location.href.includes('energoPRO')) {
            erp.push(3);
        }
        if (window.location.href.includes('cez')) {
            erp.push(2);
        }
        if (window.location.href.includes('evn')) {
            erp.push(1);
        }
        getInvoicesHourly([fromDate, toDate, nameOfClient, clientID, erp]);
    });
}())

function getInvoicesHourly(arr) {
    if (!arr) {
        var name = findGetParameter('clientNames');
        var fromDate = findGetParameter('fromDate');
        var toDate = findGetParameter('toDate');
        var clientID = findGetParameter('clientID');
        var erp = []
        if (window.location.href.includes('energoPRO')) {
            erp.push(3);
        }
        if (window.location.href.includes('cez')) {
            erp.push(2);
        }
        if (window.location.href.includes('evn')) {
            erp.push(1);
        }

    } else {
        var [
            fromDate,
            toDate,
            name,
            clientID,
            erp
        ] = arr;
    }
    notification('Loading...', 'loading');
    const url = `/api/filterData-invoicing-hourly`;
    $.ajax({
        url,
        method: 'POST',
        dataType: 'json',
        data: {
            fromDate,
            toDate,
            name,
            ident_code: clientID,
            erp
        },
        success: function (data) {
            visualizeDataTable(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    toastr.clear();
};

function visualizeDataTable(data) {
    console.log(data);
    let i = 0;
    for (let el in data) {
        if (el.ident_code != null) {
            let currRow = $('<tr>').attr('role', 'row');
            if (i % 2 == 1) {
                currRow.addClass('even');
            } else {
                currRow.addClass('odd');
            }
            i += 1;
            const erpType = data[el]['erp_type'];
            currRow
                .append($(`<td><a href=/users/clients/info/${data[el]['id']}>${data[el]['ident_code']}</a></td>`))
                .append($('<td>' + data[el]['client_name'] + '</td>'))
                .append($('<td>' + data[el]['period_from'] + '</td>'))
                .append($('<td>' + data[el]['period_to'] + '</td>'))
                .append($('<td>' + data[el]['value'] + '</td>'))
                .append($('<td>' + (erpType === 1 ? 'EVN' : erpType === 2 ? 'ЧЕЗ' : 'EнергоПРО') + '</td>'))
                .append($('</tr>'));
            currRow.appendTo($('#tBody'));
        }
    }
    dataTable = $('#invoices-hourly').DataTable({
        stateSave: true,
        "order": [
            [0, "asc"]
        ]
    });
};

function visualizeHistoryParams() {
    findGetParameter('toDate') === null ? '' : $('#toDate').val(findGetParameter('toDate'));
    findGetParameter('fromDate') === null ? '' : $('#fromDate').val(findGetParameter('fromDate'));
    findGetParameter('clientNames') === null ? '' : $('#nameOfClient').val(findGetParameter('clientNames'));
    findGetParameter('clientID') === null ? '' : $('#clientID').val(findGetParameter('clientID'));

    if (!window.location.href.includes('cez')) {
        $('#cez').prop('checked', false);
    }
    if (!window.location.href.includes('energoPRO')) {
        $('#energoPRO').prop('checked', false);
    }
    if (!window.location.href.includes('evn')) {
        $('#evn').prop('checked', false);
    }
}

(function filterClientIdentCodesOnInputChange() {
    $('#nameOfClient').on('change', () => {
        const clientName = $('#nameOfClient').val();
        getClientIdentCodeListings(clientName);
    });
}());

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
    $('#idList').remove();
    let identCodesDataListing = $('<datalist id="idList">');
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
    $('#clientID').append(identCodesDataListing);
}

function getInitialDataListings() {
    const clientNameVal = $('#nameOfClient').val();
    if (clientNameVal) {
        getDataListings();
        getClientIdentCodeListings(clientNameVal);
    } else {
        getDataListings();
    }
}