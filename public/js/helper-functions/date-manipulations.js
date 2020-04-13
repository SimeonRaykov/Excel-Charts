function getMaxDate(data) {
    return new Date(Math.max.apply(null, data.map(function (e) {
        return new Date(e.date);
    })));
}

function getMinDate(data) {
    return new Date(Math.min.apply(null, data.map(function (e) {
        return new Date(e.date);
    })));
}

function checkIfDatesAreEqual(firstDate, secondDate) {
    if (firstDate.getDate() === secondDate.getDate() &&
        firstDate.getMonth() === secondDate.getMonth() &&
        firstDate.getFullYear() === secondDate.getFullYear()) {
        return true;
    }
    return false;
}

function formatDate(date) {
    return `${date.getFullYear()}-${date.getMonth()+1<10?`0${date.getMonth()+1}`:date.getMonth()+1}-${date.getDate()<10?`0${date.getDate()}`:date.getDate()}`;
}

function formatTodayDate() {
    return `${new Date().getFullYear()}-${(new Date().getMonth()+1)<10?`0${new Date().getMonth()+1}`:new Date().getMonth()+1}-${new Date().getDate()<10?`0${new Date().getDate()}`:new Date().getDate()}`
}

function formatLastWeekDate() {
    return `${getLastWeek().getFullYear()}-${(getLastWeek().getMonth()+1)<10?`0${getLastWeek().getMonth()+1}`:getLastWeek().getMonth()+1}-${getLastWeek().getDate()<10?`0${getLastWeek().getDate()}`:getLastWeek().getDate()}`
}

function getLastWeek() {
    var today = new Date();
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastWeek;
}