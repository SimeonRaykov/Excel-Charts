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
        toastr.options.timeOut = 5000;
        toastr.error(msg);
    } else if (type == 'success') {
        toastr.options.timeOut = 5000;
        toastr.success(msg);
    } else if (type == 'loading') {
        toastr.options.timeOut = 8800000;
        toastr.info(msg);
    }
};