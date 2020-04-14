$(document).ready(function () {
    setDefaultDateForLinks();
    visualizeActiveLinks();
});

(function swapHamburgerMenuIcons() {
    $('body > div.wrapper > div.row > div:nth-child(1) > nav > ul > li:nth-child(1)').on('click', () => {
        if ($('#hmg-icon').hasClass('fa-bars')) {
            $('#hmg-icon').removeClass('fa-bars').addClass('fa-times');
        } else {
            $('#hmg-icon').removeClass('fa-times').addClass('fa-bars');
        }
    })
}());

(function makeBrandLogoSmallerOnSidebarCollapseAndHover() {
    $('body > div.wrapper > aside').hover(() => {
        if ($('body').hasClass('sidebar-collapse')) {
            if ($('body > div.wrapper > aside > a > img').hasClass('smaller-logo')) {
                $('body > div.wrapper > aside > a > img').removeClass('smaller-logo');
            } else {
                $('body > div.wrapper > aside > a > img').addClass('smaller-logo');
            }
        }
    });

    $('body > div.wrapper > div.row > div:nth-child(1) > nav > ul > li:nth-child(1)').on('click', () => {
        if ($('body > div.wrapper > aside > a > img').hasClass('smaller-logo')) {
            $('body > div.wrapper > aside > a > img').removeClass('smaller-logo');
        } else {
            $('body > div.wrapper > aside > a > img').addClass('smaller-logo');
        }
    });
}());

function setDefaultDateForLinks() {
    const lastWeekDate = getLastWeek();
    const today = new Date();
    let formattedToday = `${today.getFullYear()}-${today.getMonth()+1<10?`0${today.getMonth()+1}`:today.getMonth()+1}-${today.getDate()<10?`0${today.getDate()}`:today.getDate()}`;
    let formattedLastWeek = `${lastWeekDate.getFullYear()}-${lastWeekDate.getMonth()+1<10?`0${lastWeekDate.getMonth()+1}`:lastWeekDate.getMonth()+1}-${lastWeekDate.getDate()<10?`0${lastWeekDate.getDate()}`:lastWeekDate.getDate()}`;

    //  Change readings href
    $('#readings-stp-href').attr('href', `/users/list/readings?fromDate=${formattedLastWeek}&toDate=${formattedToday}&name=&clientID=&erp_type=evn&erp_type=cez&erp_type=energoPRO`);
    $('#readings-href').attr('href', `/users/list/hour-readings?fromDate=${formattedLastWeek}&toDate=${formattedToday}&name=&clientID=&erp_type=evn&erp_type=cez&erp_type=energoPRO`);
    $('#readings-eso').attr('href', `/users/list/eso-hour-readings?fromDate=&toDate=&energy_type=used-energy`);

    //  Change graphs href
    $('#stp-graph-readings-href').attr('href', `/users/list/stp-graph-readings/?fromDate=${formattedLastWeek}&toDate=${formattedToday}&name=&clientID=&erp_type=evn&erp_type=cez&erp_type=energoPRO`);
    $('#graph-readings-href').attr('href', `/users/list/graph-readings/?fromDate=${formattedLastWeek}&toDate=${formattedToday}&name=&clientID=&erp_type=evn&erp_type=cez&erp_type=energoPRO`);

    //  Invoicing href
    $('#invoicing-readings-href').attr('href', `/users/invoicing?fromDate=${formattedLastWeek}&toDate=${formattedToday}&erp_type=evn&erp_type=cez&erp_type=energoPRO&clientNames=&clientID=`);

    //  Imbalances inquiry href   
    $('#inquiry-readings-href').attr('href', `/users/inquiry/readings?fromDate=${formattedLastWeek}&toDate=${formattedToday}&name=&clientID=&erp_type=evn&erp_type=cez&erp_type=energoPRO&readings=hour_readings&clientID=`);
    $('#inquiry-graphs-href').attr('href', `/users/inquiry/graphs?fromDate=${formattedLastWeek}&toDate=${formattedToday}&name=&clientID=&erp_type=evn&erp_type=cez&erp_type=energoPRO&predictions=hour_prediction&clientID=`);
    $('#inquiry-imbalances-href').attr('href', `/users/inquiry/imbalances?fromDate=${formattedLastWeek}&toDate=${formattedToday}&name=&clientID=&erp_type=evn&erp_type=cez&erp_type=energoPRO&imbalances=hourly_imbalances`)
}

function visualizeActiveLinks() {
    let path = location.pathname;
    // Remove active for all items.
    $('.page-sidebar-menu li').removeClass('active');
    // make current-submenu active
    if ($(`a[href*="${location.pathname}"]`).length == 0) {
        path = localStorage.getItem('active-path');
    } else {
        localStorage.setItem('active-path', location.pathname);
    }
    $(`a[href*="${path}"]`).addClass('active');

    // Open parent - menu and make active
    $(`a[href*="${path}"]`).closest('li.has-treeview').addClass('menu-open active');
    $(`.menu-open.active a`).first().addClass('active');
}

function getLastWeek() {
    var today = new Date();
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastWeek;
}