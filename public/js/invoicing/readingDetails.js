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
            renderDataTable(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
};

function renderDataTable(data) {
    //Check operator 
    let operator = '';
    if (data['operator'] == 1) {
        operator = 'EVN';
    } else if (data['operator'] == 2) {
        operator = 'Чез';
    } else if (data['operator'] == 3) {
        operator = 'Енерго-Про';
    }
    const periodFrom = new Date(data['period_from']);
    const periodTo = new Date(data['period_to']);
    const formattedPeriodFrom = `${periodFrom.getFullYear()}-${periodFrom.getMonth()+1<10?`0${periodFrom.getMonth()+1}`:periodFrom.getMonth()+1}-${periodFrom.getDate()<10?`0${periodFrom.getDate()}`:periodFrom.getDate()}`;
    const formattedPeriodTo = `${periodTo.getFullYear()}-${periodTo.getMonth()+1<10?`0${periodTo.getMonth()+1}`:periodTo.getMonth()+1}-${periodTo.getDate()<10?`0${periodTo.getDate()}`:periodTo.getDate()}`;
    $('body div main div div:nth-child(1) > input').val(`${data['id']}`);
    $('body div main div div:nth-child(2) > input').val(`${data['client_id']}`);
    $('body div main div div:nth-child(3) > input').val(`${formattedPeriodFrom}`);
    $('body div main div div:nth-child(4) > input').val(`${formattedPeriodTo}`);
    $('body div main div div:nth-child(5) > input').val(`${data['period_days']}`);
    $('body div main div div:nth-child(6) > input').val(`${data['scale_number']}`);
    $('body div main div div:nth-child(7) > input').val(`${data['scale_type']}`);
    $('body div main div div:nth-child(8) > input').val(`${data['time_zone']}`);
    $('body div main div div:nth-child(9) > input').val(`${data['readings_new']}`);
    $('body div main div div:nth-child(10) > input').val(`${data['readings_old']}`);
    $('body div main div div:nth-child(11) > input').val(`${data['diff']}`);
    $('body div main div div:nth-child(12) > input').val(`${data['correction']}`);
    $('body div main div div:nth-child(13) > input').val(`${data['deduction']}`);
    $('body div main div div:nth-child(14) > input').val(`${data['total_qty']}`);
    $('body div main div div:nth-child(15) > input').val(`${data['service']}`);
    $('body div main div div:nth-child(16) > input').val(`${data['qty']}`);
    $('body div main div div:nth-child(17) > input').val(`${data['price']==0?'':`${data['price']} лв.`}`);
    $('body div main div div:nth-child(18) > input').val(`${data['value_bgn']==0?'':`${data['value_bgn']} лв.`} `);
    $('body div main div div:nth-child(19) > input').val(`${data['type']==2?'Разпределение':'Техническа част'}`);
    $('body div main div div:nth-child(20) > input').val(`${operator}`);
}