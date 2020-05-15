;
$(document).ready(function () {
    renderInfo();
    hideGraph();
    visualizeAllInputFromGetParams();
});

function renderInfo() {
    $('body > div.container.mt-3 > ul > li:nth-child(1) > a').click();
}

(function switchReadingsCalendarAndGraph() {
    $('#switch-calendar-graph').on('click', () => {
        if ($('#calendar-readings').css('display') == 'block') {
            $('#calendar-readings').css("display", "none");
            $('div.readings-graph-div').css("display", "block");
            $('div.offset-md-6 > label')
                .css('display', 'block')
        } else {
            $("div.readings-graph-div").css("display", "none");
            $('div.offset-md-6 > label')
                .css('display', 'none')
            $('#calendar-readings').css("display", "block");

        }
    })
})();

const colors = {
    blue: '#aa62ea',
    red: '#ff4d4d',
    yellow: '#faee1c',
    pink: '#ea7dc7',
    orange: '#eac100',
    light_blue: '#00d1ff'
}

function hideGraph() {
    hideSwitch();
    $('.readings-graph-div').css('display', 'none');
    $('body > div.container.mt-3 > div.container.clients.text-center > div.row > div.offset-md-6 > label')
        .css('display', 'none');
}

function showCalendar() {
    $('#calendar-readings').css('display', 'block');
}

function incrementHoursOne(date) {
    return new Date(date.setHours(date.getHours() + 1));
}

$('#searchBtn').on('click', (event) => {
    event.preventDefault();
    dataTable.clear().destroy();
    const fromDate = $('#fromDate').val();
    const toDate = $('#toDate').val();
    const fifthInclineIndex = nth_occurrence(window.location.href, "/", 5);
    const profileID = decodeURI(
        window.location.href.substr(fifthInclineIndex + 1, 1)
    );
    getReadings([fromDate, toDate, profileID]);
    showCalendar();
});

let initialCalendarDate = new Date();

(function () {
    document.addEventListener('DOMContentLoaded', function () {
        var calendarEl = document.getElementById('calendar-readings');
        var calendar = new FullCalendar.Calendar(calendarEl, {
            eventLimit: true,
            eventLimit: 1,
            eventLimitText: 'Има мерене',
            eventLimitClick: 'day',
            allDaySlot: false,
            eventOrder: 'groupId',
            events: getReadings(),
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

function getReadings(arr) {
    let calendarData = [];
    if (!arr) {
        var fromDate = findGetParameter('fromDate');
        var toDate = findGetParameter('toDate');
        const fifthInclineIndex = nth_occurrence(window.location.href, "/", 5);
        const stringID = decodeURI(
            window.location.href.substr(fifthInclineIndex + 1)
        );
        var profileID = '';
        for (let i = 0; i < stringID.length; i += 1) {
            if (isNaN(stringID[i])) {
                break;
            }
            profileID += `${stringID[i]}`;
        }
    } else {
        var [
            fromDate,
            toDate,
            profileID
        ] = arr;
    }

    if (fromDate == null || fromDate == '') {
        fromDate = -1;
    }
    if (toDate == null || toDate == '') {
        toDate = -1;
    }

    let url = `/api/filter/profile-details/`;
    notification('Loading...', 'loading');
    $.ajax({
        url,
        method: 'POST',
        data: {
            fromDate,
            toDate,
            profileID
        },
        async: false,
        dataType: 'json',
        success: function (data) {
            if (data != '') {
                writeProfileHeading(data[0].profile_name);
                initialCalendarDate = new Date(data[0].date);
                showReadingsChart(data);
                calendarData = getReadingsDataForCalendar(data);
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    toastr.clear();
    return calendarData;
};

function writeProfileHeading(profileName) {
    $('h2').first().text('Профил - ' + profileName);
}

function writeDailyPeriodHeading(firstDate, secondDate) {
    const formattedFirstDate = formatDate(firstDate);
    let chartDailyPeriod = '';
    if (secondDate === null) {
        chartDailyPeriod = $(`<h3 class="text-center mb-3">Дата: ${formattedFirstDate}<h3>`);
    } else {
        const formattedSecondDate = formatDate(secondDate);
        chartDailyPeriod = $(`<h3 class="text-center mb-3">От: ${formattedFirstDate} До: ${formattedSecondDate}<h3>`);
    }
    $('body > div.container.mt-3 > div.container.clients.text-center > div.readings-graph-div').prepend(chartDailyPeriod);
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
    const maxLabels = 60;
    const setLimit = data.length > 60 ? true : false;
    const labelsToSkip = setLimit ? (data.length - maxLabels) * 24 : 0;
    const limitLabels = setLimit ? 5 : 1;
    let _IS_MULTIPLE_DAYS_READINGS_CHART = false;
    let labels = [];
    let tempActualArr = [];
    let index = 0;

    if (data != undefined) {
        if ((findGetParameter('fromDate') == findGetParameter('toDate')) && findGetParameter('fromDate')) {
            _IS_MULTIPLE_DAYS_READINGS_CHART = false;
            for (let el in data) {
                const startingIndexActualHourData = 3;
                let indexActualData = 3;
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
                            y: valuesData[indexActualData]
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
                    if (index >= 3) {
                        let hourObj = {
                            t,
                            y: data[el][hr]
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

    for (let i = 0; i < labelsToSkip; i += 1) {
        labelsNoDuplicates.splice(Math.floor(Math.random() * labelsNoDuplicates.length), 1);
    }

    var ctx = document.getElementById('readings-chart').getContext('2d');
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
                            if ((index + 12) % (24 * limitLabels) === 0) return item.substring(0, item.length - 6);
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

function getReadingsDataForCalendar(data) {
    const beginningIndexOfIterator = 3;
    let dataArr = [];
    let currHourReading = [];

    for (let el in data) {
        currHourReading = [];
        let currHourDate = new Date(data[el].date);
        let objVals = Object.values(data[el]);
        let timezoneOffset = false;
        let moveRestOneHr = false;
        let iterator = 0;
        const color = colors.blue;
        for (let val of objVals) {
            if (iterator >= beginningIndexOfIterator) {
                currHourReading = {
                    id: data[el].ident_code,
                    title: val,
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


function getThisAndLastMonthDates() {
    let today = new Date();
    let thisMonthDate = `${today.getFullYear()}-${Number(today.getMonth())+1}-${today.getDay()}`;
    let lastMonthDate = `${today.getFullYear()}-${Number(today.getMonth())}-${today.getDay()}`;
    if (Number(today.getMonth()) - 1 === -1) {
        lastMonthDate = `${Number(today.getFullYear())-1}-${Number(today.getMonth())+12}-${today.getDay()}`;
    }
    return [thisMonthDate, lastMonthDate];
}

function visualizeAllInputFromGetParams() {
    visualizeInputFromGetParams();
}

function visualizeInputFromGetParams() {
    findGetParameter('fromDate') === null ? '' : $('#fromDate').val(findGetParameter('fromDate'));
    findGetParameter('toDate') === null ? '' : $('#toDate').val(findGetParameter('toDate'));
}

function hideSwitch() {
    $('#info > div.container.clients.text-center > div.row > div.offset-md-6 > label').css('display', 'none');
}