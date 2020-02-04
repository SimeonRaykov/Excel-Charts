$(document).ready(function () {
    defaultInputDatesForSearchGraphBtn()
    getClientInfo();
    getHourReadingsFilterData(getLastWeek(), new Date(), getClientID());
    showHourReadingChart();
});

$('#searchBtnHourlyGraph').on('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    const fromDate = document.querySelector('input[name=fromDate]').value;
    const toDate = document.querySelector('input[name=toDate]').value;
    getHourReadingsFilterData(fromDate, toDate, getClientID());
})

function getHourReadingsFilterData(fromDate, toDate, clientID) {
    if (fromDate == '') {
        fromDate = -1;
    }
    if (toDate == '') {
        toDate = -1;
    }
    $.ajax({
        url: `/api/hour-readings/${fromDate}/${toDate}/${clientID}`,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            showHourReadingChart(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function showHourReadingChart(data) {
    let labels = [];
    let chartData = [];
    let index = 0;
    let dataIterator = 0;
    if (data != undefined) {
        if (data.length == 1) {
            for (let el in data) {
                let date = new Date(data[el]['date']);
                for (let hr in data[el]) {
                    if (index >= 2) {
                        let t = index == 2 ? date : incrementHoursOne(date)
                        let hourObj = {
                            t,
                            y: data[el][hr]
                        }
                        chartData.push(hourObj);
                        labels.push(`${t.getHours()} ч.`);
                    }
                    index += 1;
                }
                index = 0;
            }
        } else if (data.length != 1) {
            for (let el in data) {
                let date = new Date(data[el]['date']);
                if (dataIterator == 0 || dataIterator == Math.ceil(data.length / 2) || dataIterator == data.length - 1) {
                    labels.push(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`);
                }
                for (let hr in data[el]) {
                    if (index >= 2) {
                        let t = index == 2 ? date : incrementHoursOne(date)
                        let hourObj = {
                            t,
                            y: data[el][hr]
                        }
                        chartData.push(hourObj);
                    }
                    index += 1;
                }
                index = 0;
                dataIterator += 1;
            }
        }
    }
    var ctx = document.getElementById('hour-readings-chart').getContext('2d');
    console.log(chartData);
    var config = {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Hour-Reading',
                data: chartData,
                borderWidth: 2,
                backgroundColor: "rgb(255,99,132)",
                borderColor: "#ac3f21"

            }],
        },
        /*
        options: {
            scales: {
              xAxes: [{
                ticks: {
                  maxRotation: 50,
                  minRotation: 30,
                  padding: 10,
                  autoSkip: false,
                  fontSize: 10
                }
              }]
            }
          }
          */
    }
    var myChart = new Chart(ctx, config);

    $('#hour-readings > div.hour-readings-graph-div.visible > form > div > div:nth-child(4) > label > input').click((e) => {
        myChart.destroy();
        var temp = jQuery.extend(true, {}, config);
        if (myChart.config.type == 'line') {
            temp.type = 'bar';
        } else {
            temp.type = 'line';
        }

        myChart = new Chart(ctx, temp);
    })
}

document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar-hourly');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        eventLimit: true,
        eventLimit: 1,
        eventLimitText: 'Има мерене',
        eventLimitClick: 'day',
        allDaySlot: false,
        eventOrder: 'groupId',
        events: getHourReadingsByID(),
        plugins: ['dayGrid', 'timeGrid'],
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'prev, dayGridMonth,timeGridDay, next',

        },
        contentHeight: 'auto',
    });
    calendar.render();
    $('body > div.container.mt-3 > ul > li:nth-child(1) > a').click();

});

document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar-imbalance');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        eventLimit: true,
        eventLimit: 1,
        eventLimitText: 'Има небанс',
        eventLimitClick: 'day',
        allDaySlot: false,
        eventOrder: 'groupId',
        events: getImbalances(),
        plugins: ['dayGrid', 'timeGrid'],
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'prev, dayGridMonth,timeGridDay, next',

        },
        contentHeight: 'auto'
    });
    calendar.render();
});

function getHourReadingsByID() {
    let clientID = getClientID();
    let dataArr = [];
    $.ajax({
        url: `/api/hour-readings/getClient/${clientID}`,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            dataArr = [...processDataHourly(data)];
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    return dataArr;
}

function getImbalances() {
    let clientID = getClientID();
    let dataArr = [];
    $.ajax({
        url: `/api/imbalances/getClient/${clientID}`,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            dataArr = [...processDataImbalances(data)];
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    return dataArr;
}

function getClientInfo() {
    let clientID = getClientID();
    let dataArr = [];
    $.ajax({
        url: `/api/getClientInfo/${clientID}`,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            visualizeClientInfo(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    return dataArr;
}

function visualizeClientInfo(data) {
    console.log(data);
    $('#info > div.container > div:nth-child(2) > input').val(data['client_name']);
    $('#info > div.container > div:nth-child(3) > input').val(data['ident_code']);
    $('#info > div.container > div:nth-child(4) > input').val(data['profile_id']);
    $('#info > div.container > div:nth-child(5) > input').val(data['metering_type'] == 2 ? 'СТП' : 'Почасово');
    $('#info > div.container > div:nth-child(6) > input').val(data['erp_type'] == 1 ? 'ИВН' : data['erp_type'] == 2 ? 'ЧЕЗ' : 'ЕнергоПРО');
    if (data['is_manufacturer']) {
        $('#squaredThree').prop('checked', true);
    }
}

function getClientID() {
    let lastIndexOfIncline = window.location.href.lastIndexOf('/');
    return window.location.href.substr(lastIndexOfIncline + 1);
}

const colors = {
    blue: '#aa62ea',
    red: '#ff4d4d'
}


function processDataHourly(data) {
    writeHourReadingsHeader(data);
    let dataArr = [];
    let currHourReading = [];
    for (let el in data) {
        currHourReading = [];
        let id = data[el][0];
        let currHourDate = new Date(data[el].date);
        let diff = data[el].diff;
        let type = data[el].type;
        let i = 0;
        for (let [key, value] of Object.entries(data[el])) {
            if (i >= 7 && i <= 29) {
                // 3 600 000 - FullCalendar one hour
                // 72 000 - One Hour
                incrementHoursOne(currHourDate);
                currHourReading = {
                    groupId: diff,
                    id: key,
                    title: value === -1 ? title = 'Няма стойност' : `Стойност: ${value} ${type===0?'Активна':'Реактивна'}`,
                    start: Number(currHourDate),
                    end: Number(currHourDate) + 3600000,
                    backgroundColor: diff === 0 ? colors.blue : colors.red
                }
            } else if (i === 30) {
                decrementHoursBy23(currHourDate);
                currHourReading = {

                };
                currHourReading.backgroundColor = diff === 0 ? colors.blue : colors.red
                currHourReading.start = Number(currHourDate);
                currHourReading.end = Number(currHourDate) + 3600000;
                currHourReading.title = value === -1 ? title = 'Няма стойност' : `Стойност: ${value}`;
                dataArr.push(currHourReading);
                break;
            }
            dataArr.push(currHourReading);
            i += 1;
        }
    }

    return dataArr;
}


function processDataImbalances(data) {
    writeImbalancesHeader(data);
    let dataArr = [];
    let currHourReading = [];
    for (let el in data) {
        currHourReading = [];
        let currHourDate = new Date(data[el].date);
        let currHourReadingVal = 2;
        let currHourPredictionVal = 26;
        let objVals = Object.values(data[el]);
        let iterator = 0;

        for (let val of objVals) {
            if (iterator >= 2 && iterator < 26) {
                const currImbalance = objVals[currHourPredictionVal] - objVals[currHourReadingVal];
                currHourReading = {
                    id: iterator,
                    title: currImbalance,
                    start: Number(currHourDate),
                    end: Number(currHourDate) + 3600000,
                    backgroundColor: colors.blue
                }
                dataArr.push(currHourReading);
                incrementHoursOne(currHourDate);
                currHourReadingVal += 1;
                currHourPredictionVal += 1;
            }
            iterator += 1;
        }
    }
    return dataArr;
}

function incrementHoursOne(date) {
    return new Date(date.setHours(date.getHours() + 1));
}

function decrementHoursBy23(date) {
    return date.setHours(date.getHours() - 23);
}

function writeHourReadingsHeader(data) {
    $('#hour-readings > h1').text(`Мерения по часове за клиент: ${data[0].ident_code}`);
}

function writeImbalancesHeader(data) {
    $('#imbalance > h1').text(`Небаланси за клиент: ${data[0].ident_code}`)
}

function getLastWeek() {
    var today = new Date();
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastWeek;
}

function findGetParameter(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

(function addSwitchEvent() {
    $('#hour-readings > label > span.switch-label').on('click', () => {
        if ($('#hour-readings > div.row').is(':visible')) {
            $('#hour-readings > div.row').hide();
            $('.invisible').removeClass('invisible').addClass('visible');
        } else {
            $('#hour-readings > div.row').show();
            $('.visible').addClass('invisible').removeClass('visible');
        }
    })
}());

function defaultInputDatesForSearchGraphBtn() {
    const lastWeekDate = getLastWeek();
    const today = new Date();
    $('#hour-readings > div:nth-child(4) > form > div > div.col-md-3.offset-2 > input[type=date]').val(`${lastWeekDate.getFullYear()}-${lastWeekDate.getMonth()+1<10?`0${lastWeekDate.getMonth()+1}`:lastWeekDate.getMonth()+1}-${lastWeekDate.getDate()<10?`0${lastWeekDate.getDate()}`:lastWeekDate.getDate()}`);
    $('#hour-readings > div:nth-child(4) > form > div > div:nth-child(2) > input[type=date]').val(`${today.getFullYear()}-${(today.getMonth()+1)<10? `0${today.getMonth()+1}`: today.getMonth()+1}-${today.getDate()<10?`0${today.getDate()}`:today.getDate()}`);
}