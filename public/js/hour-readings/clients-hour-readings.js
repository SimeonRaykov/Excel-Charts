document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        eventLimit: true,
        eventLimit: 1,
        eventLimitText: 'Има мерене',
        eventLimitClick: 'day',
        allDaySlot: false,
        eventOrder: 'groupId',
        events: getHourReadingsByClientID(),
        plugins: ['dayGrid', 'timeGrid'],
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'prev, dayGridMonth,timeGridDay, next',

        }
    });
    calendar.render();
});


function getHourReadingsByClientID() {
    let url = window.location.href;
    let clientID = url.substr(49);
    let dataArr = [];
    $.ajax({
        url: `http://localhost:3000/api/hour-readings/getClient/${clientID}`,
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
    writeHourReadingsHeader(data);
    console.log(data);
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

function incrementHoursOne(date) {
    return date.setHours(date.getHours() + 1);
}

function decrementHoursBy23(date) {
    return date.setHours(date.getHours() - 23);
}

function writeHourReadingsHeader(data) {
    $('body > div > h1').text(`Мерения по часове за клиент: ${data[0].ident_code}`);
}