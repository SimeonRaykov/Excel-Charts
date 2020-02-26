;
$(document).ready(function () {
    renderInvocingPreviewTable();
});

(function issueInvoices() {
    $('body > div.container.mt-3 > main > div.card.card-default > div.card-body > div > button.btn-warning.btn-lg').click(() => {
        console.log(JSON.parse(localStorage.getItem('current-invoicing-data')));
    });
}());

function renderInvocingPreviewTable() {
    renderTableHeadingsCols();
    renderTableReadingsRows();
}

function renderTableHeadingsCols() {
    let invoicingCriterias = localStorage.getItem('invoicing-criteria');
    let headingCols = $('<tr>');
    if (invoicingCriterias.includes('ID на отчет')) {
        headingCols.append($('<th>ID на отчет</th>'))
    }
    if (invoicingCriterias.includes('Клиентски номер')) {
        headingCols.append($('<th>Клиентски номер</th>'))
    }
    if (invoicingCriterias.includes('Идентификационен код')) {
        headingCols.append($('<th>Идентификационен код</th>'))
    }
    if (invoicingCriterias.includes('Име на клиент')) {
        headingCols.append($('<th>Име на клиент</th>'))
    }
    if (invoicingCriterias.includes('Период на отчетност от')) {
        headingCols.append($('<th>Период на отчетност от</th>'))
    }
    if (invoicingCriterias.includes('Период на отчетност до')) {
        headingCols.append($('<th>Период на отчетност до</th>'))
    }
    if (invoicingCriterias.includes('Часова зона')) {
        headingCols.append($('<th>Часова зона</th>'))
    }
    if (invoicingCriterias.includes('Количество')) {
        headingCols.append($('<th>Количество</th>'))
    }
    if (invoicingCriterias.includes('Стойност в лв.')) {
        headingCols.append($('<th>Стойност в лв.</th>'))
    }
    if (invoicingCriterias.includes('Тип на документа')) {
        headingCols.append($('<th>Тип на документа</th>'))
    }
    if (invoicingCriterias.includes('ЕРП')) {
        headingCols.append($('<th>ЕРП</th>'))
    }
    headingCols.append($('</tr>'));
    headingCols.appendTo($('#preview-readings thead'))
}

function renderTableReadingsRows() {
    let invoiceReadings = JSON.parse(localStorage.getItem('current-invoicing-data'));
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
            currRow.append(`<td>${invoiceReadings[el][prop]}</td>`);
        }
        currRow.append('</tr>');
        currRow.appendTo($('#tBody'));
    }
    // Order DESC
    dataTable = $('#preview-readings').DataTable({
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
    })
}());