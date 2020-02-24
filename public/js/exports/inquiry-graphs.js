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
    visualizeTooltips();
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

            window.location.href.includes('profile_coef') ? client.setMeteringType(2) : client.setMeteringType(1)
            showGraphsChart(data);
            calendarData = getPredictionDataForCalendar(data);
            addPredictionsToTable(calendarData);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    toastr.clear();
    return calendarData;
};

function addPredictionsToTable(data) {
    console.log(data);
    let currRow;
    let currentStartDate;
    let currentEndDate;
    for (let el of data) {
        currentStartDate = new Date(el.start);
        currentEndDate = new Date(el.end);
        currRow = $(`<tr>`);
        currRow
            .append(`<td>${el.id}</td>`)
            .append(`<td>${el.title}</td`)
            .append((`<td>${currentStartDate.getFullYear()}-${currentStartDate.getMonth()+1}-${currentStartDate.getDate()} : ${currentStartDate.getHours()}</td`))
            .append((`<td>${currentEndDate.getFullYear()}-${currentEndDate.getMonth()+1}-${currentEndDate.getDate()} : ${currentEndDate.getHours()}</td`))
            .append((`</tr>`));
        currRow.appendTo($('#tBody-prediction'));
    }

}

function showGraphsChart(data) {
    let labels = [];
    let actualHourData = [];

    let tempActualArr = [];
    let index = 0;
    let dataIterator = 0;

    if (data != undefined) {
        if (true /*data.length == 1*/ ) {
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
    console.log(tempActualArr);
    let labelsNoDuplicates = removeDuplicatesFromArr(labels);
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

function getPredictionDataForCalendar(data) {
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

(function addOnClickEventToExportTableBTN() {
    $('#export-table-btn').on('click', () => {
        const tableName = $('#table-input').val();
        exportTableToExcel('export-predictions', tableName);
    })
}());

function findGetParameter(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
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

function visualizeTooltips() {
    $('[data-toggle="tooltip"]').tooltip()
}