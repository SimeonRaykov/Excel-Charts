;
$(document).ready(function () {
    renderInfo();
    hideGraph();
    visualizeAllInputFromGetParams();
    getDataListing();
});

function renderInfo() {
    $('body > div.container.mt-3 > ul > li:nth-child(1) > a').click();
}

(function removeDataTableEvent() {
    $('#hide_dataTable').click(() => {
        $('#handsontable-imbalances').css('display', 'none');
        $('#hide_dataTable').addClass('animated-push-btn');
        $('#show_dataTable').removeClass('animated-push-btn');
    });
}());

(function addDataTableEvent() {
    $('#show_dataTable').click(() => {
        $('#handsontable-imbalances').css('display', 'block');
        $('#show_dataTable').addClass('animated-push-btn');
        $('#hide_dataTable').removeClass('animated-push-btn');
    });
}());


function initializeHandsOnTable(data) {
    console.log(data);
    var container = document.getElementById('handsontable-imbalances');
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
        const filename = $('#table-input').val() || 'excel-imbalances';
        exportPlugin.downloadFile('csv', {
            filename
        });
    })
};

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

(function switchImbalanceCalendarAndGraph() {
    $('#switch-calendar-graph').on('click', () => {
        if ($('#calendar-imbalance').css('display') == 'block') {
            $('#calendar-imbalance').css("display", "none");
            $('div.imbalance-graph-div').css("display", "block");
            $('#info > div.container.clients.text-center > div.row > div.offset-md-6 > label')
                .css('display', 'block')
        } else {
            $("div.imbalance-graph-div").css("display", "none");
            $('#info > div.container.clients.text-center > div.row > div.offset-md-6 > label')
                .css('display', 'none')
            $('#calendar-imbalance').css("display", "block");

        }
    })
})();

const colors = {
    blue: '#aa62ea',
    red: '#ff4d4d'
}

function hideGraph() {
    $('.imbalance-graph-div').css('display', 'none');
    $('#info > div.container.clients.text-center > div.row > div.offset-md-6 > label')
        .css('display', 'none');
}

function showCalendar() {
    $('#calendar-imbalance').css('display', 'block');
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
    let clientIds = arr[1]
    for (let name of clientNames) {
        $('#stp-hour-readings-clients').append(`<option value="${name}"></option>`);
    }

    for (let ID of clientIds) {
        $('#idList').append(`<option value="${ID}"></option>`);
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
    getImbalances([fromDate, toDate, nameOfClient, clientID]);
    showCalendar();
});

document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar-imbalance');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        eventLimit: true,
        eventLimit: 1,
        eventLimitText: 'Има небаланс',
        eventLimitClick: 'day',
        allDaySlot: false,
        eventOrder: 'groupId',
        events: getImbalances(),
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

function getImbalances(arr) {
    let calendarData = [];
    if (!arr) {
        var name = findGetParameter('name');
        var fromDate = findGetParameter('fromDate');
        var toDate = findGetParameter('toDate');
        var clientID = findGetParameter('clientID');
        var erp = []
        var metering_type = 'stp_imbalances';
        if (window.location.href.includes('energoPRO')) {
            erp.push(3);
        }
        if (window.location.href.includes('cez')) {
            erp.push(2);
        }
        if (window.location.href.includes('evn')) {
            erp.push(1);
        }
        if (window.location.href.includes('hourly_imbalances')) {
            metering_type = 'hourly_imbalances';
        }

    } else {
        var [
            fromDate,
            toDate,
            name,
            clientID,
            erp,
            metering_type
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
    let url = `/api/filter/calculate-imbalances/`;
    let isFirst = !window.location.href.includes('?');
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
            metering_type
        },
        async: false,
        dataType: 'json',
        success: function (data) {
            window.location.href.includes('stp_imbalances') ? client.setMeteringType(2) : client.setMeteringType(1)
            showImbalanceChart(data);
            calendarData = calculateImbalances(data);
            addImbalancesToTable(calendarData);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    toastr.clear();
    return calendarData;
};

function addImbalancesToTable(data) {
    let allReadings = [];
    let currRow;
    let currentStartDate;
    let currentEndDate;
    let firstRow = [];

    function renderRowsTable() {

        allReadings.push(['Идентификационен код', 'Небаланс', 'Дата от', 'Дата до'])
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
        let firstID = data[0].id;
        let firstDate = new Date(data[0].start);
        const firstDateFormatted = `${firstDate.getFullYear()}-${firstDate.getMonth()+1}-${firstDate.getDate()} : ${firstDate.getHours()}:00 ч.`;
        firstRow.push('Идентификационен код', firstDateFormatted);
        for (let i = 1; i < data.length; i += 1) {
            let currentStartDate = new Date(data[i].start);
            if (currentStartDate.getFullYear() == firstDate.getFullYear() &&
                currentStartDate.getMonth() == firstDate.getMonth() &&
                currentStartDate.getDate() == firstDate.getDate() &&
                currentStartDate.getHours() == firstDate.getHours()) {
                break;
            }
            let formattedStartDate = `${currentStartDate.getFullYear()}-${currentStartDate.getMonth()+1}-${currentStartDate.getDate()} : ${currentStartDate.getHours()}:00 ч.`;
            firstRow.push(formattedStartDate);
        }
        allReadings.push(firstRow);

        let currentID = data[0].id;
        let currentRow = [];
        for (let obj of data) {
            let newID = obj.id;
            if (newID != currentID) {
                allReadings.push(currentRow);
                currentRow.unshift(currentID);
                currentRow = [];
                currentID = newID;
            }
            let currValue = obj.title;
            currentRow.push(currValue);
        }
    }
    renderRowsTable();
    initializeHandsOnTable(allReadings);
}

function showImbalanceChart(data) {
    let labels = [];
    let actualHourData = [];
    let predictionData = [];
    let imbalancesData = [];

    let tempActualArr = [];
    let tempPredictionArr = [];
    let tempImbalances = [];

    let index = 0;
    let dataIterator = 0;

    if (data != undefined) {
        if (true /*data.length == 1*/ ) {
            for (let el in data) {
                const startingIndexActualHourData = client.getMeteringType() == 2 ? 3 : 2;
                let indexActualData = client.getMeteringType() == 2 ? 3 : 2;
                let indexPrediction = client.getMeteringType() == 2 ? 27 : 26;
                const endIndexPrediction = client.getMeteringType() == 2 ? 50 : 49;
                const finalIndex = client.getMeteringType() == 2 ? 26 : 25;
                const amount = data[el]['amount'] || 1;
                let date = new Date(data[el]['date']);
                let isManufacturer = data[el]['is_manufacturer'];
                let valuesData = Object.values(data[el]);
                let t = date;
                for (let val of valuesData) {
                    if (index >= startingIndexActualHourData && index <= endIndexPrediction) {
                        if (index > finalIndex) {
                            break;
                        }
                        const currImbalance = calcImbalance(isManufacturer, (valuesData[indexPrediction] * amount), valuesData[indexActualData]);
                        let actualHourObj = {
                            t,
                            y: valuesData[indexActualData]
                        }
                        if (actualHourObj.y != undefined) {
                            tempActualArr.push(actualHourObj);
                        }

                        let predictionObj = {
                            t,
                            y: valuesData[indexPrediction]
                        }
                        if (predictionObj.y != undefined) {
                            tempPredictionArr.push(predictionObj);
                        }

                        let imbalanceData = {
                            t,
                            y: currImbalance
                        }
                        if (imbalanceData.y != undefined) {
                            tempImbalances.push(imbalanceData);
                        }

                        indexActualData += 1;
                        indexPrediction += 1;
                        labels.push(`${t.getHours()} ч.`);
                        t = incrementHoursOne(date);
                    }
                    index += 1;
                }
                index = 0;
            }
        } else if (false) {
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
                        actualHourData.push(hourObj);
                    }
                    index += 1;
                }
                index = 0;
                dataIterator += 1;
            }
        }
    }

    let sumOfAllReadingsActual = [];
    let sumOfAllPredictions = [];
    let sumOfAllImbalances = [];

    let actualDataSorted = tempActualArr.sort((a, b) => (a.t > b.t) ? 1 : -1);
    let predictionDataSorted = tempPredictionArr.sort((a, b) => (a.t > b.t) ? 1 : -1);
    let imbalancesDataSorted = tempImbalances.sort((a, b) => (a.t > b.t) ? 1 : -1);

    let currReadingActual;
    let currReadingPrediction;
    let currReadingImbalance;

    let currStart;
    let iterationsCount = 0;
    let y = 1;

    for (let i = 0; i < actualDataSorted.length; i += 1) {
        currStart = actualDataSorted[i].t;
        currReadingActual = {
            t: actualDataSorted[i].t,
            y: actualDataSorted[i].y
        }
        currReadingPrediction = {
            t: predictionDataSorted[i].t,
            y: predictionDataSorted[i].y
        }

        currReadingImbalance = {
            t: imbalancesDataSorted[i].t,
            y: imbalancesDataSorted[i].y
        }

        if (actualDataSorted[i + y]) {
            while (currStart.getHours() == actualDataSorted[i + y].t.getHours() &&
                currStart.getDate() == actualDataSorted[i + y].t.getDate() &&
                currStart.getFullYear() == actualDataSorted[i + y].t.getFullYear() &&
                currStart.getMonth() == actualDataSorted[i + y].t.getMonth()) {
                currStart = actualDataSorted[i + y].t;
                currReadingActual.y += actualDataSorted[i + y].y;
                currReadingPrediction.y += predictionDataSorted[i + y].y;
                currReadingImbalance.y += imbalancesDataSorted[i + y].y;
                y += 1;
                iterationsCount += 1;
                if (!actualDataSorted[i + y]) {
                    break;
                }
            }
        }
        i += iterationsCount;
        iterationsCount = 0;
        y = 1;
        sumOfAllReadingsActual.push(currReadingActual);
        sumOfAllPredictions.push(currReadingPrediction);
        sumOfAllImbalances.push(currReadingImbalance);
    }
    let labelsNoDuplicates = removeDuplicatesFromArr(labels);
    var ctx = document.getElementById('imbalance-chart').getContext('2d');
    var config = {
        type: 'line',
        data: {
            labels: labelsNoDuplicates,
            datasets: [{
                label: 'Настоящи',
                data: sumOfAllReadingsActual,
                borderWidth: 2,
                backgroundColor: "rgb(255,99,132)",
                borderColor: "#ac3f21"
            }, {
                label: 'Прогнози',
                data: sumOfAllPredictions,
                borderWidth: 2,
                backgroundColor: "#9c1de7",
                borderColor: "#1e2a78",
                hidden: true
            }, {
                label: 'Небаланс',
                data: sumOfAllImbalances,
                borderWidth: 2,
                backgroundColor: "#f3f169",
                borderColor: "#ffd615",
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

function calculateImbalances(data) {
    const beginningIndexOfIterator = 2;
    const endIndexOfIterator = 26;
    let dataArr = [];
    let currHourReading = [];

    for (let el in data) {
        currHourReading = [];
        const amount = data[el]['amount'] || 1;
        let currHourDate = new Date(data[el].date);
        let currHourReadingVal = 2;
        let currHourPredictionVal = 26;
        let objVals = Object.values(data[el]);
        let iterator = 0;
        let isManufacturer = data[el]['is_manufacturer'];

        for (let val of objVals) {
            if (iterator >= beginningIndexOfIterator && iterator < endIndexOfIterator) {
                const currImbalance = calcImbalance(isManufacturer, (objVals[currHourPredictionVal] * amount), objVals[currHourReadingVal]);
                currHourReading = {
                    id: iterator,
                    title: currImbalance,
                    start: Number(currHourDate),
                    end: Number(currHourDate) + 3600000,
                    backgroundColor: colors.blue
                }
                dataArr.push(currHourReading);
                incrementHoursOne(currHourDate);
                currHourReadingVal += 1;
                currHourPredictionVal += 1;
            }
            iterator += 1;
        }
    }
    let sumOfAllArrs = [];
    let dataArrSorted = dataArr.sort((a, b) => (a.start > b.start) ? 1 : -1);
    let currReading;
    let currStart;
    let iterationsCount = 0;
    let y = 1;
    let idCounter = 1;
    for (let i = 0; i < dataArrSorted.length; i += 1) {
        currStart = dataArrSorted[i].start;
        currReading = {
            id: idCounter++,
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
        //  console.log(sumOfAllArrs);
        sumOfAllArrs.push(currReading);
    }
    return sumOfAllArrs;
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
    if (!location.includes('hourly_imbalances')) {
        $('#stp_imbalances').prop('checked', true);
        //   $('#hourly_imbalances').prop('checked',false);
    } else {
        $('#hourly_imbalances').prop('checked', true);
        // $('#stp_imbalances').prop('checked',false);
    }
}

function calcImbalance(isManufacturer, predictionVal, actualVal) {
    return isManufacturer == 0 ? predictionVal - actualVal : actualVal - predictionVal;
}