const companies = {
    CEZ: 'CEZ',
    ENERGO_PRO: 'ENERGO_PRO',
    EVN: 'EVN'
};
var company = '';
($('body > div.container').click(() => {

    if ($('#energo-pro').is(':checked')) {
        company = 'ENERGO_PRO';
    } else if ($('#cez').is(':checked')) {
        company = 'CEZ';
    } else if ($('#evn').is(':checked')) {
        company = 'EVN';
    }
    if (company === '') {
        notification('Choose company', 'error');
    } else if (company !== '') {
        notification('Company chosen', 'success')
    }
    console.log(company);
}));

$(document).ready(function () {
    document.getElementById('input-excel').addEventListener('drop', processFile, false);
});

function processFile(e) {

    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files,
        f = files[0];
    var reader = new FileReader();
    var fileName = e.dataTransfer.files[0].name;
    let extension = fileName.slice(fileName.lastIndexOf('.') + 1);

    if (extension === 'xls') {
        reader.onload = function (e) {

            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, {
                type: 'array'
            });
            let first_sheet_name = workbook.SheetNames[0];
            //var address_of_cell = 'A139';
            /* Get worksheet */
            //var worksheet = workbook.Sheets[first_sheet_name];
            /* Find desired cell */
            //var desired_cell = worksheet[address_of_cell];
            /* Get the value */
            //var desired_value = (desired_cell ? desired_cell.v : undefined);
            // console.log(Object.keys(workbook['Sheets']['Sheet1']));
            //console.log(desired_value);

            //   console.log(getCols(workbook['Sheets'][`${first_sheet_name}`]));



            //Energo-pro 
            if (companies.ENERGO_PRO === company) {
                getCols(workbook['Sheets'][`${first_sheet_name}`]).forEach(function (value, i) {
                    /*   if (i !== 0) {
                           let clientNumber = value['7'];
                           let identCode = value['4'];
                           let dateCreated = new Date();
                           let period_from = value['12'];
                           let period_to = value['13'];
                           let periodDays = value['14'];
                           let scaleNumber = value['15'];
                           let scaleType = value['17'];
                           let timeZone = value['18'];
                           let readingsNew = value['19'];
                           let readingOld = value['20'];
                           let diff = value['21'];
                           let correction = value['23'];
                           let deduction = value['24'];
                           let totalQty = value['25'];
                           let service = value['26'];
                           let qty = value['27'];
                           let price = value['28'];
                           let valueBgn = value['29'];
                           let type = value['3'];
                           if (type === 'Техническа част') {
                               type = 1;
                           } else if (type === 'Разпределение') {
                               type = 2;
                           }
                           let operator = '3' //ENERGOPRO !
                       }
                       console.log(value); */
                });
            }



            //CEZ 
            if (companies.CEZ === company) {
                getCols(workbook['Sheets'][`${first_sheet_name}`]).forEach(function (value, i) {
                    /*   if (i !== 0 && i !== 1) {
                           let clientNumber = value['7'];
                           let identCode = value['4'];
                           let dateCreated = new Date();
                           let period_from = value['12'];
                           let period_to = value['13'];
                           let periodDays = value['14'];
                           let scaleNumber = value['15'];
                           let scaleType = value['17'];
                           let timeZone = value['18'];
                           let readingsNew = value['19'];
                           let readingOld = value['20'];
                           let diff = value['21'];
                           let correction = value['23'];
                           let deduction = value['24'];
                           let totalQty = value['25'];
                           let service = value['26'];
                           let qty = value['27'];
                           let price = value['28'];
                           let valueBgn = value['29'];
                           let type = value['3'];
                           if (type === 'Техническа част') {
                               type = 1;
                           } else if (type === 'Разпределение') {
                               type = 2;
                           }
                           let operator = '3' //ENERGOPRO !
                       }
                       console.log(value); */
                });
            }

            //EVN
            if (companies.EVN === company) {
                getCols(workbook['Sheets'][`${first_sheet_name}`]).forEach(function (value, i) {
                    /*   if (i !== 0 && i !== 1 && i !==2) {
                           let clientNumber = value['7'];
                           let identCode = value['4'];
                           let dateCreated = new Date();
                           let period_from = value['12'];
                           let period_to = value['13'];
                           let periodDays = value['14'];
                           let scaleNumber = value['15'];
                           let scaleType = value['17'];
                           let timeZone = value['18'];
                           let readingsNew = value['19'];
                           let readingOld = value['20'];
                           let diff = value['21'];
                           let correction = value['23'];
                           let deduction = value['24'];
                           let totalQty = value['25'];
                           let service = value['26'];
                           let qty = value['27'];
                           let price = value['28'];
                           let valueBgn = value['29'];
                           let type = value['3'];
                           if (type === 'Техническа част') {
                               type = 1;
                           } else if (type === 'Разпределение') {
                               type = 2;
                           }
                           let operator = '3' //ENERGOPRO !
                       }
                       console.log(value); */
                });
            }
        };
        reader.readAsArrayBuffer(f);
    } else if (extension === 'csv') {

        reader.readAsText(f, 'CP1251');
        reader.onload = loadHandler;
    } else {
        notification('Invalid file format', 'error');
    }
}


function checkCompany(company) {
    if (company === companies.ENERGO_PRO) {
        return company;
    } else if (company === companies.EVN) {
        return company;
    } else if (company === companies.CEZ) {
        return company;
    }
    notification('Invalid company!', error);
    throw new Error('Invalid company!');
}

function getCols(sheet) {
    var result = [];
    var row;
    var rowNum;
    var colNum;
    var range = XLSX.utils.decode_range(sheet['!ref']);
    for (rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
        row = [];
        for (colNum = range.s.c; colNum <= range.e.c; colNum++) {
            var nextCell = sheet[
                XLSX.utils.encode_cell({
                    r: rowNum,
                    c: colNum
                })
            ];
            if (typeof nextCell === 'undefined') {
                row.push(void 0);
            } else row.push(nextCell.w);
        }
        result.push(row);
    }
    return result;
}

function loadHandler(event) {

    let csv = event.target.result;
    processData(csv);
}

function processData(csv) {
    let text = csv.split("/\r\n|\n");

    for (let i = 0; i < text.length; i++) {
        let row = text[i].split(';');
        let col = [];
        for (let j = 0; j < row.length; j++) {
            col.push(row[j]);
           
        }
        console.log(col);
        console.log(" ");
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
}