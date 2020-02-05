;
$(document).ready(function () {
    let url = location.href;
    let readingNum = url.substring(url.lastIndexOf('/') + 1);
    getReadingData(readingNum);
});

function getReadingData(readingNum) {
    $.ajax({
        url: `/getReadingDetails/${readingNum}`,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            callback(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
};

function callback(data) {
    loadDetailsData(data);
};

function loadDetailsData(data) {

    //Check operator 
    let operator = '';
    if (data['operator'] == 1) {
        operator = 'EVN';
    } else if (data['operator'] == 2) {
        operator = 'Чез';
    } else if (data['operator'] == 3) {
        operator = 'Енерго-Про';
    }

    $('body > div > main > div > div:nth-child(1) > input').val(`${data['id']}`);
    $('body > div > main > div > div:nth-child(2) > input').val(`${data['client_id']}`);
    $('body > div > main > div > div:nth-child(3) > input').val(`${getJsDate(data['period_from'])}`);
    $('body > div > main > div > div:nth-child(4) > input').val(`${getJsDate(data['period_to'])}`);
    $('body > div > main > div > div:nth-child(5) > input').val(`${data['period_days']}`);
    $('body > div > main > div > div:nth-child(6) > input').val(`${data['scale_number']}`);
    $('body > div > main > div > div:nth-child(7) > input').val(`${data['scale_type']}`);
    $('body > div > main > div > div:nth-child(8) > input').val(`${data['time_zone']}`);
    $('body > div > main > div > div:nth-child(9) > input').val(`${data['readings_new']}`);
    $('body > div > main > div > div:nth-child(10) > input').val(`${data['readings_old']}`);
    $('body > div > main > div > div:nth-child(11) > input').val(`${data['diff']}`);
    $('body > div > main > div > div:nth-child(12) > input').val(`${data['correction']}`);
    $('body > div > main > div > div:nth-child(13) > input').val(`${data['deduction']}`);
    $('body > div > main > div > div:nth-child(14) > input').val(`${data['total_qty']}`);
    $('body > div > main > div > div:nth-child(15) > input').val(`${data['service']}`);
    $('body > div > main > div > div:nth-child(16) > input').val(`${data['qty']}`);
    $('body > div > main > div > div:nth-child(17) > input').val(`${data['price']==0?'няма стойност':`${data['price']} лв.`}`);
    $('body > div > main > div > div:nth-child(18) > input').val(`${data['value_bgn']==0?'няма стойност':`${data['value_bgn']} лв.`} `);
    $('body > div > main > div > div:nth-child(19) > input').val(`${data['type']==2?'Разпределение':'Техническа част'}`);
    $('body > div > main > div > div:nth-child(20) > input').val(`${operator}`);
}

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