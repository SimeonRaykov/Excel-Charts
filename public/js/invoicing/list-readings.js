;
$(document).ready(function () {
    stopBubblingForInputs();
    visualizeHistoryParams();
    getInitialDataListings();
    // getInvoicesSTP();
});

(function addOnClickToReadingsPreviewBTN() {
    $('#preview-readings').click(async () => {
        await setHeadingsColsandItemsRowsInLocalStorage();
        window.location.href = '/users/invoicing/preview'
    })
})();

(function selectAllColHeadings() {
    $('#select-cols').on('click', () => {
        const checkboxesHeadings = $('table th input');
        checkboxesHeadings.each(function () {
            if ($(this).prop('checked') === false) {
                $('table th input').prop('checked', true);
                return;
            } else {
                $('table th input').prop('checked', false);
                return;
            }
        });
    });
}());

(function selectAllRows() {
    $('#select-rows').on('click', () => {
        const checkboxesFirstRow = $($('table tbody input')[0]).prop('checked');
        if (checkboxesFirstRow === true) {
            $('table tbody input').prop('checked', false);
        } else {
            $('table tbody input').prop('checked', true);
        }
    })
}());

(function issueInvoices() {
    $('#invoiceBTN').click(() => {
        $.ajax({
            url: `/api/filter/invoices-stp`,
            method: 'POST',
            data: {
                IDs: localStorage.getItem('current-invoicing-data').split(),
            },
            dataType: 'json',
            success: function (data) {
                clearInvoices();
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    })
}());

function clearInvoices() {
    localStorage.removeItem('current-invoicing-data');
}

function stopBubblingForInputs() {
    $('table input').on('click', (e) => {
        e.stopPropagation();
    });
};

function getDataListings() {
    $.ajax({
        url: '/invoicingClientIDs&NamesSTP',
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
        event.preventDefault();
        try {
            dataTable.clear().destroy();
        } catch (err) {};
        let fromDate = $('#fromDate').val();
        let toDate = $('#toDate').val();
        let nameOfClient = $('#nameOfClient').val();
        let clientID = $('#clientID').val();

        getInvoicesSTP([fromDate, toDate, nameOfClient, clientID]);
    });
}())

function getInvoicesSTP(arr) {
    $('#list-readings').removeClass('invisible');
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
        ] = arr;
        var erp = [];
        if ($('#evn').prop('checked')) {
            erp.push(1);
        }
        if ($('#cez').prop('checked')) {
            erp.push(2);
        }
        if ($('#energoPRO').prop('checked')) {
            erp.push(3);
        }
    }
    notification('Loading...', 'loading');
    $.ajax({
        url: '/api/filterData-invoicing-stp',
        method: 'POST',
        data: {
            fromDate,
            toDate,
            name,
            ident_code: clientID,
            erp
        },
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
    for (let i = 0; i < data.length; i += 1) {
        let currRow = $('<tr>').attr('role', 'row');
        if (i % 2 == 1) {
            currRow.addClass('even');
        } else {
            currRow.addClass('odd');
        }
        const erpType = data[i]['operator'];
        const periodFrom = new Date(data[i]['period_from']);
        const periodTo = new Date(data[i]['period_to']);
        const formattedPeriodTo = `${periodTo.getFullYear()}-${periodTo.getMonth()+1<10?`0${periodTo.getMonth()+1}`:periodTo.getMonth()+1}-${periodTo.getDate()<10?`0${periodTo.getDate()}`:periodTo.getDate()}`;
        const formattedPeriodFrom = `${periodFrom.getFullYear()}-${periodFrom.getMonth()+1<10?`0${periodFrom.getMonth()+1}`:periodFrom.getMonth()+1}-${periodFrom.getDate()<10?`0${periodFrom.getDate()}`:periodFrom.getDate()}`;
        const diff_day = data[i]['diff_day'] || '-';
        const diff_night = data[i]['diff_night'] || '-';
        const diff_peak = data[i]['diff_peak'] || '-';
        const diff_single = data[i]['diff_single'] || '-';
        const service = data[i]['service'] || '-';
        currRow
            .append($('<td>' + data[i]['client_number'] + '</td>'))
            .append($(`<td><a href=clients/${data[i]['id']}>${data[i]['ident_code']}</a></td>`))
            .append($('<td>' + data[i]['client_name'] + '</td>'))
            .append($(`<td>${formattedPeriodFrom}</td>`))
            .append($(`<td>${formattedPeriodTo}</td>`))
            .append($(`<td>${diff_day}</td>`))
            .append($(`<td>${diff_night}</td>`))
            .append($(`<td>${diff_peak}</td>`))
            .append($(`<td>${diff_single}</td>`))
            .append($(`<td>${data[i]['total']}</td>`))
            .append($(`<td>${data[i]['duty']}</td>`))
            .append($(`<td>${service}</td>`))
            .append($('<td>' + (erpType === 1 ? 'EVN' : erpType === 2 ? 'ЧЕЗ' : 'EнергоПРО') + '</td>'))
            .append($('</tr>'));
        currRow.appendTo($('#tBody'));
    }
    $('#tBody').addClass('text-center');
    //DESC order 
    dataTable = $('#list-readings').DataTable({
        stateSave: true,
        "order": [
            [0, "asc"]
        ]
    });
    toastr.clear();
}

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

async function setHeadingsColsandItemsRowsInLocalStorage() {
    const allTableCols = $('table th input');
    let colHeadingText;
    let invoicingCriteria = [];
    allTableCols.each(function () {
        if ($(this).prop('checked')) {
            colHeadingText = $(this).parent().text();
            invoicingCriteria.push(colHeadingText);
        }
    });
    localStorage.setItem('invoicing-criteria', JSON.stringify(invoicingCriteria));
    let invoicingCriterias = JSON.stringify(invoicingCriteria);

    const allTableRowsInputs = $('table tbody input');
    let data = [];
    let currInfo = {};
    allTableRowsInputs.each(function () {
        if ($(this).prop('checked') === true) {
            let currRow = ($(this).parent().parent());
            let id, client_number, client_ident_code, curr_client_name,
                date_from, date_to, hour_zone, qty, total_cost, document_type, erp_type;

            id = ($(currRow.children()[0]).text());
            client_number = ($(currRow.children()[1]).text());
            client_ident_code = ($(currRow.children()[2]).text());
            curr_client_name = ($(currRow.children()[3]).text());
            date_from = ($(currRow.children()[4]).text());
            date_to = ($(currRow.children()[5]).text());
            hour_zone = ($(currRow.children()[6]).text());
            qty = ($(currRow.children()[7]).text());
            total_cost = ($(currRow.children()[8]).text());
            document_type = ($(currRow.children()[9]).text());
            erp_type = ($(currRow.children()[10]).text());

            /*   currInfo = {};
              if (invoicingCriterias.includes("ID на отчет")) {
                  currInfo.id = id;
              }
              if (invoicingCriterias.includes("Клиентски номер")) {
                  currInfo.client_number = client_number;
              }
              if (invoicingCriterias.includes("Идентификационен код")) {
                  currInfo.client_ident_code = client_ident_code;
              }
              if (invoicingCriterias.includes("Име на клиент")) {
                  currInfo.curr_client_name = curr_client_name;
              }
              if (invoicingCriterias.includes("Период на отчетност от")) {
                  currInfo.date_from = date_from;
              }
              if (invoicingCriterias.includes("Период на отчетност до")) {
                  currInfo.date_to = date_to;
              }
              if (invoicingCriterias.includes("Часова зона")) {
                  currInfo.hour_zone = hour_zone;

              }
              if (invoicingCriterias.includes("Количество")) {
                  currInfo.qty = qty;
              }
              if (invoicingCriterias.includes("Стойност в лв")) {
                  currInfo.total_cost = total_cost;
              }
              if (invoicingCriterias.includes("Тип на документа")) {
                  currInfo.document_type = document_type;
              }
              if (invoicingCriterias.includes("ЕРП")) {
                  currInfo.erp_type = erp_type;
              } */
            data.push(id);
        }
    });
    Array.prototype.unique = function () {
        var a = this.concat();
        for (var i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j])
                    a.splice(j--, 1);
            }
        }
        return a;
    };
    let currentItems = localStorage.getItem('current-invoicing-data') || [];
    currentItems != '' ? currentItems = currentItems.split() : '';
    let mergedValues = currentItems.concat(data).unique();
    localStorage.setItem('current-invoicing-data', mergedValues);
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
        console.log(clientNameVal);
        getDataListings();
        getClientIdentCodeListings(clientNameVal);
    } else {
        getDataListings();
    }
}