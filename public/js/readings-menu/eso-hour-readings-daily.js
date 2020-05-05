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
        eventLimitText: 'Има мерене',
        eventLimitClick: 'day',
        allDaySlot: false,
        eventOrder: 'groupId',
        defaultDate: fixedDate,
        events: getESOHourReadingDailyData(),
        plugins: ['timeGrid', ],
        defaultView: 'timeGridDay',
        header: {
            left: '',
            center: 'title',
            right: '',
        }
    });
    calendar.render();
});

function getESOHourReadingDailyData() {
    let currDate = findGetParameter('date'),
        currHourReadingId = findGetParameter('id');;
    let dataArr = [];
    $.ajax({
        url: `/api/eso-hour-readings/daily/${currHourReadingId}/${currDate}`,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            processDateHeading(findGetParameter('date'));
            if (data.length) {
                showChartDaily(data);
                dataArr = [...processCalendarData(data)];
            } else if (findGetParameter('id') === 'Липсва') {
                dataArr = processCalendarDataForMissingDate();
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    return dataArr;
}

function showChartDaily(data) {
    let labels = [];
    let chartData = [];
    let index = 0;
    const startingIndex = 2;
    const endIndex = 25;
    let dataIterator = 0;
    if (data != undefined) {
        if (data.length == 1) {
            for (let el in data) {
                let date = new Date(data[el]['date']);
                for (let hr in data[el]) {
                    if (index >= startingIndex) {
                        if (index > endIndex) {
                            break;
                        }
                        let t = index == 2 ? date : incrementHoursOne(date)
                        let hourObj = {
                            t,
                            y: data[el][hr],
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
    var ctx = document.getElementById('daily-hour-readings-chart').getContext('2d');
    var config = {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Почасово мерене',
                data: chartData,
                borderWidth: 2,
                backgroundColor: "rgb(255,99,132)",
                borderColor: "#ac3f21"
            }],
        },
        options: {
            scales: {
                xAxes: [{
                    offset: true
                }]
            },
            maintainAspectRatio: false,
            responsive: false
        }
    }
    var myChart = new Chart(ctx, config);

    $('body > div.container.mt-3 > div.row.chart-daily > label > input').click((e) => {
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

const colors = {
    blue: '#aa62ea',
    red: '#ff4d4d'
}

function processCalendarDataForMissingDate() {
    let dataArr = [];
    let currHourReading = [];
    let currReadingDate = new Date(findGetParameter('date'));
    for (let i = 0; i < 24; i += 1) {
        currHourReading = [];
        currHourReading = {
            groupId: i,
            id: i,
            title: 'Няма стойност',
            start: Number(currReadingDate),
            end: Number(currReadingDate) + 3599999,
            backgroundColor: colors.red,
            textColor: 'white'
        }
        incrementHoursOne(currReadingDate);
        dataArr.push(currHourReading);
    }
    return dataArr;
}

function processCalendarData(data) {
    let dataArr = [];
    let currHourReading = [];
    for (let el in data) {
        currHourReading = [];
        let currHourDate = new Date(data[el].date);
        let type = data[el].type;
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
                    groupId: key,
                    id: key,
                    title: value === -1 ? title = 'Няма стойност' : `Стойност: ${value} ${type===1?'Потребена':'Произведена'}`,
                    start: timezoneOffset ? Number(currHourDate) - 1 : moveRestOneHr ? Number(currHourDate) - 3599999 : Number(currHourDate),
                    end: timezoneOffset ? Number(currHourDate) : moveRestOneHr ? Number(currHourDate) : Number(currHourDate) + 3599999,
                    backgroundColor: value === -1 ? colors.red : colors.blue,
                    textColor: value === -1 ? 'white' : 'black'
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

function processDateHeading(date) {
    let readingDate = new Date(date);
    let formattedDate = `${readingDate.getFullYear()}-${readingDate.getMonth()+1<10?`0${readingDate.getMonth()+1}`:readingDate.getMonth()}-${readingDate.getDate()<10?`0${readingDate.getDate()}`:readingDate.getDate()}`;
    writeESOHourReadingDailyHeading(formattedDate);
}

function writeESOHourReadingDailyHeading(date) {
    $('#date-heading').text(`EСО - почасово мерене за дата: ${date}`);
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