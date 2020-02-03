$(document).ready(function () {
    getClientInfo();
    showHourReadingChart();
});

function showHourReadingChart() {
    var ctx = document.getElementById('hour-readings-chart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [new Date("2015-3-15 13:3").toLocaleString(), new Date("2015-3-25 13:2").toLocaleString(), new Date("2015-4-25 14:12").toLocaleString()],
          datasets: [{
            label: 'Demo',
            data: [{
                t: new Date("2015-3-15 13:3"),
                y: 12
              },
              {
                t: new Date("2015-3-25 13:2"),
                y: 21
              },
              {
                t: new Date("2015-4-25 14:12"),
                y: 32
              }
            ],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        }
      });
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
    return date.setHours(date.getHours() + 1);
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

function findGetParameter(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}