$(document).ready(function () {
    hideGraphs();
    getAllCharts();
    visualizeAllDefaultInputs();
    visualizeChartsAutomatically();
    getProfileHistory();
});

const readingTypes = {
    STP_HOUR_READING: 'stp-hour-reading',
    HOUR_READING: 'hour-reading',
    STP_GRAPH_HOUR_READING: 'stp-graph-hour-prediction',
    GRAPH_HOUR_READING: 'graph-hour-prediction'
}

let _IS_EXECUTED = false;

class Client {
    constructor() {
        this.meteringType = '';
        this.name = '';
        this.ident_code = '';
    }
    getName() {
        return this.name;
    }
    getIdentCode() {
        return this.ident_code;
    }
    getMeteringType() {
        return this.meteringType;
    }

    setMeteringType(meteringType) {
        return this.meteringType = meteringType;
    }
    setName(name) {
        return this.name = name;
    }
    setIdentCode(ident_code) {
        return this.ident_code = ident_code;
    }
}

client = new Client();

(function addSearchEventToGraphHourReading() {
    $('#searchBtnHourlyGraph').on('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        $('#hour-readings > div.hour-readings-graph-div > form > h3').remove();
        const fromDate = document.querySelector('input[name=fromDate]').value;
        const toDate = document.querySelector('input[name=toDate]').value;
        getHourReadingsChartFilterData(fromDate, toDate, getClientID());
    })
}());

(function addSearchBTNEventToGraphPredictions() {
    $('#searchBtnGraphPrediction').on('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        $('#graph > div.graph-prediction-div > form h3').remove();
        const fromDate = document.querySelector('input[name=fromDateGraphPrediction]').value;
        const toDate = document.querySelector('input[name=toDateGraphPrediction]').value;
        getGraphPredictionsFilterData(fromDate, toDate, getClientID());
    })
}());

(function addSearchBTNEventToImbalances() {
    $('#searchBtnGraphImbalance').on('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        $('#imbalance > div.imbalance-graph-div > form h3').remove();
        const fromDate = document.querySelector('input[name=fromDateImbalanceGraph]').value;
        const toDate = document.querySelector('input[name=toDateImbalanceGraph]').value;
        getImbalancesChartFilterData(fromDate, toDate, getClientID());
    });
}());

(function updateBTNEvent() {
    $('#info > div > div.card-body > button.btn-lg.btn-warning.pull-right.mr-5.mb-2').on('click', () => {
        saveChangesForSTPClient();
    });
}());

function getInputValsForInfoPage() {
    const name = $('#info div:nth-child(1) > input').val();
    const profileName = $('#input-profile-name').val();
    const isManufacturer = $('#squaredThree').prop('checked') === true ? 1 : 0;
    return {
        name,
        profileName,
        isManufacturer
    };
}

function getDatalistingOptions(operator) {
    $.ajax({
        url: `/api/getClientSTP/details/datalist/${operator}`,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            visualizeDataListings(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

var visualizeDataListings = function (data) {
    return function () {
        if (!_IS_EXECUTED) {
            _IS_EXECUTED = true;
            const profileName = document.querySelectorAll('select')[0].value;
            for (let el in data) {
                if (data[el]['profile_name'] != undefined && data[el]['profile_name'] != null && data[el]['profile_name'] != '') {
                    if (data[el]['profile_name'] != profileName) {
                        const curr = $(`<option data-id="${data[el]['id']}" value="${data[el]['profile_name']}">${data[el]['profile_name']}</option>`)
                        curr.appendTo('#input-profile-name');
                    }
                }
            }
        }
    }()
}

function saveChangesForSTPClient() {
    let clientID = getClientID()
    setTimeout(function () {
        let {
            name,
            isManufacturer,
            profileName
        } = getInputValsForInfoPage();

        validateProfileName(profileName)
        $.ajax({
            url: `/api/saveClientSTPChanges/details/${clientID}`,
            method: 'POST',
            dataType: 'json',
            data: {
                isManufacturer,
                profileName,
                name
            },
            success: function () {
                notification('Клиентът е успешно променен', 'success');
                setTimeout(() => {
                    refreshURL()
                }, 1000);
            },
            error: function (jqXhr, textStatus, errorThrown) {
                if (jqXhr.status === 200) {
                    notification('Клиентът е успешно променен', 'success');
                    setTimeout(() => {
                        refreshURL()
                    }, 1000);
                } else {
                    notification('Възникна грешка при променяне на клиента!', 'error');
                }
            }
        });
    }, 0);
}

function getClientInfo() {
    let clientID = getClientID();
    let dataArr = [];
    $.ajax({
        url: `/api/getClientInfo/${clientID}`,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            if (data) {
                client.setName(data['client_name']);
                client.setIdentCode(data['ident_code']);
                setMeteringType(data['metering_type']);
                visualizeClientInfo(data);
                getDatalistingOptions(data['erp_type']);
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    return dataArr;
}

function setMeteringType(data) {
    client.setMeteringType(data);
}

function getHourReadingsChartFilterData(fromDate, toDate, clientID) {
    if (fromDate == '') {
        fromDate = -1;
    }
    if (toDate == '') {
        toDate = -1;
    }
    let url = client.getMeteringType() == 2 ? `/api/stp-hour-readings/${fromDate}/${toDate}/${clientID}` :
        `/api/hour-readings/${fromDate}/${toDate}/${clientID}`;
    $.ajax({
        url,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            showHourReadingChart(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function getGraphPredictionsFilterData(fromDate, toDate, clientID) {
    if (fromDate == '') {
        fromDate = -1;
    }
    if (toDate == '') {
        toDate = -1;
    }
    let url = client.getMeteringType() == 2 ? `/api/stp-graph-predictions/${fromDate}/${toDate}/${clientID}` :
        `/api/graph-predictions/${fromDate}/${toDate}/${clientID}`;

    $.ajax({
        url,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            showGraphPredictionChart(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function getImbalancesChartFilterData(fromDate, toDate, clientID) {
    if (fromDate == '') {
        fromDate = -1;
    }
    if (toDate == '') {
        toDate = -1;
    }
    let url = client.getMeteringType() == 2 ? `/api/stp-imbalances/getClient/${fromDate}/${toDate}/${clientID}` :
        `/api/imbalances/getClient/${fromDate}/${toDate}/${clientID}`;
    $.ajax({
        url,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            showImbalanceChart(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function showHourReadingChart(data) {
    if (data != '') {
        const maxDate = getMaxDate(data);
        const minDate = getMinDate(data);
        const equalDates = checkIfDatesAreEqual(maxDate, minDate);
        if (equalDates) {
            writeDailyPeriodHeading(maxDate, null, 'reading');
        } else {
            writeDailyPeriodHeading(minDate, maxDate, 'reading');
        }
    }
    let _IS_MULTIPLE_DAYS_READINGS_CHART = false;
    let labels = [];
    let chartData = [];
    let index = 0;
    if (data != undefined) {
        if (data.length == 1) {
            _IS_MULTIPLE_DAYS_READINGS_CHART = false;
            for (let el in data) {
                let date = new Date(data[el]['date']);
                for (let hr in data[el]) {
                    if (index >= 2) {
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
            _IS_MULTIPLE_DAYS_READINGS_CHART = true;
            for (let el in data) {
                let date = new Date(data[el]['date']);
                //  labels.push(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`);
                for (let hr in data[el]) {
                    if (index >= 2) {
                        let t = index == 2 ? date : incrementHoursOne(date)
                        let hourObj = {
                            t,
                            y: (Number(data[el][hr]) / 1000).toFixed(7)
                        }
                        chartData.push(hourObj);
                        labels.push(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} - ${t.getHours()}ч.`);
                    }
                    index += 1;
                }
                index = 0;
            }
        }
    }

    var ctx = document.getElementById('hour-readings-chart').getContext('2d');
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
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        return "Стойност: " + tooltipItem.yLabel + '\n';
                    },
                }
            },
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
    try {
        HourReadingsChart.destroy();
    } catch (e) {}

    HourReadingsChart = new Chart(ctx, config);

    $('#hour-readings > div.hour-readings-graph-div > form > div > div:nth-child(4) > label > input').click((e) => {
        var temp = jQuery.extend(true, {}, config);

        if (HourReadingsChart.config.type == 'line') {
            temp.type = 'bar';
        } else {
            temp.type = 'line';
        }
        setTimeout(function () {
            HourReadingsChart.destroy();
            HourReadingsChart = new Chart(ctx, temp)
        }, 0)
    })
}

function showGraphPredictionChart(data) {
    if (data != '') {
        const maxDate = getMaxDate(data);
        const minDate = getMinDate(data);
        const equalDates = checkIfDatesAreEqual(maxDate, minDate);
        if (equalDates) {
            writeDailyPeriodHeading(maxDate, null, 'graph');
        } else {
            writeDailyPeriodHeading(minDate, maxDate, 'graph');
        }
    }
    let _IS_MULTIPLE_DAYS_GRAPHS_CHART = false;
    let labels = [];
    let chartData = [];
    let index = 0;
    if (data != undefined) {
        if (data.length == 1) {
            _IS_MULTIPLE_DAYS_GRAPHS_CHART = false;
            for (let el in data) {
                let amount = data[el]['amount'];
                if (amount == null || amount == undefined) {
                    amount = 1;
                }

                let date = new Date(data[el]['date']);
                for (let hr in data[el]) {
                    if (index >= 2 && index <= 25) {
                        let t = index == 2 ? date : incrementHoursOne(date)
                        let hourObj = {
                            t,
                            y: client.getMeteringType() == 2 ? (data[el][hr] * amount).toFixed(3) : data[el][hr] * amount
                        }
                        chartData.push(hourObj);
                        labels.push(`${t.getHours()} ч.`);
                    }
                    index += 1;
                }
                index = 0;
            }
        } else if (data.length != 1) {

            _IS_MULTIPLE_DAYS_GRAPHS_CHART = true;
            for (let el in data) {
                let date = new Date(data[el]['date']);
                for (let hr in data[el]) {
                    let amount = data[el]['amount'];
                    if (amount == null || amount == undefined) {
                        amount = 1;
                    }

                    if (index >= 2 && index <= 25) {
                        let t = index == 2 ? date : incrementHoursOne(date)
                        let hourObj = {
                            t,
                            y: client.getMeteringType() == 2 ? (data[el][hr] * amount).toFixed(3) : (data[el][hr] * amount)
                        }
                        chartData.push(hourObj);
                        labels.push(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} - ${t.getHours()}ч.`);
                    }
                    index += 1;
                }
                index = 0;
            }
        }
    }
    var ctx = document.getElementById('graph-prediction-chart').getContext('2d');
    var config = {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Прогноза',
                data: chartData,
                borderWidth: 2,
                backgroundColor: "rgb(255,99,132)",
                borderColor: "#ac3f21"
            }],
        },
        options: {
            scales: {
                xAxes: [{
                    offset: true,
                    ticks: {
                        userCallback: _IS_MULTIPLE_DAYS_GRAPHS_CHART ? function (item, index) {
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
    try {
        GraphsChart.destroy();
    } catch (e) {}

    GraphsChart = new Chart(ctx, config);
    $('#graph > div.graph-prediction-div > form > div > div:nth-child(4) > label > input').click((e) => {

        var temp = jQuery.extend(true, {}, config);
        if (GraphsChart.config.type == 'line') {
            temp.type = 'bar';
        } else {
            temp.type = 'line';
        }
        setTimeout(function () {
            GraphsChart.destroy();
            GraphsChart = new Chart(ctx, temp)
        }, 0)
    })
}

function showImbalanceChart(data) {
    if (data != '') {
        const maxDate = getMaxDate(data);
        const minDate = getMinDate(data);
        const equalDates = checkIfDatesAreEqual(maxDate, minDate);
        if (equalDates) {
            writeDailyPeriodHeading(maxDate, null, 'imbalance');
        } else {
            writeDailyPeriodHeading(minDate, maxDate, 'imbalance');
        }
    }
    let _IS_MULTIPLE_DAYS_IMBALANCES_CHART = false;
    let labels = [];
    let actualHourData = [];
    let predictionData = [];
    let imbalancesData = [];
    let index = 0;
    const startingIndexActualHourData = client.getMeteringType() == 2 ? 3 : 2;
    let indexActualData = client.getMeteringType() == 2 ? 3 : 2;
    let indexPrediction = client.getMeteringType() == 2 ? 27 : 26;
    const endIndexPrediction = client.getMeteringType() == 2 ? 50 : 49;
    const finalIndex = client.getMeteringType() == 2 ? 26 : 25;

    if (data != undefined) {
        if (data.length == 1) {
            _IS_MULTIPLE_DAYS_IMBALANCES_CHART = false;
            for (let el in data) {
                let amount = data[el]['amount'];
                if (amount == null || amount == undefined) {
                    amount = 1;
                }
                let date = new Date(data[el]['date']);
                let isManufacturer = data[el]['is_manufacturer'];
                let valuesData = Object.values(data[el]);
                for (let val of valuesData) {
                    if (index >= startingIndexActualHourData && index <= endIndexPrediction) {
                        if (index > finalIndex) {
                            break;
                        }
                        const currPredictionValue = valuesData[indexPrediction] == -1 ? 0 : (valuesData[indexPrediction] * amount).toFixed(3);
                        const currReadingValue = valuesData[indexActualData] == -1 ? 0 : (Number(valuesData[indexActualData]) / 1000).toFixed(7);
                        const currImbalance = calcImbalance(isManufacturer, currPredictionValue, currReadingValue);
                        let t = index == startingIndexActualHourData ? date : incrementHoursOne(date)
                        let actualHourObj = {
                            t,
                            y: currReadingValue
                        }
                        let predictionObj = {
                            t,
                            y: currPredictionValue
                        }
                        let imbalanceData = {
                            t,
                            y: currImbalance
                        }
                        actualHourData.push(actualHourObj);
                        predictionData.push(predictionObj);
                        imbalancesData.push(imbalanceData);
                        labels.push(`${t.getHours()} ч.`);

                        indexActualData += 1;
                        indexPrediction += 1;
                    }
                    index += 1;
                }
                index = 0;
            }
        } else if (data.length != 1) {
            _IS_MULTIPLE_DAYS_IMBALANCES_CHART = true;
            for (let el of data) {
                indexActualData = client.getMeteringType() == 2 ? 3 : 2;
                indexPrediction = client.getMeteringType() == 2 ? 27 : 26;
                let amount = el['amount'];
                if (amount == null || amount == undefined) {
                    amount = 1;
                }
                let date = new Date(el['date']);
                let isManufacturer = el['is_manufacturer'];
                let valuesData = Object.values(el);
                for (let y = 0; y < Math.floor(valuesData.length / 2); y += 1) {
                    const currReadingValue = valuesData[indexActualData] == -1 ? 0 : (Number(valuesData[indexActualData]) / 1000).toFixed(7);
                    const currPredictionValue = valuesData[indexPrediction] == -1 ? 0 : (valuesData[indexPrediction] * amount).toFixed(3);
                    const currImbalance = calcImbalance(isManufacturer, currPredictionValue, currReadingValue);
                    let t = index == startingIndexActualHourData ? date : incrementHoursOne(date)
                    let actualHourObj = {
                        t,
                        y: currReadingValue
                    }
                    let predictionObj = {
                        t,
                        y: currPredictionValue
                    }
                    let imbalanceData = {
                        t,
                        y: currImbalance
                    }
                    actualHourData.push(actualHourObj);
                    predictionData.push(predictionObj);
                    imbalancesData.push(imbalanceData);
                    labels.push(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} - ${t.getHours()}ч.`);

                    indexActualData += 1;
                    indexPrediction += 1;
                    index += 1;
                }
                index = 0;
            }
        }
    }

    var ctx = document.getElementById('imbalance-chart').getContext('2d');
    var config = {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Мерения',
                data: actualHourData,
                borderWidth: 2,
                backgroundColor: "rgb(255,99,132)",
                borderColor: "#ac3f21"
            }, {
                label: 'Прогнози',
                data: predictionData,
                borderWidth: 2,
                backgroundColor: "#9c1de7",
                borderColor: "#1e2a78",
                hidden: true
            }, {
                label: 'Небаланс',
                data: imbalancesData,
                borderWidth: 2,
                backgroundColor: "#f3f169",
                borderColor: "#ffd615",
            }],
        },
        options: {
            scales: {
                xAxes: [{
                    offset: true,
                    ticks: {
                        userCallback: _IS_MULTIPLE_DAYS_IMBALANCES_CHART ? function (item, index) {
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
    try {
        ImbalancesChart.destroy();
    } catch (e) {}

    ImbalancesChart = new Chart(ctx, config);

    $('#imbalance > div.imbalance-graph-div > form > div > div:nth-child(4) > label > input').click((e) => {
        ImbalancesChart.destroy();
        var temp = jQuery.extend(true, {}, config);
        if (ImbalancesChart.config.type == 'line') {
            temp.type = 'bar';
        } else {
            temp.type = 'line';
        }
        setTimeout(function () {
            ImbalancesChart.destroy();
            ImbalancesChart = new Chart(ctx, temp)
        }, 0)
    })
}

function visualizeChartsAutomatically() {
    const readingType = findGetParameter('type');
    const readingDate = findGetParameter('date');
    if ((readingType == readingTypes.HOUR_READING || readingType == readingTypes.STP_HOUR_READING) && readingDate != null) {
        $('#hour-readings input[name=fromDate]').val(readingDate);
        $('#hour-readings input[name=toDate]').val(readingDate);
        $('#searchBtnHourlyGraph').click();
    } else if (readingType == readingTypes.GRAPH_HOUR_READING && readingDate != null) {
        $('#graph input[name=fromDateGraphPrediction]').val(readingDate);
        $('#graph input[name=toDateGraphPrediction]').val(readingDate);
        $('#searchBtnGraphPrediction').click();
    }

}

(function addFullCalendars() {

    const readingType = findGetParameter('type');
    const readingDate = findGetParameter('date');
    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${today.getMonth()+1<10?`0${today.getMonth()+1}`:today.getMonth()+1}-${today.getDate()<10?`0${today.getDate()}`:today.getDate()}`;
    document.addEventListener('DOMContentLoaded', function () {
        var calendarEl = document.getElementById('calendar-hourly');
        var calendar = new FullCalendar.Calendar(calendarEl, {
            eventLimit: true,
            eventLimit: 1,
            eventLimitText: 'Има мерене',
            eventLimitClick: 'day',
            allDaySlot: false,
            eventOrder: 'groupId',
            defaultDate: readingDate != null && (readingType == readingTypes.HOUR_READING || readingType == readingTypes.STP_HOUR_READING) ? readingDate : formattedToday,
            defaultView: readingDate != null && (readingType == readingTypes.HOUR_READING || readingType == readingTypes.STP_HOUR_READING) ? 'timeGridDay' : 'dayGridMonth',
            events: getGraphsData(),
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
        if (readingType == readingTypes.HOUR_READING || readingType == readingTypes.STP_HOUR_READING) {
            $('body > div.container.mt-3 > ul > li:nth-child(2) > a').click();
        } else if (readingDate == null && readingType == null) {
            $('body > div.container.mt-3 > ul > li:nth-child(1) > a').click();
        }
    });

    document.addEventListener('DOMContentLoaded', function () {
        var calendarEl = document.getElementById('calendar-prediction');
        var calendar = new FullCalendar.Calendar(calendarEl, {
            eventLimit: true,
            eventLimit: 1,
            eventLimitText: 'Има график',
            eventLimitClick: 'day',
            allDaySlot: false,
            eventOrder: 'groupId',
            defaultDate: readingDate != null && (readingType == readingTypes.GRAPH_HOUR_READING || readingType == readingTypes.STP_GRAPH_HOUR_READING) ? readingDate : formattedToday,
            defaultView: readingDate != null && readingType == readingTypes.GRAPH_HOUR_READING ? 'timeGridDay' : 'dayGridMonth',
            events: getGraphPredictions(),
            plugins: ['dayGrid', 'timeGrid'],
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'prev, dayGridMonth,timeGridDay, next',
            },
            contentHeight: 'auto',
        });
        setTimeout(function () {
            calendar.render();
        }, 0);

        if (readingType == readingTypes.GRAPH_HOUR_READING || readingType == readingTypes.STP_GRAPH_HOUR_READING) {
            $('body > div.container.mt-3 > ul > li:nth-child(3) > a').click();
        } else if (readingDate == null && readingType == null) {
            $('body > div.container.mt-3 > ul > li:nth-child(1) > a').click();
        }
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
}());

function getGraphsData() {
    getClientInfo();
    const clientID = getClientID();
    let url = client.getMeteringType() == 2 ? `/api/stp-hour-readings/getClient/${clientID}` :
        `/api/hour-readings/getClient/${clientID}`;
    let dataArr = [];
    $.ajax({
        url,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            data != '' ? dataArr = [...processDataHourly(data)] : '';
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    return dataArr;
}

function getGraphPredictions() {
    getClientInfo();
    const clientID = getClientID();
    const url = client.getMeteringType() == 2 ? `/api/stp-graph-predictions/getClient/${clientID}` :
        `/api/graph-predictions/getClient/${clientID}`;
    let dataArr = [];
    $.ajax({
        url,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            data != '' ? dataArr = [...processDataGraphPredictions(data)] : '';
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    return dataArr;
}

function getImbalances() {
    let clientID = getClientID();
    let url = client.getMeteringType() == 2 ? `/api/stp-imbalances/getClient/${clientID}` :
        `/api/imbalances/getClient/${clientID}`;
    let dataArr = [];
    $.ajax({
        url,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            data != '' ? dataArr = [...processDataImbalances(data)] : '';
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    return dataArr;
}

function visualizeClientInfo(data) {
    $('#info div:nth-child(1) > input').val(data['client_name']);
    $('#info div:nth-child(2) > input').val(data['ident_code']);
    $(`<option value="${data['profile_name'] == undefined ? '0' : data['profile_name']}">${data['profile_name'] == undefined ? '0' : data['profile_name']}</option>`).appendTo(`#input-profile-name`)
    $('#info div:nth-child(3) > input').val(data['profile_name'] == undefined ? '0' : data['profile_name']);
    $('#info div:nth-child(4) > input').val(data['metering_type'] == 2 ? 'СТП' : 'Почасово');
    $('#info div:nth-child(5) > input').val(data['erp_type'] == 1 ? 'EVN' : data['erp_type'] == 2 ? 'ЧЕЗ' : 'ЕнергоПРО');
    if (data['is_manufacturer']) {
        $('#squaredThree').prop('checked', true);
    }
}

function getClientID() {
    let lastIndexOfIncline = window.location.href.lastIndexOf('/');
    return window.location.href.substr(lastIndexOfIncline + 1);
}

const colors = {
    blue: '#aa62ea',
    red: '#ff4d4d'
}

function processDataHourly(data) {
    writeReadingsHeading(data[0]['ident_code']);
    writeGraphHeading(data[0]['ident_code']);
    writeImbalancesHeading(data[0]['ident_code']);
    let dataArr = [];
    let currHourReading = [];
    for (let el in data) {
        currHourReading = [];
        let currHourDate = new Date(data[el].date);
        let diff = data[el].diff;
        let energyType = data[el].energy_type;
        let i = 0;
        const startIndexHourReadings = 11;
        const endIndexHourReadings = 34;
        let timezoneOffset = false;
        let moveRestOneHr = false;
        for (let [key, value] of Object.entries(data[el])) {
            if (i > endIndexHourReadings) {
                break;
            }
            if (i >= startIndexHourReadings && i <= endIndexHourReadings) {
                currHourReading = {
                    groupId: diff,
                    id: key,
                    title: value === -1 ? title = 'Няма стойност' : `Стойност: ${(Number(value)/1000).toFixed(7)} ${energyType==0?'Активна':energyType==1?'Реактивна':''}`,
                    start: timezoneOffset ? Number(currHourDate) - 1 : moveRestOneHr ? Number(currHourDate) - 3599999 : Number(currHourDate),
                    end: timezoneOffset ? Number(currHourDate) : moveRestOneHr ? Number(currHourDate) : Number(currHourDate) + 3599999,
                    backgroundColor: diff === 0 ? colors.blue : colors.red,
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
            dataArr.push(currHourReading);
            i += 1;
        }
        i = 0;
    }
    return dataArr;
}

function processDataGraphPredictions(data) {
    writeGraphHeading(data[0]['ident_code']);
    let dataArr = [];
    let currHourReading = [];
    //  Hour Predictions
    let startIndexGraphPrediction = 11;
    let endIndexGraphPrediction = 34;
    //  STP Predicitons
    if (client.getMeteringType() == 2) {
        startIndexGraphPrediction = 4;
        endIndexGraphPrediction = 27;
    }
    for (let el in data) {
        let amount = data[el].amount;
        if (amount == null || amount == undefined) {
            amount = 1;
        }
        currHourReading = [];
        let currHourDate = new Date(data[el].date);
        let diff = data[el].diff;
        let i = 0;
        let timezoneOffset = false;
        let moveRestOneHr = false;
        for (let [key, value] of Object.entries(data[el])) {
            if (i > endIndexGraphPrediction) {
                break;
            }
            if (i >= startIndexGraphPrediction && i <= endIndexGraphPrediction) {
                //     console.log(value*amount);
                currHourReading = {
                    groupId: diff,
                    id: key,
                    title: value === -1 ? title = 'Няма стойност' : `Стойност: ${client.getMeteringType() == 2?(value * amount).toFixed(3):value * amount}`,
                    start: timezoneOffset ? Number(currHourDate) - 1 : moveRestOneHr ? Number(currHourDate) - 3599999 : Number(currHourDate),
                    end: timezoneOffset ? Number(currHourDate) : moveRestOneHr ? Number(currHourDate) : Number(currHourDate) + 3599999,
                    backgroundColor: colors.blue
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
                dataArr.push(currHourReading);
            }
            i += 1;
        }
        i = 0;
    }
    return dataArr;
}

function processDataImbalances(data) {
    writeImbalancesHeading(data[0]['ident_code']);
    const beginningIndexOfIterator = client.getMeteringType() == 2 ? 3 : 2;
    const endIndexOfIterator = client.getMeteringType() == 2 ? 27 : 26;
    let dataArr = [];
    let currHourReading = [];
    for (let el in data) {
        currHourReading = [];
        let amount = data[el]['amount'];
        if (amount == null || amount == undefined) {
            amount = 1;
        }
        let currHourDate = new Date(data[el].date);
        let currHourReadingVal = client.getMeteringType() == 2 ? 3 : 2;
        let currHourPredictionVal = client.getMeteringType() == 2 ? 27 : 26;
        let objVals = Object.values(data[el]);
        let iterator = 0;
        let isManufacturer = data[el]['is_manufacturer'];
        let timezoneOffset = false;
        let moveRestOneHr = false;
        for (let val of objVals) {
            if (iterator >= beginningIndexOfIterator && iterator < endIndexOfIterator) {
                const currImbalance = calcImbalance(isManufacturer, ((objVals[currHourPredictionVal] * amount).toFixed(3)), (Number(objVals[currHourReadingVal]) / 1000).toFixed(7));
                currHourReading = {
                    id: iterator,
                    title: currImbalance,
                    start: timezoneOffset ? Number(currHourDate) - 1 : moveRestOneHr ? Number(currHourDate) - 3599999 : Number(currHourDate),
                    end: timezoneOffset ? Number(currHourDate) : moveRestOneHr ? Number(currHourDate) : Number(currHourDate) + 3599999,
                    backgroundColor: colors.blue
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
                currHourReadingVal += 1;
                currHourPredictionVal += 1;
            }
            iterator += 1;
        }
    }
    return dataArr;
}

function calcImbalance(isManufacturer, predictionVal, actualVal) {
    return isManufacturer == 0 ? predictionVal - actualVal : actualVal - predictionVal;
}

function incrementHoursOne(date) {
    return new Date(date.setHours(date.getHours() + 1));
}

function decrementHoursBy23(date) {
    return date.setHours(date.getHours() - 23);
}


function writeReadingsHeading(data) {
    if (data) {
        $('#hourReadingsHeading').text(`Мерения по часове за клиент: ${data}`);
    } else {
        $('#hourReadingsHeading').text(`Няма мерения за клиент за клиент`);
    }
}

function writeGraphHeading(data) {
    if (data) {
        $('#graphHeading').text(`График за клиент: ${data}`);
    }
}

function writeImbalancesHeading(data) {
    if (data) {
        $('#imbalancesHeading').text(`Небаланси за клиент: ${data}`)
    } else {
        $('#imbalancesHeading').text(`Няма небаланси за клиент`)
    }

}

(function switchHourReadingCalendarAndGraph() {
    $('#hour-readings > label > input').on('click', () => {
        if ($('.hour-readings-graph-div').css('display') == 'none') {
            $('#hour-readings > div.row').css('display', 'none');
            $('.hour-readings-graph-div').css('display', 'block');
        } else {
            $('#hour-readings > div.row').css('display', 'block');
            $('.hour-readings-graph-div').css('display', 'none');
        }
    })
}());

(function switchGraphPredictionCalendarAndGraph() {
    $('#graph > label > input').on('click', () => {
        if ($('.graph-prediction-div').css('display') == 'block') {
            $('.graph-prediction-div').css("display", "none");
            $('.graphRow-calendar').css("display", "block");
        } else {
            $(".graph-prediction-div").css("display", "block");
            $('.graphRow-calendar').css("display", "none");
        }
    })
}());

(function switchImbalanceCalendarAndGraph() {
    $('#imbalance > label > input').on('click', () => {
        if ($('#imbalance > div.row').css('display') == 'flex') {
            $('#imbalance > div.row').css("display", "none");
            $('#imbalance > div.imbalance-graph-div').css("display", "block");
        } else {
            $("#imbalance > div.row").css("display", "flex");
            $('#imbalance > div.imbalance-graph-div').css("display", "none");
        }
    })
})();

function visualizeDefaultInputForGraphs() {
    const lastWeekDate = getLastWeek();
    const today = new Date();
    $('#hour-readings > div.hour-readings-graph-div > form > div > div.offset-1.col-md-3 > input[type=date]').val(`${lastWeekDate.getFullYear()}-${lastWeekDate.getMonth()+1<10?`0${lastWeekDate.getMonth()+1}`:lastWeekDate.getMonth()+1}-${lastWeekDate.getDate()<10?`0${lastWeekDate.getDate()}`:lastWeekDate.getDate()}`);
    $('#hour-readings > div.hour-readings-graph-div > form > div > div:nth-child(2) > input[type=date]').val(`${today.getFullYear()}-${(today.getMonth()+1)<10? `0${today.getMonth()+1}`: today.getMonth()+1}-${today.getDate()<10?`0${today.getDate()}`:today.getDate()}`);
}

function writeDailyPeriodHeading(firstDate, secondDate, type) {
    const formattedFirstDate = formatDate(firstDate);
    let chartDailyPeriod = '';
    if (secondDate === null) {
        chartDailyPeriod = $(`<h3 class="text-center mb-3">Дата: ${formattedFirstDate}<h3>`);
    } else {
        const formattedSecondDate = formatDate(secondDate);
        chartDailyPeriod = $(`<h3 class="text-center mb-3">От: ${formattedFirstDate} До: ${formattedSecondDate}<h3>`);
    }

    switch (type) {
        case 'reading':
            $('#hour-readings > div.hour-readings-graph-div > form').append(chartDailyPeriod);
            break;
        case 'graph':
            $('#graph > div.graph-prediction-div > form').append(chartDailyPeriod);
            break;
        case 'imbalance':
            $('#imbalance > div.imbalance-graph-div > form').append(chartDailyPeriod);
            break;
    }
}

function visualizeDefaultInputsForHourReadingsGraph(lastWeekDate, today) {
    $('#hour-readings > div.hour-readings-graph-div > form > div > div.offset-1.col-md-3 > input[type=date]').val(`${lastWeekDate.getFullYear()}-${lastWeekDate.getMonth()+1<10?`0${lastWeekDate.getMonth()+1}`:lastWeekDate.getMonth()+1}-${lastWeekDate.getDate()<10?`0${lastWeekDate.getDate()}`:lastWeekDate.getDate()}`);
    $('#hour-readings > div.hour-readings-graph-div > form > div > div:nth-child(2) > input[type=date]').val(`${today.getFullYear()}-${(today.getMonth()+1)<10? `0${today.getMonth()+1}`: today.getMonth()+1}-${today.getDate()<10?`0${today.getDate()}`:today.getDate()}`);
}

function visualizeDefaultInputsForGraphPrediction(lastWeekDate, today) {
    $('input[name=fromDateGraphPrediction]').val(`${lastWeekDate.getFullYear()}-${lastWeekDate.getMonth()+1<10?`0${lastWeekDate.getMonth()+1}`:lastWeekDate.getMonth()+1}-${lastWeekDate.getDate()<10?`0${lastWeekDate.getDate()}`:lastWeekDate.getDate()}`);
    $('input[name=toDateGraphPrediction]').val(`${today.getFullYear()}-${(today.getMonth()+1)<10? `0${today.getMonth()+1}`: today.getMonth()+1}-${today.getDate()<10?`0${today.getDate()}`:today.getDate()}`);
}

function visualizeDefaultInputForImbalanceGraph(lastWeekDate, today) {
    $('input[name=fromDateImbalanceGraph]').val(`${lastWeekDate.getFullYear()}-${lastWeekDate.getMonth()+1<10?`0${lastWeekDate.getMonth()+1}`:lastWeekDate.getMonth()+1}-${lastWeekDate.getDate()<10?`0${lastWeekDate.getDate()}`:lastWeekDate.getDate()}`);
    $('input[name=toDateImbalanceGraph]').val(`${today.getFullYear()}-${(today.getMonth()+1)<10? `0${today.getMonth()+1}`: today.getMonth()+1}-${today.getDate()<10?`0${today.getDate()}`:today.getDate()}`);
}

function hideGraphs() {
    $('.hour-readings-graph-div').css('display', 'none');
    $('.graph-prediction-div').css('display', 'none');
    $('#imbalance > div.imbalance-graph-div').css('display', 'none');
}

function refreshURL() {
    location.reload();
}

function getAllCharts() {
    getHourReadingsChartFilterData(formatLastWeekDate(), formatTodayDate(), getClientID());
    getGraphPredictionsFilterData(formatLastWeekDate(), formatTodayDate(), getClientID());
    getImbalancesChartFilterData(formatLastWeekDate(), formatTodayDate(), getClientID());
}

function visualizeAllDefaultInputs() {
    const lastWeekDate = getLastWeek();
    const today = new Date();
    visualizeDefaultInputsForHourReadingsGraph(lastWeekDate, today);
    visualizeDefaultInputsForGraphPrediction(lastWeekDate, today);
    visualizeDefaultInputForImbalanceGraph(lastWeekDate, today);
}

function goBack() {
    window.history.back();
}

function getProfileHistory() {
    const clientID = getClientID();
    const url = `/api/profile-history/${clientID}`;
    $.ajax({
        url,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            if (data && data.length) {
                renderProfileHistoryGroupListings(data);
            } else {
                $('#profile-history > div > div.card-body').append($('<span>Няма история на профилите</span>'));
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function renderProfileHistoryGroupListings(data) {
    let groupList = $('<ul class="list-group text-center"></ul>');
    for (let i = 0; i < data.length; i += 1) {
        const currProfileName = data[i].profile_name;
        const profileID = data[i].profile_id;
        const startDate = new Date(data[i].created_date);
        const endDate = new Date(data[i].end_date);
        const formattedStartDate = `${startDate.getFullYear()}-${startDate.getMonth()+1<10?`0${startDate.getMonth()+1}`:startDate.getMonth()+1}-${startDate.getDate()<10?`0${startDate.getDate()}`:startDate.getDate()}`;
        const formattedEndDate = `${endDate.getFullYear()}-${endDate.getMonth()+1<10?`0${endDate.getMonth()+1}`:endDate.getMonth()+1}-${endDate.getDate()<10?`0${endDate.getDate()}`:endDate.getDate()}`;
        let currentEl = $(`<li class="list-group-item list-group-item-action" data-id=${profileID}>Профил: ${currProfileName}, От дата: ${formattedStartDate}, До дата: ${formattedEndDate}</li>`);
        if (data[i].end_date == null) {
            currentEl = $(`<li class="list-group-item list-group-item-action" data-id=${profileID}>Профил: ${currProfileName}, От дата: ${formattedStartDate}, Настоящ</li>`);
            currentEl.addClass('active');
        }
        currentEl.appendTo(groupList);
    }
    $('#profile-history > div > div.card-body').append(groupList);
    $('#profile-history > div > div.card-header > h2').text(`История на профилите за клиент: ${client.getIdentCode()}`);
    (function redirectToProfilePageEvent() {
        $('.list-group-item-action').on('click', (e) => {
            const selectedProfileID = e.target.getAttribute('data-id');
            window.location.href = `/users/profiles/${selectedProfileID}`;
        })
    })();
}

function validateProfileName(profileName) {
    if (profileName == undefined || profileName == '') {
        notification('Избери профил', 'error');
        throw new Error('Избери профил');
    }
}