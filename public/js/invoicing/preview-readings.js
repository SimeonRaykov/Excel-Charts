;
$(document).ready(function () {
    renderInvocingPreviewTable();
});

(function issueInvoices() {
    $('#invoiceBTN').on('click', () => {
        $.ajax({
            url: `/api/filter/invoices-stp`,
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

}())

function clearInvoices() {
    localStorage.removeItem('current-invoicing-data');
}

function renderInvocingPreviewTable() {
    renderTableHeadingsCols();
    getTableRowData();
}

function renderTableHeadingsCols() {
    /*   let invoicingCriterias = localStorage.getItem('invoicing-criteria'); */
    let headingCols = $('<tr>');
    headingCols.append($('<th>ID на отчет</th>'));
    headingCols.append($('<th>Идентификационен код</th>'));
    headingCols.append($('<th>Период на отчетност от</th>'));
    headingCols.append($('<th>Период на отчетност до</th>'));
    headingCols.append($('<th>Количество</th>'));
    headingCols.append($('<th>Стойност в лв.</th>'))
/* 
    if (invoicingCriterias.includes('ID на отчет')) {

    }
    if (invoicingCriterias.includes('Клиентски номер')) {
        headingCols.append($('<th>Клиентски номер</th>'))
    }
    if (invoicingCriterias.includes('Идентификационен код')) {

    }
    if (invoicingCriterias.includes('Име на клиент')) {
        headingCols.append($('<th>Име на клиент</th>'))
    }
    if (invoicingCriterias.includes('Период на отчетност от')) {

    }
    if (invoicingCriterias.includes('Период на отчетност до')) {

    }
    if (invoicingCriterias.includes('Часова зона')) {
        headingCols.append($('<th>Часова зона</th>'))
    }
    if (invoicingCriterias.includes('Количество')) {

    }
    if (invoicingCriterias.includes('Стойност в лв.')) {

    }
    if (invoicingCriterias.includes('Тип на документа')) {
        headingCols.append($('<th>Тип на документа</th>'))
    }
    if (invoicingCriterias.includes('ЕРП')) {
        headingCols.append($('<th>ЕРП</th>'))
    } */
    headingCols.append($('</tr>'));
    headingCols.appendTo($('#preview-readings thead'))
}

function getTableRowData() {
    $.ajax({
        url: `/api/filter/invoices-stp`,
        method: 'POST',
        data: {
            IDs: localStorage.getItem('current-invoicing-data').split(),
        },
        dataType: 'json',
        success: function (data) {
            renderTableReadingsRows(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function renderTableReadingsRows(data) {
    let invoiceReadings = data;
    let i = 0;
    for (let el in invoiceReadings) {
        let currRow = $('<tr>').attr('role', 'row');
        if (i % 2 == 1) {
            currRow.addClass('even');
        } else {
            currRow.addClass('odd');
        }
        i += 1;
        for (let prop in invoiceReadings[el]) {
            if (prop === 'period_from' || prop === 'period_to') {
                const formattedDate = getJsDate(invoiceReadings[el][prop]);
                currRow.append(`<td>${formattedDate}</td>`);
            } else {
                currRow.append(`<td>${invoiceReadings[el][prop]}</td>`);
            }
        }
        currRow.append('</tr>');
        currRow.appendTo($('#tBody'));
    }
    // Order DESC
    dataTable = $('#preview-readings').DataTable({
        stateSave: true,
        "order": [
            [0, "desc"]
        ],
        "paging": true,
        retrieve: true
    });
}

(function goBack() {
    $('body > div.container.mt-3 > main > div > div.card-body > div > button.btn-success.btn-lg').click(() => {
        window.history.back();
    });
}());

function getJsDate(isoFormatDateString) {
    let dateParts = isoFormatDateString.split("-");
    let days = Number(dateParts[2].substr(0, 2)) + 1
    let months = dateParts[1];
    if (days == 32) {
        dateParts[1] += 1;
        days -= 31;
        months = Number(months) + 1;
    };
    let jsDate = `${dateParts[0]}-${months}-${days}`;

    return jsDate;
}