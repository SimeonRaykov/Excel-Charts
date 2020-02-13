$(document).ready(function () {

    setDefaultDateForLinks();

    // Remove active for all items.

    $('.page-sidebar-menu li').removeClass('active');

    // highlight submenu item
    $('li a[href="' + this.location.pathname + '"]').parent().addClass('active');

    // Highlight parent menu item.
    $('ul a[href="' + this.location.pathname + '"]').parents('li').addClass('active');
    $('.active').addClass('menu-open');
    $('.active a').first().addClass('active');
    $(`a[href*="${location.pathname}"]`).addClass('active');

    const indexOfThirdIncline = nth_occurrence(document.referrer, '/', 3);
    const documentHistoryPathname = document.referrer.substr(indexOfThirdIncline);
    if (!$('li.has-treeview a').hasClass("active")) {
        if (!$('.nav-item').hasClass("active")) {
            $(`a[href*="${location.pathname}"]`).addClass('active');
        }
    }
    /* else {
           if (!$('.nav-item').hasClass("active")) {
               $(`a[href*="${documentHistoryPathname}"]`).addClass('active');
           }
       } */
});

function setDefaultDateForLinks() {
    const lastWeekDate = getLastWeek();
    const today = new Date();
    let formattedToday = `${today.getFullYear()}-${today.getMonth()+1<10?`0${today.getMonth()+1}`:today.getMonth()+1}-${today.getDate()<10?`0${today.getDate()}`:today.getDate()}`;
    let formattedLastWeek = `${lastWeekDate.getFullYear()}-${lastWeekDate.getMonth()+1<10?`0${lastWeekDate.getMonth()+1}`:lastWeekDate.getMonth()+1}-${lastWeekDate.getDate()<10?`0${lastWeekDate.getDate()}`:lastWeekDate.getDate()}`;

    //  Change readings href
    $('#readings-stp-href').attr('href', `/users/list/readings?fromDate=${formattedLastWeek}&toDate=${formattedToday}&name=&clientID=&erp_type=evn&erp_type=cez&erp_type=energoPRO`);
    $('#readings-href').attr('href', `/users/list/hour-readings?fromDate=${formattedLastWeek}&toDate=${formattedToday}&name=&clientID=&erp_type=evn&erp_type=cez&erp_type=energoPRO`);

    //  Change graphs href
    $('#stp-graph-readings-href').attr('href', `/users/list/stp-graph-readings/?fromDate=${formattedLastWeek}&toDate=${formattedToday}&name=&clientID=&erp_type=evn&erp_type=cez&erp_type=energoPRO`);
    $('#graph-readings-href').attr('href', `/users/list/graph-readings/?fromDate=${formattedLastWeek}&toDate=${formattedToday}&name=&clientID=&erp_type=evn&erp_type=cez&erp_type=energoPRO`);

    //  Invoicing href
    $('#invoicing-readings-href').attr('href', `/users/invoicing?fromDate=${formattedLastWeek}&toDate=${formattedToday}&erp_type=evn&erp_type=cez&erp_type=energoPRO&clientNames=&clientID=`);
}

function getLastWeek() {
    var today = new Date();
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastWeek;
}


function nth_occurrence(string, char, nth) {
    var first_index = string.indexOf(char);
    var length_up_to_first_index = first_index + 1;

    if (nth == 1) {
        return first_index;
    } else {
        var string_after_first_occurrence = string.slice(length_up_to_first_index);
        var next_occurrence = nth_occurrence(string_after_first_occurrence, char, nth - 1);

        if (next_occurrence === -1) {
            return -1;
        } else {
            return length_up_to_first_index + next_occurrence;
        }
    }
}