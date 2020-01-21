class CurrDate {
    constructor() {
        this.date = '';
    };
    getDate() {
        return this.date;
    }
    setDate(date) {
        return this.date = date;
    }
}
let hourReadingDay = new CurrDate();

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
        events: getHourReadingsByID(),
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

function getHourReadingsByID() {
    let currDate = findGetParameter('date'),
        currHourReadingId = findGetParameter('id');
    let dataArr = [];
    $.ajax({
        url: `http://localhost:3000/api/hour-readings/daily/${currHourReadingId}/${currDate}`,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            dataArr = [...processData(data)];
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

function processData(data) {
    console.log(data);
    writeHourReadingsHeader(data);
    hourReadingDay.setDate(data[0]['date']);
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
            if (i >= 3 && i <= 25) {
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
            } else if (i === 26) {
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

function incrementHoursOne(date) {
    return date.setHours(date.getHours() + 1);
}

function decrementHoursBy23(date) {
    return date.setHours(date.getHours() - 23);
}

function writeHourReadingsHeader(data) {
    $('body > div > h1').text(`Мерения по часове за id: ${data[0].id}`);
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