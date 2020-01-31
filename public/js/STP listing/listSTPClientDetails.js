$(document).ready(function () {
    getSTPClientDataDetails();
});

(function addOnClickForSaveChanges() {
    $('body > div.container.mt-3 > header > button.btn-lg.btn-warning.pull-right.mr-5').click(() => {
        saveChangesForSTPClient();
    })
}());

function getSTPClientID() {
    console.log(window.location.href.substr(52));
    return clientID = window.location.href.substr(52);
}

function getInputVals() {

    let profileID = $('body > div.container.mt-3 > header > div.container > div:nth-child(4) > input').attr('data-id');
    let isManufacturer = $('#squaredThree').prop('checked');

    return {
        profileID,
        isManufacturer
    };

}

function getSTPClientDataDetails() {
    let clientID = getSTPClientID();
    $.ajax({
        url: `/api/getClientSTP/details/${clientID}`,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            visualizeData(data);
            getDatalistingOptions(data['operator']);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function visualizeDataListings(data) {
    for (let el in data) {
        if (data[el]['profile_name'] != undefined && data[el]['profile_name'] != null && data[el]['profile_name'] != '') {
            const curr = $(`<option data-id="${data[el]['id']}" value="${data[el]['profile_name']}">`)
            curr.appendTo('#profilesID');
        }
    }
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

function saveChangesForSTPClient() {
    let clientID = getSTPClientID();
    setTimeout(function () {
        let {
            isManufacturer,
            profileID
        } = getInputVals();
        if (profileID == undefined) {
            profileID = $('body > div.container.mt-3 > header > div.container > div:nth-child(4) > input').attr('placeholder');
        }
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
    }, 0);
}

(function addProfileIDtoInput() {
    $('body > div.container.mt-3 > header > button.btn-lg.btn-warning.pull-right.mr-5').on('click', () => {
        let options = $('#profilesID').children();
        for (let option of options) {
            if ($('body > div.container.mt-3 > header > div.container > div:nth-child(4) > input').val() == option.value) {
                $('body > div.container.mt-3 > header > div.container > div:nth-child(4) > input').attr('data-id', option.getAttribute('data-id'));
            }
        }
    })
}());

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
    $('body > div.container.mt-3 > header > div.container > div:nth-child(4) > input').attr('placeholder', profileID);

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