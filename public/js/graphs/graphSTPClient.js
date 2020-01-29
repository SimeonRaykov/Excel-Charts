document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar-graph-stp');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        eventLimit: true,
        eventLimit: 1,
        eventLimitText: 'Има график',
        eventLimitClick: 'day',
        allDaySlot: false,
        eventOrder: 'groupId',
        events: getGraphSTP(),
        plugins: ['dayGrid', 'timeGrid'],
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'prev, dayGridMonth,timeGridDay, next',

        }
    });
    calendar.render();
});

function getGraphSTP() {
    let url = window.location.href;
    let clientID = url.substr(39);
    let dataArr = [];
    $.ajax({
        url: `/api/graph-STP/getInfoForSingleClient/${clientID}`,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            dataArr = [...processDataSTPGraphClient(data)];
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    return dataArr;
}

const colors = {
    blue: '#aa62ea',
    red: '#ff4d4d'
}

function processDataSTPGraphClient(data) {
    writeGraphSTPClientHeader(data);
    console.log(data);
    let dataArr = [];
    let currGraphPrediction = [];
    for (let el in data) {
        currGraphPrediction = [];
        let currHourDate = new Date(data[el].profileDate);
        let graphPredictionStartVal = 1
        let graphPredictionEndVal = 26
        let objVals = Object.values(data[el]);
        let iterator = 0;
        const amount = data[el]['amount'];
        for (let val of objVals) {
            if (iterator > graphPredictionStartVal && iterator < graphPredictionEndVal) {
                const stpPredictionCalc = calcEnergoPROandCEZGraphAmounts(amount, val);
                currGraphPrediction = {
                    id: iterator,
                    title: stpPredictionCalc,
                    start: Number(currHourDate),
                    end: Number(currHourDate) + 3600000,
                    backgroundColor: colors.blue
                }
                dataArr.push(currGraphPrediction);
                incrementHoursOne(currHourDate);
            }
            iterator += 1;
        }
    }
    return dataArr;
}

function calcEnergoPROandCEZGraphAmounts(amount, val) {
    return (amount * val).toFixed(3);
}

function incrementHoursOne(date) {
    return date.setHours(date.getHours() + 1);
}

function decrementHoursBy23(date) {
    return date.setHours(date.getHours() - 23);
}

function writeGraphSTPClientHeader(data) {
    $('body > div.container.mt-3 > h1').text(`График СТП за клиент: ${data[0].ident_code}`);
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