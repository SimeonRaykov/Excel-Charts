;
$(document).ready(function () {
    renderInfo();
    hideGraph();
    visualizeAllInputFromGetParams();
    getDataListing();
});

function initializeHandsOnTable(data) {
    var container = document.getElementById('handsontable-readings');
    var hot = new Handsontable(container, {
        htMiddle: true,
        htCenter: true,
        contextMenu: true,
        manualRowMove: true,
        bindRowsWithHeaders: 'strict',
        rowHeaders: true,
        colHeaders: true,
        data: data,
        filters: true,
        dropdownMenu: true,
        licenseKey: 'non-commercial-and-evaluation',
        colWidths: 200,
        colHeights: 500,
        rowWidths: 200,
        rowHeights: 30,
        cells: function () {
            var cellPrp = {};
            cellPrp.className = 'htCenter htMiddle'
            return cellPrp
        }
    });

    const exportPlugin = hot.getPlugin('exportFile');
    exportPlugin.exportAsString('csv', {
        columnHeaders: true,
        rowHeaders: true,
        columnDelimiter: ',',
    });

    $('#export-table-btn').on('click', () => {
        const filename = $('#table-input').val() || 'excel-readings';
        exportPlugin.downloadFile('csv', {
            filename
        });
    })
};

(function removeDataTableEvent() {
    $('#hide_dataTable').click(() => {
        $('#handsontable-readings').css('display', 'none');
        $('#hide_dataTable').addClass('animated-push-btn');
        $('#show_dataTable').removeClass('animated-push-btn');
    });
}());

(function addDataTableEvent() {
    $('#show_dataTable').click(() => {
        $('#handsontable-readings').css('display', 'block');
        $('#show_dataTable').addClass('animated-push-btn');
        $('#hide_dataTable').removeClass('animated-push-btn');
    });
}());

function renderInfo() {
    $('body > div.container.mt-3 > ul > li:nth-child(1) > a').click();
}

class Client {
    constructor() {
        this.meteringType = '';
    }
    getMeteringType() {
        return this.meteringType;
    }
    setMeteringType(meteringType) {
        return this.meteringType = meteringType;
    }
}
client = new Client();

(function switchReadingsCalendarAndGraph() {
    $('#switch-calendar-graph').on('click', () => {
        if ($('#calendar-readings').css('display') == 'block') {
            $('#calendar-readings').css("display", "none");
            $('div.readings-graph-div').css("display", "block");
            $('#info > div.container.clients.text-center > div.row > div.offset-md-6 > label')
                .css('display', 'block')
        } else {
            $("div.readings-graph-div").css("display", "none");
            $('#info > div.container.clients.text-center > div.row > div.offset-md-6 > label')
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

function getDataListing() {
    $.ajax({
        url: '/api/data-listings/imbalances',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            convertDataToSet(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });

    $.ajax({
        url: '/api/data-listings/profile-name',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            visualizeProfileNameDataListings(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function convertDataToSet(data) {
    let clientNames = [];
    let clientIDs = [];
    for (let num in data) {
        clientNames.push(data[num].client_name);
        clientIDs.push(data[num].ident_code);
    }
    let uniqueClientNames = removeDuplicatesFromArr(clientNames);
    visualizeDataListings([uniqueClientNames, clientIDs]);
}

function visualizeDataListings(arr) {
    let clientNames = arr[0];
    let clientIds = arr[1];

    for (let name of clientNames) {
        $('#stp-hour-readings-clients').append(`<option value="${name}"></option>`);
    }

    for (let ID of clientIds) {
        $('#idList').append(`<option value="${ID}"></option>`);
    }
}

function visualizeProfileNameDataListings(profileNames) {
    for (let profileName of profileNames) {
        $('#profile_names').append(`<option value="${profileName.profile_name}"></option>`);
    }
}

$('#searchBtn').on('click', (event) => {
    event.preventDefault();
    dataTable.clear().destroy();
    dataTable;
    let fromDate = $('#fromDate').val();
    let toDate = $('#toDate').val();
    let nameOfClient = $('#name').val();
    let clientID = $('#clientID').val();
    let profileName = $('#profile_name').val()
    getReadings([fromDate, toDate, nameOfClient, clientID, profile_name]);
    showCalendar();
});


let initialCalendarDate = new Date();

(function () {
    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${today.getMonth()+1<10?`0${today.getMonth()+1}`:today.getMonth()+1}-${today.getDate()<10?`0${today.getDate()}`:today.getDate()}`;
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
        var name = findGetParameter('name');
        var fromDate = findGetParameter('fromDate');
        var toDate = findGetParameter('toDate');
        var clientID = findGetParameter('clientID');
        var profile_name = findGetParameter('profile_name');
        var erp = []
        var metering_type = findGetParameter('readings');
        if (window.location.href.includes('energoPRO')) {
            erp.push(3);
        }
        if (window.location.href.includes('cez')) {
            erp.push(2);
        }
        if (window.location.href.includes('evn')) {
            erp.push(1);
        }
        if (window.location.href.includes('stp_hour_reading')) {
            metering_type = 'stp_hour_readings';
        }

    } else {
        var [
            fromDate,
            toDate,
            name,
            clientID,
            erp,
            metering_type,
            profile_name
        ] = arr;
    }

    if (fromDate == '') {
        fromDate = -1;
    }
    if (toDate == '') {
        toDate = -1;
    }
    if (name == '') {
        name = -1;
    }
    if (clientID == '') {
        clientID = -1;
    }

    let url = `/api/filter/inquiry-readings/`;
    notification('Loading...', 'loading');
    $.ajax({
        url,
        method: 'POST',
        data: {
            fromDate,
            toDate,
            name,
            ident_code: clientID,
            erp,
            metering_type,
            profile_name
        },
        async: false,
        dataType: 'json',
        success: function (data) {
            if (data != '') {
                initialCalendarDate = new Date(data[0].date);
                window.location.href.includes('stp_hour_readings') ? client.setMeteringType(2) : client.setMeteringType(1)
                showReadingsChart(data);
                calendarData = getReadingsDataForCalendar(data);
                addReadingsToTable(calendarData);
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    toastr.clear();
    return calendarData;
};

function addReadingsToTable(data) {
    let allReadings = [];
    let currRow;
    let currentStartDate;
    let currentEndDate;
    let firstRow = [];

    function renderRowsTable() {

        allReadings.push(['Идентификационен код', 'Мерене', 'Дата от', 'Дата до'])
        for (let el of data) {
            currentStartDate = new Date(el.start);
            currentEndDate = new Date(el.end);
            currRow = [];
            currRow
                .push(el.id,
                    el.title,
                    `${currentStartDate.getFullYear()}-${currentStartDate.getMonth()+1}-${currentStartDate.getDate()} : ${currentStartDate.getHours()}:00 ч.`,
                    `${currentEndDate.getFullYear()}-${currentEndDate.getMonth()+1}-${currentEndDate.getDate()} : ${currentEndDate.getHours()}:00 ч.`)
            allReadings.push(currRow);
        }
    }

    function renderColsTable() {
        let firstDate = new Date(data[0].start);
        const firstDateFormatted = `${firstDate.getFullYear()}-${firstDate.getMonth()+1}-${firstDate.getDate()} : ${firstDate.getHours()}:00 ч.`;
        firstRow.push('Идентификационен код', firstDateFormatted);
        let repeatCounter = 0;
        for (let i = 1; i < data.length; i += 1) {
            let currentStartDate = new Date(data[i].start);
            if (currentStartDate.getFullYear() == firstDate.getFullYear() &&
                currentStartDate.getMonth() == firstDate.getMonth() &&
                currentStartDate.getDate() == firstDate.getDate() &&
                currentStartDate.getHours() == firstDate.getHours()) {
                repeatCounter += 1;
                if (repeatCounter > 1) {
                    break;
                }
            }

            let formattedStartDate = `${currentStartDate.getFullYear()}-${currentStartDate.getMonth()+1}-${currentStartDate.getDate()} : ${currentStartDate.getHours()}:00 ч.`;
            firstRow.push(formattedStartDate);
        }
        allReadings.push(firstRow);
        let firstRowLength = firstRow.length - 1;
        let counter = 0;
        let currentID = data[0].id;
        let currentRow = [];
        for (let obj of data) {
            let newID = obj.id;
            let currValue = obj.title;
            currentRow.push(currValue);
            counter += 1;
            if (counter % firstRowLength == 0 && counter != 0) {
                allReadings.push(currentRow);
                currentRow.unshift(currentID);
                currentRow = [];
                currentID = newID;
            }
        }
    }
    renderColsTable();
    initializeHandsOnTable(allReadings);
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
    $('#info > div.container.clients.text-center > div.readings-graph-div').prepend(chartDailyPeriod);
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
                    if (index >= 2) {
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
    if (labelsNoDuplicates.length != labels.length) {
        tempActualArr = sumValuesForDifferentClients(tempActualArr);
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

function getReadingsDataForCalendar(data) {
    const beginningIndexOfIterator = 2;
    let dataArr = [];
    let currHourReading = [];

    for (let el in data) {
        currHourReading = [];
        let currHourDate = new Date(data[el].date);
        let objVals = Object.values(data[el]);
        let iterator = 0;
        const color = randomProperty(colors)
        for (let val of objVals) {
            if (iterator >= beginningIndexOfIterator) {
                currHourReading = {
                    id: data[el].ident_code,
                    title: val,
                    start: Number(currHourDate),
                    end: Number(currHourDate) + 3600000,
                    backgroundColor: color
                }
                dataArr.push(currHourReading);
                incrementHoursOne(currHourDate);
            }
            iterator += 1;
        }
    }
    return dataArr;
}

var randomProperty = function (obj) {
    var keys = Object.keys(obj)
    return obj[keys[keys.length * Math.random() << 0]];
};

function getThisAndLastMonthDates() {
    let today = new Date();
    let thisMonthDate = `${today.getFullYear()}-${Number(today.getMonth())+1}-${today.getDay()}`;
    let lastMonthDate = `${today.getFullYear()}-${Number(today.getMonth())}-${today.getDay()}`;
    if (Number(today.getMonth()) - 1 === -1) {
        lastMonthDate = `${Number(today.getFullYear())-1}-${Number(today.getMonth())+12}-${today.getDay()}`;
    }
    return [thisMonthDate, lastMonthDate];
}

function removeDuplicatesFromArr(arr) {
    let uniqueNames = [];
    $.each(arr, function (i, el) {
        if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
    });
    return uniqueNames;
}

function notification(msg, type) {
    toastr.clear();
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    if (type == 'error') {
        toastr.error(msg);
    } else if (type == 'success') {
        toastr.success(msg);
    } else if (type == 'loading') {
        toastr.info(msg);
    }
};

function visualizeAllInputFromGetParams() {
    visualizeCheckboxesFromHistoryLocation();
    visualizeInputFromGetParams();
}

function visualizeInputFromGetParams() {
    findGetParameter('fromDate') === null ? '' : $('#fromDate').val(findGetParameter('fromDate'));
    findGetParameter('toDate') === null ? '' : $('#toDate').val(findGetParameter('toDate'));
    findGetParameter('name') === null ? '' : $('#nameOfClient').val(findGetParameter('name'));
    findGetParameter('clientID') === null ? '' : $('#clientID').val(findGetParameter('clientID'));
    findGetParameter('erp') === null ? '' : $('#erp').val(findGetParameter('erp'));
    findGetParameter('profile_name') === null ? '' : $('#profile_name').val(findGetParameter('profile_name'));
}

function visualizeCheckboxesFromHistoryLocation() {
    const location = window.location.href;
    if (!location.includes('energoPRO')) {
        $('#energoPRO').prop('checked', false);
    }
    if (!location.includes('cez')) {
        $('#cez').prop('checked', false);
    }
    if (!location.includes('evn')) {
        $('#evn').prop('checked', false);
    }
    if (location.includes('stp_hour_readings')) {
        $('#stp_hour_readings').prop('checked', true);
    } else {
        $('#hour_readings').prop('checked', true);
    }
}

function hideSwitch() {
    $('#info > div.container.clients.text-center > div.row > div.offset-md-6 > label').css('display', 'none');
}

function sumValuesForDifferentClients(tempActualArr) {
    let sumArr = [];
    for (let i = 0; i < tempActualArr.length; i += 1) {
        const currDateObj = new Date(tempActualArr[i].t);
        const normalDate = `${currDateObj.getFullYear()}, ${currDateObj.getMonth()}, ${currDateObj.getDate()}, ${currDateObj.getHours()-1}`;
        const currObj = {
            t: normalDate,
            y: tempActualArr[i].y
        };
        const searchedObj = processSumValues(normalDate, sumArr, tempActualArr[i].y);
        if (!searchedObj) {
            sumArr.push(currObj);
        }
    }

    for (let x = 0; x < sumArr.length; x += 1) {
        const dateElements = sumArr[x].t.split(', ');
        sumArr[x].t = new Date(dateElements[0], dateElements[1], dateElements[2], dateElements[3]);
    }

    return sumArr;
}

function processSumValues(nameKey, myArray, sumValue) {
    for (let i = 0; i < myArray.length; i++) {
        if (myArray[i].t === nameKey) {
            return myArray[i].y += sumValue;
        }
    }
    return false;
}