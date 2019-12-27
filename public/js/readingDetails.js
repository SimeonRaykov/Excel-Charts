;
$(document).ready(function () {
    let url = location.href;
    let readingNum = url.substring(url.indexOf('?') + 37);
    getReadingData(readingNum);
});

function getReadingData(readingNum) {
    $.ajax({
        url: `http://localhost:3000/getReadingDetails/${readingNum}`,
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
    $('body > div > main > div > div:nth-child(1) > input').val(`${data['id']}`);
    $('body > div > main > div > div:nth-child(2) > input').val(`${data['client_id']}`);
    $('body > div > main > div > div:nth-child(3) > input').val(`${data['period_from']}`);
    $('body > div > main > div > div:nth-child(4) > input').val(`${data['period_to']}`);
    $('body > div > main > div > div:nth-child(5) > input').val(`${data['period_days']}`);
    $('body > div > main > div > div:nth-child(6) > input').val(`${data['scale_number']}`);
    $('body > div > main > div > div:nth-child(7) > input').val(`${data['scale_type']}`);
    $('body > div > main > div > div:nth-child(8) > input').val(`${data['time_zone']}`);
    $('body > div > main > div > div:nth-child(9) > input').val(`${data['readings_old']}`);
    $('body > div > main > div > div:nth-child(10) > input').val(`${data['readings_new']}`);
    $('body > div > main > div > div:nth-child(11) > input').val(`${data['readings_old']}`);
    $('body > div > main > div > div:nth-child(12) > input').val(`${data['correction']}`);
    $('body > div > main > div > div:nth-child(13) > input').val(`${data['deduction']}`);
    $('body > div > main > div > div:nth-child(14) > input').val(`${data['total_qty']}`);
    $('body > div > main > div > div:nth-child(15) > input').val(`${data['service']}`);
    $('body > div > main > div > div:nth-child(16) > input').val(`${data['qty']}`);
    $('body > div > main > div > div:nth-child(17) > input').val(`${data['price']}`);
    $('body > div > main > div > div:nth-child(18) > input').val(`${data['value_bgn']}`);
    $('body > div > main > div > div:nth-child(19) > input').val(`${data['type']}`);
    $('body > div > main > div > div:nth-child(20) > input').val(`${data['operator']}`);
}