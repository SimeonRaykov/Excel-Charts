$(document).ready(function () {
    document.getElementById('input-excel').addEventListener('drop', handleDrop, false);
});

function handleDrop(e) {
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

            console.log(getCols(workbook['Sheets'][`${first_sheet_name}`]));
        };
        reader.readAsArrayBuffer(f);
    } else if (extension === 'csv') {

        reader.readAsText(f,'CP1251');
        reader.onload = loadHandler;
    }
    else{


        
    }
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
    console.log(csv);
    let text = csv.split("/\r\n|\n");

    for (let i = 0; i < text.length; i++) {
        let row = text[i].split(';');

        let col = [];
        for (let j = 0; j < row.length; j++) {
            col.push(row[j]);
        }
        console.log(col);
    }
}