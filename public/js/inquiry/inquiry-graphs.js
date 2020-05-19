;
$(document).ready(function () {
    renderInfo();
    hideGraph();
    visualizeAllInputFromGetParams();
    getInitialDataListings();
});

(function removeDataTableEvent() {
    $('#hide_dataTable').click(() => {
        $('#handsontable-predictions').css('display', 'none');
        $('#hide_dataTable').addClass('animated-push-btn');
        $('#show_dataTable').removeClass('animated-push-btn');
    });
}());

(function addDataTableEvent() {
    $('#show_dataTable').click(() => {
        $('#handsontable-predictions').css('display', 'block');
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

(function switchPredictionsCalendarAndGraph() {
    $('#switch-calendar-predictions').on('click', () => {
        if ($('#calendar-predictions').css('display') == 'block') {
            $('#calendar-predictions').css("display", "none");
            $('.readings-prediction-div').css("display", "block");
            $('#info > div.container.clients.text-center > div.row > div.offset-md-6 > label')
                .css('display', 'block')
        } else {
            $(".readings-prediction-div").css("display", "none");
            $('#calendar-predictions').css("display", "block");
            $('#info > div.container.clients.text-center > div.row > div.offset-md-6 > label')
                .css('display', 'none');
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
    $('.readings-prediction-div').css('display', 'none');
    $('body > div.container.mt-3 > div.container.clients.text-center > div.row > div.offset-md-6 > label')
        .css('display', 'none');
}

function showCalendar() {
    $('#calendar-predictions').css('display', 'block');
}

function incrementHoursOne(date) {
    return new Date(date.setHours(date.getHours() + 1));
}

function getDataListings() {
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
    $('#idList option').remove();
    for (let name of clientNames) {
        $('#stp-hour-predictions-clients').append(`<option value="${name}"></option>`);
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
    getPredictions([fromDate, toDate, nameOfClient, clientID, profile_name]);
    showCalendar();
});
let initialCalendarDate = new Date();
document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar-predictions');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        eventLimit: true,
        eventLimit: 1,
        eventLimitText: 'Има график',
        eventLimitClick: 'day',
        allDaySlot: false,
        eventOrder: 'groupId',
        events: getPredictions(),
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

function getPredictions(arr) {
    let calendarData = [];
    if (!arr) {
        var name = findGetParameter('name');
        var fromDate = findGetParameter('fromDate');
        var toDate = findGetParameter('toDate');
        var clientID = findGetParameter('clientID');
        var profile_name = findGetParameter('profile_name');
        var erp = []
        var metering_type = findGetParameter('predictions');
        if (window.location.href.includes('energoPRO')) {
            erp.push(3);
        }
        if (window.location.href.includes('cez')) {
            erp.push(2);
        }
        if (window.location.href.includes('evn')) {
            erp.push(1);
        }
        if (window.location.href.includes('profile_coef')) {
            metering_type = 'profile_coef';
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
    let url = `/api/filter/inquiry-graphs/`;
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
                window.location.href.includes('profile_coef') ? client.setMeteringType(2) : client.setMeteringType(1)
                showGraphsChart(data);
                calendarData = getPredictionDataForCalendar(data);
              //  addPredictionsToTable(calendarData);
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    toastr.clear();
    return calendarData;
};

function addPredictionsToTable(data) {
    let allReadings = [];
    let currRow;
    let currentStartDate;
    let currentEndDate;
    let firstRow = [];
    const multipleClients = $('#clientID').val() == '';
    function renderRowsTable() {

        allReadings.push(['Идентификационен код', 'График', 'Дата от', 'Дата до'])
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
                if (multipleClients) {
                    break;
                }
                repeatCounter += 1;
                if (repeatCounter > 1) {
                    break;
                }
            }
            let formattedStartDate = `${currentStartDate.getFullYear()}-${currentStartDate.getMonth()+1}-${currentStartDate.getDate()} : ${currentStartDate.getHours()}:00 ч.`;
            firstRow.push(formattedStartDate);
        }
        allReadings.push(firstRow);
        let currentID = data[0].id;
        let currentRow = [];
        let firstRowLength = firstRow.length - 1;
        let counter = 0;
        for (let i = 0; i < data.length; i += 1) {
            let newID = '';
            try {
                newID = data[i + 1].id;
            } catch (err) {
                newID = data[i].id;
            }
            let currValue = data[i].title;
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

function initializeHandsOnTable(data) {
    var container = document.getElementById('handsontable-predictions');
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
        const filename = $('#table-input').val() || 'excel-predictions';
        exportPlugin.downloadFile('csv', {
            filename
        });
    })
};

function writeDailyPeriodHeading(firstDate, secondDate) {
    const formattedFirstDate = formatDate(firstDate);
    let chartDailyPeriod = '';
    if (secondDate === null) {
        chartDailyPeriod = $(`<h3 class="text-center mb-3">Дата: ${formattedFirstDate}<h3>`);
    } else {
        const formattedSecondDate = formatDate(secondDate);
        chartDailyPeriod = $(`<h3 class="text-center mb-3">От: ${formattedFirstDate} До: ${formattedSecondDate}<h3>`);
    }
    $('#info > div.container.clients.text-center > div.readings-prediction-div').prepend(chartDailyPeriod);
}

function showGraphsChart(data) {

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
    let actualHourData = [];

    let tempActualArr = [];
    let index = 0;
    let dataIterator = 0;

    if (data != undefined) {
        if (findGetParameter('fromDate') == findGetParameter('toDate') && findGetParameter('fromDate')) {
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
                            y: valuesData[indexActualData] == -1 ? 0 : client.getMeteringType() == 2 ? (valuesData[indexActualData]).toFixed(3) : valuesData[indexActualData]
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
                            y: data[el][hr] == -1 ? 0 : client.getMeteringType() == 2 ? (data[el][hr]).toFixed(3) : data[el][hr]
                        }
                        tempActualArr.push(hourObj);
                        labels.push(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} - ${t.getHours()}ч.`);
                        t = incrementHoursOne(date);
                    }
                    index += 1;
                }
                index = 0;
                dataIterator += 1;
            }
        }
    }
    let labelsNoDuplicates = removeDuplicatesFromArr(labels);
    if (labelsNoDuplicates.length != labels.length) {
        tempActualArr = sumValuesForDifferentClients(tempActualArr);
    }
    var ctx = document.getElementById('predictions-chart').getContext('2d');
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

function getPredictionDataForCalendar(data) {
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
                    title: val == -1 ? 0 : client.getMeteringType() == 2 ? val.toFixed(3) : val,
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
    let sumOfAllArrs = [];
    let dataArrSorted = dataArr.sort((a, b) => (a.start > b.start) ? 1 : -1);
    const clonedDataArr = [...dataArr];
    let sortedClients = clonedDataArr.sort((a, b) => {
        return sortClientsByIDThenByDate(a, b);
    });
    addPredictionsToTable(sortedClients);

    let currReading;
    let currStart;
    let iterationsCount = 0;
    let y = 1;

    for (let i = 0; i < dataArrSorted.length; i += 1) {
        currStart = dataArrSorted[i].start;
        currReading = {
            id: dataArrSorted[i].id,
            title: dataArrSorted[i].title,
            start: dataArrSorted[i].start,
            end: dataArrSorted[i].end,
            backgroundColor: colors.blue
        }
        if (dataArrSorted[i + y]) {
            while (currStart == dataArrSorted[i + y].start) {
                currStart = dataArrSorted[i + y].start;
                currReading.title += dataArrSorted[i + y].title;
                y += 1;
                iterationsCount += 1;
                if (!dataArrSorted[i + y]) {
                    break;
                }
            }
        }
        i += iterationsCount;
        iterationsCount = 0;
        y = 1;
        sumOfAllArrs.push(currReading);
    }
    return sumOfAllArrs;
}

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
    if (location.includes('profile_coef')) {
        $('#profile_coef').prop('checked', true);
    } else {
        $('#hour_prediction').prop('checked', true);
    }
}

function hideSwitch() {
    $('#info > div.container.clients.text-center > div.row > div.offset-md-6 > label').css('display', 'none');
}

function sumValuesForDifferentClients(tempActualArr) {
    let sumArr = [];
    for (let i = 0; i < tempActualArr.length; i += 1) {
        const currDateObj = new Date(tempActualArr[i].t);
        const normalDate = `${currDateObj.getFullYear()}, ${currDateObj.getMonth()}, ${currDateObj.getDate()}, ${currDateObj.getHours()}`;
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

(function filterClientIdentCodesOnInputChange() {
    $('#nameOfClient').on('change', () => {
        const clientName = $('#nameOfClient').val();
        getClientIdentCodeListings(clientName);
    });
}());

function getClientIdentCodeListings(clientName) {
    $.ajax({
        url: `/api/data-listings/ident-codes/${clientName}`,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            visualizeClientIdentCodes(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            getDataListings();
            console.log(errorThrown);
        }
    });
}

function visualizeClientIdentCodes(data) {
    $('#idList').remove();
    let identCodesDataListing = $('<datalist id="idList" >');
    let identCodes = [];
    for (let obj of data) {
        identCodes.push(obj.ident_code);
    }
    const filteredIdentCodes = identCodes.filter((v, i, a) => a.indexOf(v) === i);

    for (let identCode of filteredIdentCodes) {
        let currIdentCode = $(`<option>${identCode}</option>`);
        currIdentCode.appendTo(identCodesDataListing);
    }
    identCodesDataListing.append('</datalist>');
    $('#clientID').append(identCodesDataListing);
}

function getInitialDataListings() {
    const clientNameVal = $('#nameOfClient').val();
    if (clientNameVal) {
        getDataListings();
        getClientIdentCodeListings(clientNameVal);
    } else {
        getDataListings();
    }
}