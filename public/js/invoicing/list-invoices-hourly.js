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
        success: async function (data) {
            await visualizeDataTable(data);
            addOnChangeEventsToInputs();
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    toastr.clear();
};

function visualizeDataTable(data) {
    let i = 0;
    for (let el in data) {
        if (data[el].ident_code != null) {
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
                .append($(`<td><input class="amount text-center" type="number" value="${data[el]['value']}"/></td>`))
                .append($(`<td><input class="excise text-center" type="number" value="${data[el]['excise']}"/></td>`))
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

function generateInvoiceXML(data) {
    //  1.5
    let xml = `<Invoice>`;
    //  1.7
    generateInvoiceHeader(xml);
    //  1.9
    generateAddress(xml);
    //  1.13
    generateRecipient(xml);
    //  1.14
    generateDetails(xml);
    //  1.15
    generateTax(xml);
    //  1.16
    generateTotalGrossAmount(xml);
    //  1.17
    generatePaymentMethod(xml);
    //  1.18
    generatePaymentConditions(xml)
    //  1.19
    generatePresentationDetails(xml);
    xml += `</Invoice>`;

    function generateInvoiceHeader(xml) {
        xml += `<InvoiceHeader>
     <InvoiceNumber></InvoiceNumber>
     <InvoiceDate></InvoiceDate>
     <InvoiceTypeCode></InvoiceTypeCode>
     <InvoiceTypeText></InvoiceTypeText>
 <InvoiceOriginCode></InvoiceOriginCode>
 <InvoiceOriginText></InvoiceOriginText>
 <TaxPointDate><TaxPointDate>
 <InvoiceCreatedBy></InvoiceCreatedBy>
     </InvoiceHeader>`;
    }

    function generateAddress(xml) {
        xml += `<Address>
        <Email></Email>    
        </Address>`
    }

    function generateRecipient(xml) {
        xml += `<Recipient>
        <VATIdentificationNumber>BG130221692</VATIdentificationNumber>
        <IdentificationNumber>130221692</IdentificationNumber>
        <BillersRecipientID>291</BillersRecipientID>
        <Address>
        <Name>МMMMMM ЕООД</Name>
        <Street>ул.Костенски водопад 58, София</Street>
        <Contact>Павлин Панчо Петров</Contact>
        <AddressExtension>ул. Костенски водопад №58, София 404</AddressExtension>
        </Address>
        </Recipient>`;
    }

    function generateDetails(xml) {
        xml += `<Details>
        <ItemList ListType="structured">
        <ListLineItem>
        <ListElement Type="IdentifierType" Usage="Number">1</ListElement>
        <ListElement Type="StringType" Usage="Description">Наказателна
        лихва</ListElement>
        <ListElement Type="AmountType" Usage="Amount" Unit="EUR"
        >10.02</ListElement>
        <ListElement Type="AmountType" Usage="Amount" Unit="BGN"
        >19.59</ListElement>
        </ListLineItem>
        </ItemList>
        <TotalVATExcludedAmount>19.59</TotalVATExcludedAmount>
        </Details>
        `;
    }

    function generateTax(xml) {
        xml += `<Tax>
        <VAT>
        <Item>
        <TaxedAmount>19.59</TaxedAmount>
        <Percentage>20.00</Percentage>
        <Amount>3.92</Amount>
        </Item>
        </VAT>
        </Tax>`;
    }

    function generateTotalGrossAmount(xml) {
        xml += `<TotalGrossAmount Currency="BGN" >23.51</TotalGrossAmount>`;
    }

    function generatePaymentMethod(xml) {
        xml += `<PaymentMethod xsi:type="CreditTransferType">
        <Comment>платежно нареждане</ Comment>
        <BeneficiaryAccount>
        <BankName>Райфайзенбанк (България) ЕАД</BankName>
        <IBAN>BG07RZBB91551060466123</IBAN>
        <Currency>BGN</Currency>
        </BeneficiaryAccount>
        <BeneficiaryAccount>
        <BankName>Райфайзенбанк (България) ЕАД</BankName>
        <IBAN>BG33RZBB91551460466107</IBAN>
        <Currency>EUR</Currency>
        </BeneficiaryAccount>
        </PaymentMethod>
        `;
    }

    function generatePaymentConditions(xml) {
        xml += `<PaymentConditions>
        <DueDate>2006-02-03</DueDate>
        <Discount>
        <PaymentDate>2006-01-10</PaymentDate>
        <DiscountedAmount>1320.65</DiscountedAmount>
        <Percentage>3.00</Percentage>
        <Amount Currency="EUR">40.85</Amount>
        </Discount>
        <Discount>
        <PaymentDate>2006-01-20</PaymentDate>
        <DiscountedAmount>1334.27</DiscountedAmount>
        <Percentage>2.00</Percentage>
        <Amount Currency="EUR">27.23</Amount>
        </Discount>
        <MinimumPayment Currency="EUR">1320.65</MinimumPayment>
        <Comment>коментар към условията на плащане....</Comment>
        </PaymentConditions>
        `;
    }

    function generatePresentationDetails(xml) {
        xml += `<PresentationDetails>
        <LogoURL>RaifaizenLizing.gif</LogoURL>
        <LayoutID>0100</LayoutID>
        <Language>bul</Language>
        <TransformationID>1</TransformationID>
        <DocumentTitle>Фактура</DocumentTitle>
        <ShortComment/>
        <HeaderComment/>
        <FooterComment>Райфайзен Лизинг България ЕООД * Бизнес Парк София,
        сграда 11 ет. 4 * 1786 София, България</FooterComment>
        <FooterComment>тел. 970 79 79, факс 974 20 57 * Член на Австрийската
        банкова Група Райфайзен</FooterComment>
        </PresentationDetails>`;
    }
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
        let currIdentCode = $(` < option > $ {
        identCode
    } < /option>`);
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

function addOnChangeEventsToInputs() {
    $('.amount').on('change', function () {
        const currentAmount = $(this).val();
        const currentExciseAmount = Number(currentAmount) * 2;
        $(this).parent().parent().find('.excise')[0].value = currentExciseAmount;
    });
    $('.excise').on('change', function () {
        const currentExciseAmount = $(this).val();
        const currentAmount = Number(currentExciseAmount) / 2;
        $(this).parent().parent().find('.amount')[0].value = currentAmount;
    });
}