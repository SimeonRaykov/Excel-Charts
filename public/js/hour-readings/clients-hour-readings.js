document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');
    console.log(getHourReadingsByClientID());
    var calendar = new FullCalendar.Calendar(calendarEl, {
        events: getHourReadingsByClientID(),
        plugins: ['dayGrid', 'timeGrid'],
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridDay'
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
            let currHourReading = [];
            $('body > div > h1').text(`Мерения по часове за клиент: ${data[0].ident_code}`);
            for (let el in data) {
                currHourReading = [];
                let id = data[el].id;
                let hour_zero = data[el].hour_zero;
                currHourReading = {
                    title: data[el].hour_one,
                    start: new Date(data[el].date)
                };
                dataArr.push(currHourReading);
            }
            return dataArr;
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    return dataArr;
}

function callback(data) {}