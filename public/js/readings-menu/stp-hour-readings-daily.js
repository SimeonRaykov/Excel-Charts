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
        events: getHourReadingsDailyData(),
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

function getHourReadingsDailyData() {
    let currDate = findGetParameter('date'),
        currHourReadingId = findGetParameter('id');
    let dataArr = [];
    $.ajax({
        url: `/api/daily/stp-hour-reading/${currHourReadingId}/${currDate}`,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            if (data.length) {
                showChartDaily(data);
                dataArr = [...processCalendarData(data)];
            } else if (findGetParameter('id') === 'Липсва') {
                dataArr = processCalendarDataForMissingDate();
                const readingDate = new Date(findGetParameter('date'));
                const formattedDate = `${readingDate.getFullYear()}-${readingDate.getMonth()+1<10?`0${readingDate.getMonth()+1}`:readingDate.getMonth()+1}-${readingDate.getDate()<10?`0${readingDate.getDate()}`:readingDate.getDate()}`;
                writeDailyHeadings(findGetParameter('ident_code'), formattedDate);
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
    const startingIndex = 3;
    const endIndex = 26;
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
                            y: (Number(data[el][hr]) / 1000).toFixed(7),
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
                            y: (Number(data[el][hr]) / 1000).toFixed(7)
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

function writeDailyHeadings(identCode, date) {
    writeClientNameHeading(identCode);
    writeHourReadingsDailyHeading(date);
}


function processCalendarData(data) {
    const readingDate = new Date(data[0]['date']);
    const formattedDate = `${readingDate.getFullYear()}-${readingDate.getMonth()+1<10?`0${readingDate.getMonth()+1}`:readingDate.getMonth()+1}-${readingDate.getDate()<10?`0${readingDate.getDate()}`:readingDate.getDate()}`;
    writeDailyHeadings(data[0]['ident_code'], formattedDate);
    let dataArr = [];
    let currHourReading = [];
    for (let el in data) {
        currHourReading = [];
        let currHourDate = new Date(data[el].date);
        let diff = data[el].diff;
        let type = data[el].type;
        let i = 0;
        const startIndex = 3;
        const endIndex = 26;
        let timezoneOffset = false;
        let moveRestOneHr = false;
        for (let [key, value] of Object.entries(data[el])) {
            if (i > endIndex) {
                break;
            }
            if (i >= startIndex && i <= endIndex) {
                currHourReading = {
                    groupId: diff,
                    id: key,
                    title: value === null ? title = 'Няма стойност' : `Стойност: ${(Number(value)/1000).toFixed(7)} ${type===0?'Активна':'Реактивна'}`,
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
            if (currHourReading != '') {
                dataArr.push(currHourReading);
            }
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
    $('#date-heading').text(`Почасово мерене за дата: ${data}`);
}

function writeClientNameHeading(data) {
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