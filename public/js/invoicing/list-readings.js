;
$(document).ready(function () {
    stopBubblingForInputs();
    visualizeHistoryParams();
    getInitialDataListings();
    listAllReadings();
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

/* (function renderInvoicingPreview() {
    $('body > div.container.mt-3 > div.row.justify-content-around.mb-3 > button.btn-success.btn-lg').on('click', () => {
        setHeadingsColsandItemsRowsInLocalStorage();
    });
}()); */

(function issueInvoices() {
    $('#invoiceBTN').click(() => {
        $.ajax({
            url: `/api/filter/invoices`,
            method: 'POST',
            data: {
                IDs: localStorage.getItem('current-invoicing-data').split(),
            },
            dataType: 'json',
            success: function (data) {
                console.log(data);
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
        url: '/getInvoicingClientIDs&Names',
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
    $('body > div > form > div > button').on('click', (event) => {
        event.preventDefault();
        dataTable.clear().destroy();
        let fromDate = $('#fromDate').val();
        let toDate = $('#toDate').val();
        let nameOfClient = $('#nameOfClient').val();
        let clientID = $('#clientID').val();
        let ERP = $('#ERP').val();

        listAllReadings([fromDate, toDate, nameOfClient, clientID, ERP]);
    });
}())

function listAllReadings(arr) {
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
    dataTable = $('#list-readings').DataTable({
        destroy: false,
        "paging": true,
        stateSave: true,
        sAjaxDataProp: 'data',
        "order": [
            [0, "asc"]
        ],
        "processing": true,
        "serverSide": true,
        "columnDefs": [{
            "className": "dt-center",
            "targets": "_all"
        }],
        ajax: {
            url: "/api/filterData",
            data: {
                fromDate,
                toDate,
                name,
                ident_code: clientID,
                erp
            },
            type: 'POST',
        },
        columns: [{
                data: "id",
                render: function (data, type, row) {
                    return `<td><input type="checkbox" class="mr-1">${row['invoicing_id']}</td>`;
                }
            },
            {
                data: "client_number",
                render: function (data, type, row) {
                    return `<td>${row['client_number']}</td>`;
                },

            }, {
                data: "ident_code",
                render: function (data, type, row) {
                    return `<td><a href=clients/${row['id']}>${row['ident_code']}</a></td>`;
                },
            }, {
                data: "client_name",
                render: function (data, type, row) {
                    return `<td>${row['client_name']}</td>`;
                },
            },
            {
                data: "period_from",
                render: function (data, type, row) {
                    const periodFrom = new Date(row['period_from']);
                    const formattedPeriodFrom = `${periodFrom.getFullYear()}-${periodFrom.getMonth()+1<10?`0${periodFrom.getMonth()+1}`:periodFrom.getMonth()+1}-${periodFrom.getDate()<10?`0${periodFrom.getDate()}`:periodFrom.getDate()}`;
                    return `<td>${formattedPeriodFrom}</td>`;
                }
            },
            {
                data: "period_to",
                render: function (data, type, row) {
                    const periodTo = new Date(row['period_to']);
                    const formattedPeriodTo = `${periodTo.getFullYear()}-${periodTo.getMonth()+1<10?`0${periodTo.getMonth()+1}`:periodTo.getMonth()+1}-${periodTo.getDate()<10?`0${periodTo.getDate()}`:periodTo.getDate()}`;
                    return `<td>${formattedPeriodTo}</td>`;
                }
            },
            {
                data: "time_zone",
                render: function (data, type, row) {
                    const timeZone = row['time_zone'] == '' ? '' : row['time_zone'];
                    return `<td>${timeZone}</td>`;
                }
            },
            {
                data: "qty",
                render: function (data, type, row) {
                    const quantity = row['qty'] == '' ? '' : `${row['qty']}(кВтч/кВАрч)`;
                    return `<td>${quantity}</td>`;
                }
            },
            {
                data: "value_bgn",
                render: function (data, type, row) {
                    const valueBGN = row['value_bgn'] == 0 ? '' : `${row['value_bgn']} лв`;
                    return `<td>${valueBGN}</td>`;
                }
            },
            {
                data: "type",
                render: function (data, type, row) {
                    const currType = row['type'] == 1 ? 'Техническа част' : 'Разпределение';
                    return `<td>${currType}</td>`;
                }
            },
            {
                data: "operator",
                render: function (data, type, row) {
                    const operator = row['operator'] == 2 ? 'ЧЕЗ' : row['operator'] == 1 ? 'EVN' : 'EnergoPRO';
                    return `<td>${operator}</td>`;
                }
            },
            {
                data: "details",
                render: function (data, type, row) {
                    return `<td><a href="reading/${row['invoicing_id']}"><button type="button" class="btn btn-success" data-id="${row['invoicing_id']}">Детайли на мерене</button></a></td>`;
                }
            },
        ],
        retrieve: true
    });
    toastr.clear();
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