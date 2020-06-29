;
$(document).ready(function () {
    visualizeAllInputFromGetParams();
    hideGraph();
});

const colors = {
    blue: '#aa62ea',
}

function hideGraph() {
    hideSwitch();
    $('.exchange-prices-graph-div').css('display', 'none');
    $('div.row > div.offset-md-6 > label')
        .css('display', 'none');
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
        const calendarEl = document.getElementById('calendar-exchange-price');
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
    return dataArr;
}


function writeDailyPeriodHeading(firstDate, secondDate) {
    $('#period').empty();
    const formattedFirstDate = formatDate(firstDate);
    let chartDailyPeriod = '';
    if (secondDate === null) {
        chartDailyPeriod = $(`<h3 id="period" class="text-center mb-3">Дата: ${formattedFirstDate}<h3>`);
    } else {
        const formattedSecondDate = formatDate(secondDate);
        chartDailyPeriod = $(`<h3 id="period" class="text-center mb-3">От: ${formattedFirstDate} До: ${formattedSecondDate}<h3>`);
    }
    $('div.exchange-prices-graph-div').prepend(chartDailyPeriod);
}


function showReadingsChart(data) {
    const maxDate = getMaxDate(data);
    const minDate = getMinDate(data);
    const equalDates = checkIfDatesAreEqual(maxDate, minDate);
    if (equalDates) {
        writeDailyPeriodHeading(maxDate, null);
    } else {
        writeDailyPeriodHeading(minDate, maxDate);
    }
    let _IS_MULTIPLE_DAYS_READINGS_CHART = false;
    let labels = [];
    let tempActualArr = [];
    let index = 0;

    if (data != undefined) {
        if ((findGetParameter('fromDate') == findGetParameter('toDate')) && findGetParameter('fromDate')) {
            _IS_MULTIPLE_DAYS_READINGS_CHART = false;
            for (let el in data) {
                const startingIndexActualHourData = 2;
                let indexActualData = 2;
                let finalIndex = 26;
                let date = new Date(data[el]['date']);
                let valuesData = Object.values(data[el]);
                let t = date;
                for (let val of valuesData) {
                    if (index >= startingIndexActualHourData) {
                        if (index > finalIndex) {
                            break;
                        }

                        let actualHourObj = {
                            t,
                            y: valuesData[indexActualData] == null ? 0 : valuesData[indexActualData]
                        }
                        if (actualHourObj.y != undefined) {
                            tempActualArr.push(actualHourObj);
                        }

                        indexActualData += 1;
                        labels.push(`${t.getHours()} ч.`);
                        t = incrementHoursOne(date);
                    }
                    index += 1;
                }
                index = 0;
            }
        } else {
            _IS_MULTIPLE_DAYS_READINGS_CHART = true;
            for (let el in data) {
                let date = new Date(data[el]['date']);
                let t = date;
                for (let hr in data[el]) {
                    if (index >= 2) {
                        let hourObj = {
                            t,
                            y: data[el][hr] == null ? 0 : data[el][hr]
                        }
                        tempActualArr.push(hourObj);
                        labels.push(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} - ${t.getHours()}ч.`);
                        t = incrementHoursOne(date);
                    }
                    index += 1;
                }
                index = 0;
            }
        }
    }
    let labelsNoDuplicates = removeDuplicatesFromArr(labels);
    var ctx = document.getElementById('exchange-prices-chart').getContext('2d');
    var config = {
        type: 'line',
        data: {
            labels: labelsNoDuplicates,
            datasets: [{
                label: 'Настоящи',
                data: tempActualArr,
                borderWidth: 2,
                backgroundColor: "rgb(255,99,132)",
                borderColor: "#ac3f21"
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    offset: true,
                    ticks: {
                        userCallback: _IS_MULTIPLE_DAYS_READINGS_CHART ? function (item, index) {
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
    var myChart = new Chart(ctx, config);

    $('#switch-bar-line').click((e) => {
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

(function switchReadingsCalendarAndGraph() {
    $('#switch-calendar-graph').on('click', () => {
        if ($('#calendar-exchange-price').css('display') == 'block') {
            $('#calendar-exchange-price').css("display", "none");
            $('.exchange-prices-graph-div').css("display", "block");
            $('div.row > div.offset-md-6 > label')
                .css('display', 'block')
        } else {
            $(".exchange-prices-graph-div").css("display", "none");
            $('div.row > div.offset-md-6 > label')
                .css('display', 'none')
            $('#calendar-exchange-price').css("display", "block");
        }
    })
})();

function listExchangePriceReadings(arr) {
    notification('Loading...', 'loading');
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
            if (data != '') {
                initialCalendarDate = new Date(data[0].date);
                showReadingsChart(data);
                calendarData = getReadingsDataForCalendar(data);
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            notification(jqXhr.textStatus,'error');
            console.log(errorThrown);
        }
    });
    toastr.clear();
    return calendarData;
};

function visualizeAllInputFromGetParams() {
    visualizeInputFromGetParams();
}

function visualizeInputFromGetParams() {
    findGetParameter('fromDate') === null ? '' : $('#fromDate').val(findGetParameter('fromDate'));
    findGetParameter('toDate') === null ? '' : $('#toDate').val(findGetParameter('toDate'));
}