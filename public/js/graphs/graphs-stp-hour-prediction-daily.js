$(document).ready(function () {
    hideGraph();
});

(function switchHourReadingDailyCalendarAndGraph() {
    $('body > div.container.mt-3 > label > input').on('click', () => {
        if ($('.row.chart-daily').css('display') == 'none') {
            $('.row.chart-daily').css('display', 'block');
            $('.row.calendar-daily').css('display', 'none');
        } else {
            $('.row.chart-daily').css('display', 'none');
            $('.row.calendar-daily').css('display', 'flex');
        }
    });
}());

function hideGraph() {
    $('.row.chart-daily').css('display', 'none');
}

document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');
    let currDate = findGetParameter('date');
    let fixedDate = fixDateForFullCallendar(currDate);
    var calendar = new FullCalendar.Calendar(calendarEl, {
        eventLimit: true,
        eventLimit: 1,
        eventLimitText: 'Има график',
        eventLimitClick: 'day',
        allDaySlot: false,
        eventOrder: 'groupId',
        defaultDate: fixedDate,
        events: getSTPMonthlyPredictionData(),
        plugins: ['timeGrid', 'dayGrid'],
        defaultView: 'dayGridMonth',
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'prev, dayGridMonth,timeGridDay, next',
        }
    });
    calendar.render();
});

function getSTPMonthlyPredictionData() {
    let currDate = findGetParameter('date'),
        currHourReadingId = findGetParameter('id');
    let dataArr = [];
    $.ajax({
        url: `/api/graphs/stp-hour-prediction/monthly/${currHourReadingId}/${currDate}`,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            if (data.length) {
                showChartDaily(data);
                dataArr = [...processCalendarData(data)];
            } else if (findGetParameter('id') === 'Липсва') {
                dataArr = processCalendarDataForMissingDate();
                writeDailyHeadings(findGetParameter('ident_code'), new Date(findGetParameter('date')));
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }

    });
    return dataArr;
}

function showChartDaily(data) {

    let _IS_MULTIPLE_DAYS_GRAPHS_CHART = false;
    let labels = [];
    let chartData = [];
    let index = 0;
    if (data != undefined) {
        if (data.length == 1) {
            _IS_MULTIPLE_DAYS_GRAPHS_CHART = false;
            for (let el in data) {
                let amount = data[el]['amount'];
                if (amount == null || amount == undefined) {
                    amount = 1;
                }

                let date = new Date(data[el]['date']);
                for (let hr in data[el]) {
                    if (index >= 2 && index <= 25) {
                        let t = index == 2 ? date : incrementHoursOne(date)
                        let hourObj = {
                            t,
                            y: (data[el][hr] * amount).toFixed(3)
                        }
                        chartData.push(hourObj);
                        labels.push(`${t.getHours()} ч.`);
                    }
                    index += 1;
                }
                index = 0;
            }
        } else if (data.length != 1) {

            _IS_MULTIPLE_DAYS_GRAPHS_CHART = true;
            for (let el in data) {
                let date = new Date(data[el]['date']);
                for (let hr in data[el]) {
                    let amount = data[el]['amount'];
                    if (amount == null || amount == undefined) {
                        amount = 1;
                    }

                    if (index >= 2 && index <= 25) {
                        let t = index == 2 ? date : incrementHoursOne(date)
                        let hourObj = {
                            t,
                            y: (data[el][hr] * amount).toFixed(3)
                        }
                        chartData.push(hourObj);
                        labels.push(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} - ${t.getHours()}ч.`);
                    }
                    index += 1;
                }
                index = 0;
            }
        }
    }
    var ctx = document.getElementById('daily-hour-prediction-chart').getContext('2d');
    var config = {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Прогноза',
                data: chartData,
                borderWidth: 2,
                backgroundColor: "rgb(255,99,132)",
                borderColor: "#ac3f21"
            }],
        },
        options: {
            scales: {
                xAxes: [{
                    offset: true,
                    ticks: {
                        userCallback: _IS_MULTIPLE_DAYS_GRAPHS_CHART ? function (item, index) {
                            if (index === 12) return item.substring(0, item.length - 6);
                            if (((index + 12) % 24) === 0) return item.substring(0, item.length - 6);
                        } : '',
                        autoSkip: false
                    }
                }]
            },
            maintainAspectRatio: false,
            responsive: false
        }
    }
    try {
        GraphsChart.destroy();
    } catch (e) {}

    GraphsChart = new Chart(ctx, config);
    $('body > div.container.mt-3 > div.row.chart-daily > label > input').click((e) => {

        var temp = jQuery.extend(true, {}, config);
        if (GraphsChart.config.type == 'line') {
            temp.type = 'bar';
        } else {
            temp.type = 'line';
        }
        setTimeout(function () {
            GraphsChart.destroy();
            GraphsChart = new Chart(ctx, temp)
        }, 0)
    })
}

const colors = {
    blue: '#aa62ea',
    red: '#ff4d4d'
}

function writeDailyHeadings(identCode, date) {
    writeClientHeading(identCode);
    writeHourReadingsDailyHeading(date);
}

function processCalendarData(data) {
    const identCode = data[0]['ident_code'];
    writeDailyHeadings(identCode, new Date(data[0]['date']))
    let dataArr = [];
    let currHourReading = [];
    for (let el in data) {
        currHourReading = [];
        let currHourDate = new Date(data[el].date);
        let amount = data[el].amount;
        let i = 0;
        const startIndex = 2;
        const endIndex = 25;
        let timezoneOffset = false;
        let moveRestOneHr = false;
        for (let [key, value] of Object.entries(data[el])) {
            if (i > endIndex) {
                break;
            }
            if (i >= startIndex && i <= endIndex) {
                currHourReading = {
                    groupId: 1,
                    id: key,
                    title: value === null ? title = 'Няма стойност' : `Стойност: ${(value * amount).toFixed(3)}`,
                    start: timezoneOffset ? Number(currHourDate) - 1 : moveRestOneHr ? Number(currHourDate) - 3599999 : Number(currHourDate),
                    end: timezoneOffset ? Number(currHourDate) : moveRestOneHr ? Number(currHourDate) : Number(currHourDate) + 3599999,
                    backgroundColor: value === null ? colors.red : colors.blue,
                    textColor: value === null ? 'white' : 'black'
                }
                let oldDate = new Date(currHourDate.getTime());
                let newDate = incrementHoursOne(currHourDate);
                if (timezoneOffset) {
                    timezoneOffset = false;
                    moveRestOneHr = true;
                }
                if (oldDate.getTimezoneOffset() !== newDate.getTimezoneOffset()) {
                    if (oldDate.getMonth() !== 9) {
                        timezoneOffset = true;
                    }
                }
            }
            dataArr.push(currHourReading);
            i += 1;
        }
        i = 0;
    }
    return dataArr;
}

function incrementHoursOne(date) {
    return new Date(date.setHours(date.getHours() + 1));
}

function decrementHoursBy23(date) {
    return new Date(date.setHours(date.getHours() - 23));
}

function writeHourReadingsDailyHeading(data) {
    const currPredictionDate = `${data.getFullYear()}-${data.getMonth()+1<10?`0${data.getMonth()+1}`:data.getMonth()+1}`
    $('#date-heading').text(`Почасов график за месец: ${currPredictionDate}`);
}

function writeClientHeading(data) {
    $('#client-heading').text(`Клиент: ${data}`);
}

function fixDateForFullCallendar(date) {
    let splittedDate = date.split('-');
    let currYear = splittedDate[0];
    let currMonth = splittedDate[1];
    let currDate = splittedDate[2];
    if (currMonth < 10) {
        currMonth = `0${currMonth}`
    }
    if (currDate < 10) {
        currDate = `0${currDate}`;
    }
    return `${currYear}-${currMonth}-${currDate}`;
}