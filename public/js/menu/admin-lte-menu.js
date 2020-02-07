$(document).ready(function () {
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
            $(`a[href*="${documentHistoryPathname}"]`).addClass('active');
        }
    } else {
        if (!$('.nav-item').hasClass("active")) {
            $(`a[href*="${documentHistoryPathname}"]`).addClass('active');
        }
    }


});

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
