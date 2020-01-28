$(document).ready(function () {
    getSTPClientDataDetails();
})

(function addOnClickForSaveChanges() {
    $('body > div.container.mt-3 > header > button.btn-lg.btn-warning.pull-right.mr-5').click(() => {
        saveChangesForSTPClient();
    })
}());

function getSTPClientID() {
    return clientID = window.location.href.substr(48);
}

function getInputVals() {

    let profileID = $('body > div.container.mt-3 > header > div.container > div:nth-child(4) > input').val();
    let isManufacturer = $('#squaredThree').prop('checked');
    return {
        profileID,
        isManufacturer
    };
}

function getSTPClientDataDetails() {
    let clientID = getSTPClientID();
    console.log(clientID);
    $.ajax({
        url: `/api/getClientSTP/details/${clientID}`,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            visualizeData(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function saveChangesForSTPClient() {
    let clientID = getSTPClientID();
    let {
        isManufacturer,
        profileID
    } = getInputVals();
    validateProfileID(profileID);
    $.ajax({
        url: `/api/saveClientSTPChanges/details/${clientID}`,
        method: 'POST',
        dataType: 'json',
        data: {
            isManufacturer,
            profileID
        },
        success: function () {
            refreshURL()
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function refreshURL() {
    location.reload();
}

function visualizeData(data) {
    let name = data['client_name'];
    let ident_code = data['ident_code'];
    let profileID = data['profile_id'];
    let isManufacturer = data['is_manufacturer'];
    $('body > div.container.mt-3 > header > div.container > div:nth-child(2) > input').val(name);
    $('body > div.container.mt-3 > header > div.container > div:nth-child(3) > input').val(ident_code);
    $('body > div.container.mt-3 > header > div.container > div:nth-child(4) > input').val(profileID);
    if (isManufacturer === 1) {
        $('#squaredThree').prop('checked', true);
    }
}

function goBack() {
    window.history.back();
}

function validateProfileID(profileID) {
    if (isNaN(profileID)) {
        notification('Въведен неправилен формат за профил ID. Трябва да е число.', 'error')
        throw new Error('Въведен неправилен формат за профил ID. Трябва да е число.')
    }
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