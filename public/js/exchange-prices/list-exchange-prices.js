;
$(document).ready(function () {
    visualizeAllInputFromGetParams();
    hideGraph();
    listExchangePriceReadings();
});

const colors = {
    blue: '#aa62ea',
}

function hideGraph() {
    hideSwitch();
    /*   $('.readings-graph-div').css('display', 'none');
      $('body > div.container.mt-3 > div.container.clients.text-center > div.row > div.offset-md-6 > label')
          .css('display', 'none'); */
}

function hideSwitch() {
    $('body > div.container.mt-3 > div.container.exchange-prices.text-center > div.row > div.offset-md-6 > label').css('display', 'none');
}

$('#searchBtn').on('click', (event) => {
    event.preventDefault();
    dataTable.clear().destroy();
    const fromDate = $('#fromDate').val();
    const toDate = $('#toDate').val();
    listExchangePriceReadings([fromDate, toDate]);
});
let initialCalendarDate = new Date();

(function () {
    const today = new Date();
    document.addEventListener('DOMContentLoaded', function () {
        const calendarEl = document.getElementById('calendar-readings');
        const calendar = new FullCalendar.Calendar(calendarEl, {
            eventLimit: true,
            eventLimit: 1,
            eventLimitText: 'Има цени',
            eventLimitClick: 'day',
            allDaySlot: false,
            eventOrder: 'groupId',
            events: listExchangePriceReadings(),
            defaultDate: initialCalendarDate,
            plugins: ['dayGrid', 'timeGrid'],
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'prev, dayGridMonth,timeGridDay, next',

            },
            contentHeight: 'auto'
        });
        setTimeout(function () {
            calendar.render();
        }, 0);
    });
})();

function incrementHoursOne(date) {
    return new Date(date.setHours(date.getHours() + 1));
}

function getReadingsDataForCalendar(data) {
    console.log(data)
    const beginningIndexOfIterator = 2;
    let dataArr = [];
    let currHourReading = [];

    for (let el in data) {
        currHourReading = [];
        let currHourDate = new Date(data[el].date);
        let objVals = Object.values(data[el]);
        let iterator = 0;
        let timezoneOffset = false;
        let moveRestOneHr = false;
        const color = colors.blue;
        for (let val of objVals) {
            if (iterator >= beginningIndexOfIterator) {
                currHourReading = {
                    id: data[el].ident_code,
                    title: val === null ? 0 : val,
                    start: timezoneOffset ? Number(currHourDate) - 1 : moveRestOneHr ? Number(currHourDate) - 3599999 : Number(currHourDate),
                    end: timezoneOffset ? Number(currHourDate) : moveRestOneHr ? Number(currHourDate) : Number(currHourDate) + 3599999,
                    backgroundColor: color
                }
                dataArr.push(currHourReading);
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
            iterator += 1;
        }
    }
    console.log(dataArr);
    return dataArr;
}

function listExchangePriceReadings(arr) {
    let calendarData;
    const url = '/api/filter/exchange-prices-hourly-readings/';
    if (!arr) {
        var fromDate = findGetParameter('fromDate');
        var toDate = findGetParameter('toDate');
    } else {
        var [
            fromDate,
            toDate,
        ] = arr;
    }
    notification('Loading...', 'loading');
    $.ajax({
        url,
        method: 'POST',
        data: {
            fromDate,
            toDate,
        },
        async: false,
        dataType: 'json',
        success: function (data) {
            console.log(data)
            if (data != '') {
                console.log(data)
                initialCalendarDate = new Date(data[0].date);
            //    showReadingsChart(data);
                calendarData = getReadingsDataForCalendar(data);
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    toastr.clear();
    return calendarData;

    /*  dataTable = $('#exchange-prices-table').DataTable({
         destroy: false,
         "paging": true,
         stateSave: true,
         sAjaxDataProp: 'data',
         "order": [
             [0, "asc"]
         ],
         "processing": true,
         "serverSide": true,
         "columnDefs": [{
             "className": "dt-center",
             "targets": "_all"
         }],
         ajax: {
             url: "/api/filter/exchange-prices-readings",
             data: {
                 fromDate,
                 toDate,
             },
             type: 'POST',
         },
         columns: [{
                 data: "id",
                 render: function (data, type, row) {
                     const date = row['date'];
                     const fullDate = new Date(date);
                     const fixedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1}-${fullDate.getDate()}`;
                     return `<td><a href=/users/exchange-prices/daily/s?id=${row['id']}&date=${fixedDate}>${row['id']}</td>`;
                 }
             },
             {
                 data: "date",
                 render: function (data, type, row) {
                     const date = row['date'];
                     const fullDate = new Date(date);
                     const formattedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1<10?`0${fullDate.getMonth()+1}`:fullDate.getMonth()+1}-${fullDate.getDate()<10?`0${fullDate.getDate()}`:fullDate.getDate()}`;
                     const fixedDate = `${fullDate.getFullYear()}-${fullDate.getMonth()+1}-${fullDate.getDate()}`;
                     return '<td>' + fixedDate + '</td>'
                 },
             },
         ],
         retrieve: true
     }); */
    toastr.clear();
};

function visualizeAllInputFromGetParams() {
    visualizeInputFromGetParams();
}

function visualizeInputFromGetParams() {
    findGetParameter('fromDate') === null ? '' : $('#fromDate').val(findGetParameter('fromDate'));
    findGetParameter('toDate') === null ? '' : $('#toDate').val(findGetParameter('toDate'));
}