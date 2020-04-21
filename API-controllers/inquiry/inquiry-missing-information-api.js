const express = require('express');
const router = express.Router();
const {
    db,
    dbSync
} = require('../../db.js');

router.post('/api/filter/inquiry-missing-information/hour-readings', (req, res) => {
    let {
        search,
        start,
        length,
        fromDate,
        toDate,
        name,
        ident_code,
        erp,
        order
    } = req.body;

    const columnNum = order[0].column;
    const columnType = getColumnsTypeHourReading(columnNum)
    const orderType = order[0].dir;

    const clientsTable = `clients`;
    const table = `hour_readings`;
    let sql = `SELECT ${table}.id, ${clientsTable}.ident_code, ${clientsTable}.client_name, ${clientsTable}.id as cId, ${clientsTable}.erp_type, ${table}.date
    FROM ${clientsTable}
    INNER JOIN ${table} on ${clientsTable}.id = ${table}.client_id  
    WHERE 1=1 `;
    let countTotalSql = `SELECT COUNT(${table}.id) as countTotal
    FROM ${clientsTable}
    INNER JOIN ${table} on ${clientsTable}.id = ${table}.client_id  
    WHERE 1=1 `;
    let countFilteredSql = `SELECT COUNT(${table}.id) as countFiltered
    FROM ${clientsTable}
    INNER JOIN ${table} on ${clientsTable}.id = ${table}.client_id  
    WHERE 1=1 `;

    if (fromDate != -1 && toDate != -1) {
        sql += ` AND ${table}.date>='${fromDate}' AND ${table}.date<= '${toDate}' `;
        countFilteredSql += ` AND ${table}.date>='${fromDate}' AND ${table}.date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += ` AND ${table}.date>='${fromDate}' `;
        countFilteredSql += ` AND ${table}.date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += ` AND ${table}.date<='${toDate}' `;
        countFilteredSql += ` AND ${table}.date<='${toDate}' `;
    }
    if (name != -1) {
        sql += ` AND ${clientsTable}.client_name = '${name}' `
        countFilteredSql += ` AND ${clientsTable}.client_name = '${name}' `;
    }
    if (ident_code != -1) {
        sql += ` AND ${clientsTable}.ident_code = '${ident_code}'`;
        countFilteredSql += ` AND ${clientsTable}.ident_code = '${ident_code}'`;
    }
    if (erp && erp.length !== 3 && erp.length != 0) {
        if (erp.length == 1) {
            sql += ` AND ${clientsTable}.erp_type = '${erp}'`;
            countFilteredSql += ` AND ${clientsTable}.erp_type = '${erp}'`;
        } else if (erp.length == 2) {
            sql += ` AND ( ${clientsTable}.erp_type = '${erp[0]}'`;
            sql += ` OR ${clientsTable}.erp_type = '${erp[1]}' )`;
            countFilteredSql += ` AND ( ${clientsTable}.erp_type = '${erp[0]}'`;
            countFilteredSql += ` OR ${clientsTable}.erp_type = '${erp[1]}' )`;
        }
    } else if (erp == undefined) {
        return res.send(JSON.stringify([]));
    }

    sql += ` AND (${table}.hour_zero = -1 OR ${table}.hour_one = -1 OR ${table}.hour_two = -1 OR ${table}.hour_three = -1 OR ${table}.hour_four = -1 OR ${table}.hour_five = -1 OR ${table}.hour_six = -1 OR ${table}.hour_seven = -1 OR ${table}.hour_eight = -1 OR ${table}.hour_nine = -1 OR ${table}.hour_ten = -1 OR ${table}.hour_eleven = -1 OR ${table}.hour_twelve = -1 OR ${table}.hour_thirteen = -1 OR ${table}.hour_fourteen = -1 OR ${table}.hour_fifteen = -1 OR ${table}.hour_sixteen = -1 OR ${table}.hour_seventeen = -1 OR ${table}.hour_eighteen = -1 OR ${table}.hour_nineteen = -1 OR ${table}.hour_twenty = -1 OR ${table}.hour_twentyone = -1 OR ${table}.hour_twentytwo = -1 OR ${table}.hour_twentythree = -1 )`
    countFilteredSql += ` AND (${table}.hour_zero = -1 OR ${table}.hour_one = -1 OR ${table}.hour_two = -1 OR ${table}.hour_three = -1 OR ${table}.hour_four = -1 OR ${table}.hour_five = -1 OR ${table}.hour_six = -1 OR ${table}.hour_seven = -1 OR ${table}.hour_eight = -1 OR ${table}.hour_nine = -1 OR ${table}.hour_ten = -1 OR ${table}.hour_eleven = -1 OR ${table}.hour_twelve = -1 OR ${table}.hour_thirteen = -1 OR ${table}.hour_fourteen = -1 OR ${table}.hour_fifteen = -1 OR ${table}.hour_sixteen = -1 OR ${table}.hour_seventeen = -1 OR ${table}.hour_eighteen = -1 OR ${table}.hour_nineteen = -1 OR ${table}.hour_twenty = -1 OR ${table}.hour_twentyone = -1 OR ${table}.hour_twentytwo = -1 OR ${table}.hour_twentythree = -1 )`;

    if (search.value) {
        sql += `  AND (${table}.date = '%${search.value}%' OR ${clientsTable}.client_name LIKE '%${search.value}%' OR ${clientsTable}.ident_code LIKE '%${search.value}%' ) `;
        countFilteredSql += `  AND (${table}.date = '%${search.value}%' OR ${clientsTable}.client_name LIKE '%${search.value}%' OR ${clientsTable}.ident_code LIKE '%${search.value}%' ) `;
    }

    sql += ` ORDER BY ${columnType} ${orderType}`;
    sql += ` LIMIT ${start},${length}`;
    const countSQL = countTotalSql + ' UNION ' + countFilteredSql;

    db.query(countSQL, (err, countTotal) => {
        if (err) {
            throw err;
        }
        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            const recordsTotal = countTotal[0].countTotal;
            const recordsFiltered = countTotal[1] ? countTotal[1].countTotal : countTotal[0].countTotal
            let arr = {
                recordsTotal,
                recordsFiltered,
                data: result
            }
            return res.send(JSON.stringify(arr));
        })
    });
});
router.post('/api/filter/inquiry-missing-information/stp-hour-readings', (req, res) => {
    let {
        search,
        start,
        length,
        fromDate,
        toDate,
        name,
        ident_code,
        erp,
        order
    } = req.body;

    const columnNum = order[0].column;
    const columnType = getColumnsTypeSTPHourReading(columnNum)
    const orderType = order[0].dir;

    const clientsTable = `clients`;
    const table = `stp_hour_readings`;
    let sql = `SELECT ${table}.id, ${clientsTable}.ident_code, ${clientsTable}.client_name, ${clientsTable}.id as cId, ${clientsTable}.erp_type, ${table}.date
    FROM ${clientsTable}
    INNER JOIN ${table} on ${clientsTable}.id = ${table}.client_id  
    WHERE 1=1 `;
    let countTotalSql = `SELECT COUNT(${table}.id) as countTotal
    FROM ${clientsTable}
    INNER JOIN ${table} on ${clientsTable}.id = ${table}.client_id  
    WHERE 1=1 `;
    let countFilteredSql = `SELECT COUNT(${table}.id) as countFiltered
    FROM ${clientsTable}
    INNER JOIN ${table} on ${clientsTable}.id = ${table}.client_id  
    WHERE 1=1 `;

    if (fromDate != -1 && toDate != -1) {
        sql += ` AND ${table}.date>='${fromDate}' AND ${table}.date<= '${toDate}' `;
        countFilteredSql += ` AND ${table}.date>='${fromDate}' AND ${table}.date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += ` AND ${table}.date>='${fromDate}' `;
        countFilteredSql += ` AND ${table}.date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += ` AND ${table}.date<='${toDate}' `;
        countFilteredSql += ` AND ${table}.date<='${toDate}' `;
    }
    if (name != -1) {
        sql += ` AND ${clientsTable}.client_name = '${name}' `
        countFilteredSql += ` AND ${clientsTable}.client_name = '${name}' `;
    }
    if (ident_code != -1) {
        sql += ` AND ${clientsTable}.ident_code = '${ident_code}'`;
        countFilteredSql += ` AND ${clientsTable}.ident_code = '${ident_code}'`;
    }
    if (erp && erp.length !== 3 && erp.length != 0) {
        if (erp.length == 1) {
            sql += ` AND ${clientsTable}.erp_type = '${erp}'`;
            countFilteredSql += ` AND ${clientsTable}.erp_type = '${erp}'`;
        } else if (erp.length == 2) {
            sql += ` AND ( ${clientsTable}.erp_type = '${erp[0]}'`;
            sql += ` OR ${clientsTable}.erp_type = '${erp[1]}' )`;
            countFilteredSql += ` AND ( ${clientsTable}.erp_type = '${erp[0]}'`;
            countFilteredSql += ` OR ${clientsTable}.erp_type = '${erp[1]}' )`;
        }
    } else if (erp == undefined) {
        return res.send(JSON.stringify([]));
    }

    sql += ` AND (${table}.hour_zero = -1 OR ${table}.hour_one = -1 OR ${table}.hour_two = -1 OR ${table}.hour_three = -1 OR ${table}.hour_four = -1 OR ${table}.hour_five = -1 OR ${table}.hour_six = -1 OR ${table}.hour_seven = -1 OR ${table}.hour_eight = -1 OR ${table}.hour_nine = -1 OR ${table}.hour_ten = -1 OR ${table}.hour_eleven = -1 OR ${table}.hour_twelve = -1 OR ${table}.hour_thirteen = -1 OR ${table}.hour_fourteen = -1 OR ${table}.hour_fifteen = -1 OR ${table}.hour_sixteen = -1 OR ${table}.hour_seventeen = -1 OR ${table}.hour_eighteen = -1 OR ${table}.hour_nineteen = -1 OR ${table}.hour_twenty = -1 OR ${table}.hour_twentyone = -1 OR ${table}.hour_twentytwo = -1 OR ${table}.hour_twentythree = -1 )`
    countFilteredSql += ` AND (${table}.hour_zero = -1 OR ${table}.hour_one = -1 OR ${table}.hour_two = -1 OR ${table}.hour_three = -1 OR ${table}.hour_four = -1 OR ${table}.hour_five = -1 OR ${table}.hour_six = -1 OR ${table}.hour_seven = -1 OR ${table}.hour_eight = -1 OR ${table}.hour_nine = -1 OR ${table}.hour_ten = -1 OR ${table}.hour_eleven = -1 OR ${table}.hour_twelve = -1 OR ${table}.hour_thirteen = -1 OR ${table}.hour_fourteen = -1 OR ${table}.hour_fifteen = -1 OR ${table}.hour_sixteen = -1 OR ${table}.hour_seventeen = -1 OR ${table}.hour_eighteen = -1 OR ${table}.hour_nineteen = -1 OR ${table}.hour_twenty = -1 OR ${table}.hour_twentyone = -1 OR ${table}.hour_twentytwo = -1 OR ${table}.hour_twentythree = -1 )`;

    if (search.value) {
        sql += `  AND (${table}.date = '%${search.value}%' OR ${clientsTable}.client_name LIKE '%${search.value}%' OR ${clientsTable}.ident_code LIKE '%${search.value}%' ) `;
        countFilteredSql += `  AND (${table}.date = '%${search.value}%' OR ${clientsTable}.client_name LIKE '%${search.value}%' OR ${clientsTable}.ident_code LIKE '%${search.value}%' ) `;
    }

    sql += ` ORDER BY ${columnType} ${orderType}`;
    sql += ` LIMIT ${start},${length}`;
    const countSQL = countTotalSql + ' UNION ' + countFilteredSql;

    db.query(countSQL, (err, countTotal) => {
        if (err) {
            throw err;
        }
        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            const recordsTotal = countTotal[0].countTotal;
            const recordsFiltered = countTotal[1] ? countTotal[1].countTotal : countTotal[0].countTotal
            let arr = {
                recordsTotal,
                recordsFiltered,
                data: result
            }
            return res.send(JSON.stringify(arr));
        })
    });
});
router.post('/api/filter/inquiry-missing-information/eso', (req, res) => {
    let {
        search,
        start,
        length,
        fromDate,
        toDate,
        order,
    } = req.body;

    const columnNum = order[0].column;
    const columnType = getColumnsTypeESO(columnNum)
    const orderType = order[0].dir;

    const table = `hour_readings_eso`;
    let sql = `SELECT ${table}.id, ${table}.date, ${table}.type FROM ${table} 
    WHERE 1=1 `;
    let countTotalSql = `SELECT COUNT(${table}.id) as countTotal
    FROM ${table}
    WHERE 1 = 1 `;
    let countFilteredSql = `SELECT COUNT(${table}.id) as countFiltered
    FROM ${table}
    WHERE 1 = 1 `;

    if (fromDate != -1 && toDate != -1) {
        sql += ` AND ${table}.date>='${fromDate}' AND ${table}.date<= '${toDate}' `;
        countFilteredSql += ` AND ${table}.date>='${fromDate}' AND ${table}.date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += ` AND ${table}.date>='${table}' `;
        countFilteredSql += ` AND ${table}.date>='${table}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += ` AND ${table}.date<='${table}' `;
        countFilteredSql += ` AND ${table}.date<='${table}' `;
    }

    sql += ` AND (${table}.hour_zero = -1 OR ${table}.hour_one = -1 OR ${table}.hour_two = -1 OR ${table}.hour_three = -1 OR ${table}.hour_four = -1 OR ${table}.hour_five = -1 OR ${table}.hour_six = -1 OR ${table}.hour_seven = -1 OR ${table}.hour_eight = -1 OR ${table}.hour_nine = -1 OR ${table}.hour_ten = -1 OR ${table}.hour_eleven = -1 OR ${table}.hour_twelve = -1 OR ${table}.hour_thirteen = -1 OR ${table}.hour_fourteen = -1 OR ${table}.hour_fifteen = -1 OR ${table}.hour_sixteen = -1 OR ${table}.hour_seventeen = -1 OR ${table}.hour_eighteen = -1 OR ${table}.hour_nineteen = -1 OR ${table}.hour_twenty = -1 OR ${table}.hour_twentyone = -1 OR ${table}.hour_twentytwo = -1 OR ${table}.hour_twentythree = -1 )`
    countFilteredSql += ` AND (${table}.hour_zero = -1 OR ${table}.hour_one = -1 OR ${table}.hour_two = -1 OR ${table}.hour_three = -1 OR ${table}.hour_four = -1 OR ${table}.hour_five = -1 OR ${table}.hour_six = -1 OR ${table}.hour_seven = -1 OR ${table}.hour_eight = -1 OR ${table}.hour_nine = -1 OR ${table}.hour_ten = -1 OR ${table}.hour_eleven = -1 OR ${table}.hour_twelve = -1 OR ${table}.hour_thirteen = -1 OR ${table}.hour_fourteen = -1 OR ${table}.hour_fifteen = -1 OR ${table}.hour_sixteen = -1 OR ${table}.hour_seventeen = -1 OR ${table}.hour_eighteen = -1 OR ${table}.hour_nineteen = -1 OR ${table}.hour_twenty = -1 OR ${table}.hour_twentyone = -1 OR ${table}.hour_twentytwo = -1 OR ${table}.hour_twentythree = -1 )`;

    if (search.value) {
        sql += `  AND (${table}.date = '%${search.value}%' ) `;
        countFilteredSql += `  AND (${table}.date = '%${search.value}%'  ) `;
    }
    sql += ` ORDER BY ${columnType} ${orderType}`;
    sql += ` LIMIT ${start},${length}`;
    const countSQL = countTotalSql + ' UNION ' + countFilteredSql;

    db.query(countSQL, (err, countTotal) => {
        if (err) {
            throw err;
        }
        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            const recordsTotal = countTotal[0].countTotal;
            const recordsFiltered = countTotal[1] ? countTotal[1].countTotal : countTotal[0].countTotal
            let arr = {
                recordsTotal,
                recordsFiltered,
                data: result
            }

            return res.send(JSON.stringify(arr));
        })
    });
});
router.post('/api/filter/inquiry-missing-information/graphs', (req, res) => {
    let {
        search,
        start,
        length,
        fromDate,
        toDate,
        name,
        ident_code,
        erp,
        order
    } = req.body;

    const columnNum = order[0].column;
    const columnType = getColumnsTypeGraphs(columnNum)
    const orderType = order[0].dir;

    const clientsTable = `clients`;
    const table = `hour_prediction`;
    let sql = `SELECT ${table}.id, ${clientsTable}.ident_code, ${clientsTable}.client_name, ${clientsTable}.id as cId, ${clientsTable}.erp_type, ${table}.date
    FROM ${clientsTable}
    INNER JOIN ${table} on ${clientsTable}.id = ${table}.client_id  
    WHERE 1=1 `;
    let countTotalSql = `SELECT COUNT(${table}.id) as countTotal
    FROM ${clientsTable}
    INNER JOIN ${table} on ${clientsTable}.id = ${table}.client_id  
    WHERE 1=1 `;
    let countFilteredSql = `SELECT COUNT(${table}.id) as countFiltered
    FROM ${clientsTable}
    INNER JOIN ${table} on ${clientsTable}.id = ${table}.client_id  
    WHERE 1=1 `;

    if (fromDate != -1 && toDate != -1) {
        sql += ` AND ${table}.date>='${fromDate}' AND ${table}.date<= '${toDate}' `;
        countFilteredSql += ` AND ${table}.date>='${fromDate}' AND ${table}.date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += ` AND ${table}.date>='${fromDate}' `;
        countFilteredSql += ` AND ${table}.date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += ` AND ${table}.date<='${toDate}' `;
        countFilteredSql += ` AND ${table}.date<='${toDate}' `;
    }
    if (name != -1) {
        sql += ` AND ${clientsTable}.client_name = '${name}' `
        countFilteredSql += ` AND ${clientsTable}.client_name = '${name}' `;
    }
    if (ident_code != -1) {
        sql += ` AND ${clientsTable}.ident_code = '${ident_code}'`;
        countFilteredSql += ` AND ${clientsTable}.ident_code = '${ident_code}'`;
    }
    if (erp && erp.length !== 3 && erp.length != 0) {
        if (erp.length == 1) {
            sql += ` AND ${clientsTable}.erp_type = '${erp}'`;
            countFilteredSql += ` AND ${clientsTable}.erp_type = '${erp}'`;
        } else if (erp.length == 2) {
            sql += ` AND ( ${clientsTable}.erp_type = '${erp[0]}'`;
            sql += ` OR ${clientsTable}.erp_type = '${erp[1]}' )`;
            countFilteredSql += ` AND ( ${clientsTable}.erp_type = '${erp[0]}'`;
            countFilteredSql += ` OR ${clientsTable}.erp_type = '${erp[1]}' )`;
        }
    } else if (erp == undefined) {
        return res.send(JSON.stringify([]));
    }

    sql += ` AND (${table}.hour_zero = -1 OR ${table}.hour_one = -1 OR ${table}.hour_two = -1 OR ${table}.hour_three = -1 OR ${table}.hour_four = -1 OR ${table}.hour_five = -1 OR ${table}.hour_six = -1 OR ${table}.hour_seven = -1 OR ${table}.hour_eight = -1 OR ${table}.hour_nine = -1 OR ${table}.hour_ten = -1 OR ${table}.hour_eleven = -1 OR ${table}.hour_twelve = -1 OR ${table}.hour_thirteen = -1 OR ${table}.hour_fourteen = -1 OR ${table}.hour_fifteen = -1 OR ${table}.hour_sixteen = -1 OR ${table}.hour_seventeen = -1 OR ${table}.hour_eighteen = -1 OR ${table}.hour_nineteen = -1 OR ${table}.hour_twenty = -1 OR ${table}.hour_twentyone = -1 OR ${table}.hour_twentytwo = -1 OR ${table}.hour_twentythree = -1 )`
    countFilteredSql += ` AND (${table}.hour_zero = -1 OR ${table}.hour_one = -1 OR ${table}.hour_two = -1 OR ${table}.hour_three = -1 OR ${table}.hour_four = -1 OR ${table}.hour_five = -1 OR ${table}.hour_six = -1 OR ${table}.hour_seven = -1 OR ${table}.hour_eight = -1 OR ${table}.hour_nine = -1 OR ${table}.hour_ten = -1 OR ${table}.hour_eleven = -1 OR ${table}.hour_twelve = -1 OR ${table}.hour_thirteen = -1 OR ${table}.hour_fourteen = -1 OR ${table}.hour_fifteen = -1 OR ${table}.hour_sixteen = -1 OR ${table}.hour_seventeen = -1 OR ${table}.hour_eighteen = -1 OR ${table}.hour_nineteen = -1 OR ${table}.hour_twenty = -1 OR ${table}.hour_twentyone = -1 OR ${table}.hour_twentytwo = -1 OR ${table}.hour_twentythree = -1 )`;

    if (search.value) {
        sql += `  AND (${table}.date = '%${search.value}%' OR ${clientsTable}.client_name LIKE '%${search.value}%' OR ${clientsTable}.ident_code LIKE '%${search.value}%' ) `;
        countFilteredSql += `  AND (${table}.date = '%${search.value}%' OR ${clientsTable}.client_name LIKE '%${search.value}%' OR ${clientsTable}.ident_code LIKE '%${search.value}%' ) `;
    }

    sql += ` ORDER BY ${columnType} ${orderType}`;
    sql += ` LIMIT ${start},${length}`;
    const countSQL = countTotalSql + ' UNION ' + countFilteredSql;

    db.query(countSQL, (err, countTotal) => {
        if (err) {
            throw err;
        }
        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            const recordsTotal = countTotal[0].countTotal;
            const recordsFiltered = countTotal[1] ? countTotal[1].countTotal : countTotal[0].countTotal
            let arr = {
                recordsTotal,
                recordsFiltered,
                data: result
            }
            return res.send(JSON.stringify(arr));
        })
    });
});
router.post('/api/filter/inquiry-missing-information/stp-graphs', (req, res) => {
    let {
        search,
        start,
        length,
        fromDate,
        toDate,
        name,
        ident_code,
        erp,
        order
    } = req.body;

    const columnNum = order[0].column;
    const columnType = getColumnsTypeSTPGraphs(columnNum)
    const orderType = order[0].dir;

    const clientsTable = `clients`;
    const table = `prediction`;
    const hoursTable = `profile_coef`;

    let sql = `SELECT ${table}.id, ${clientsTable}.ident_code, ${clientsTable}.client_name, ${clientsTable}.id as cId, ${clientsTable}.erp_type, ${table}.date
    FROM ${clientsTable}
    INNER JOIN ${table} on ${clientsTable}.id = ${table}.client_id  
    INNER JOIN ${hoursTable} on ${hoursTable}.date = ${table}.date
    WHERE 1=1 `;
    let countTotalSql = `SELECT COUNT(${table}.id) as countTotal
    FROM ${clientsTable}
    INNER JOIN ${table} on ${clientsTable}.id = ${table}.client_id 
    INNER JOIN ${hoursTable} on ${hoursTable}.date = ${table}.date 
    WHERE 1=1 `;
    let countFilteredSql = `SELECT COUNT(${table}.id) as countFiltered
    FROM ${clientsTable}
    INNER JOIN ${table} on ${clientsTable}.id = ${table}.client_id 
    INNER JOIN ${hoursTable} on ${hoursTable}.date = ${table}.date 
    WHERE 1=1 `;

    if (fromDate != -1 && toDate != -1) {
        sql += ` AND ${table}.date>='${fromDate}' AND ${table}.date<= '${toDate}' `;
        countFilteredSql += ` AND ${table}.date>='${fromDate}' AND ${table}.date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += ` AND ${table}.date>='${fromDate}' `;
        countFilteredSql += ` AND ${table}.date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += ` AND ${table}.date<='${toDate}' `;
        countFilteredSql += ` AND ${table}.date<='${toDate}' `;
    }
    if (name != -1) {
        sql += ` AND ${clientsTable}.client_name = '${name}' `
        countFilteredSql += ` AND ${clientsTable}.client_name = '${name}' `;
    }
    if (ident_code != -1) {
        sql += ` AND ${clientsTable}.ident_code = '${ident_code}'`;
        countFilteredSql += ` AND ${clientsTable}.ident_code = '${ident_code}'`;
    }
    if (erp && erp.length !== 3 && erp.length != 0) {
        if (erp.length == 1) {
            sql += ` AND ${clientsTable}.erp_type = '${erp}'`;
            countFilteredSql += ` AND ${clientsTable}.erp_type = '${erp}'`;
        } else if (erp.length == 2) {
            sql += ` AND ( ${clientsTable}.erp_type = '${erp[0]}'`;
            sql += ` OR ${clientsTable}.erp_type = '${erp[1]}' )`;
            countFilteredSql += ` AND ( ${clientsTable}.erp_type = '${erp[0]}'`;
            countFilteredSql += ` OR ${clientsTable}.erp_type = '${erp[1]}' )`;
        }
    } else if (erp == undefined) {
        return res.send(JSON.stringify([]));
    }

    sql += ` AND (${hoursTable}.hour_zero = -1 OR ${hoursTable}.hour_one = -1 OR ${hoursTable}.hour_two = -1 OR ${hoursTable}.hour_three = -1 OR ${hoursTable}.hour_four = -1 OR ${hoursTable}.hour_five = -1 OR ${hoursTable}.hour_six = -1 OR ${hoursTable}.hour_seven = -1 OR ${hoursTable}.hour_eight = -1 OR ${hoursTable}.hour_nine = -1 OR ${hoursTable}.hour_ten = -1 OR ${hoursTable}.hour_eleven = -1 OR ${hoursTable}.hour_twelve = -1 OR ${hoursTable}.hour_thirteen = -1 OR ${hoursTable}.hour_fourteen = -1 OR ${hoursTable}.hour_fifteen = -1 OR ${hoursTable}.hour_sixteen = -1 OR ${hoursTable}.hour_seventeen = -1 OR ${hoursTable}.hour_eighteen = -1 OR ${hoursTable}.hour_nineteen = -1 OR ${hoursTable}.hour_twenty = -1 OR ${hoursTable}.hour_twentyone = -1 OR ${hoursTable}.hour_twentytwo = -1 OR ${hoursTable}.hour_twentythree = -1 )`
    countFilteredSql += ` AND (${hoursTable}.hour_zero = -1 OR ${hoursTable}.hour_one = -1 OR ${hoursTable}.hour_two = -1 OR ${hoursTable}.hour_three = -1 OR ${hoursTable}.hour_four = -1 OR ${hoursTable}.hour_five = -1 OR ${hoursTable}.hour_six = -1 OR ${hoursTable}.hour_seven = -1 OR ${hoursTable}.hour_eight = -1 OR ${hoursTable}.hour_nine = -1 OR ${hoursTable}.hour_ten = -1 OR ${hoursTable}.hour_eleven = -1 OR ${hoursTable}.hour_twelve = -1 OR ${hoursTable}.hour_thirteen = -1 OR ${hoursTable}.hour_fourteen = -1 OR ${hoursTable}.hour_fifteen = -1 OR ${hoursTable}.hour_sixteen = -1 OR ${hoursTable}.hour_seventeen = -1 OR ${hoursTable}.hour_eighteen = -1 OR ${hoursTable}.hour_nineteen = -1 OR ${hoursTable}.hour_twenty = -1 OR ${hoursTable}.hour_twentyone = -1 OR ${hoursTable}.hour_twentytwo = -1 OR ${hoursTable}.hour_twentythree = -1 )`;

    if (search.value) {
        sql += `  AND (${table}.date = '%${search.value}%' OR ${clientsTable}.client_name LIKE '%${search.value}%' OR ${clientsTable}.ident_code LIKE '%${search.value}%' ) `;
        countFilteredSql += `  AND (${table}.date = '%${search.value}%' OR ${clientsTable}.client_name LIKE '%${search.value}%' OR ${clientsTable}.ident_code LIKE '%${search.value}%' ) `;
    }

    sql += ` ORDER BY ${columnType} ${orderType}`;
    sql += ` LIMIT ${start},${length}`;
    const countSQL = countTotalSql + ' UNION ' + countFilteredSql;

    db.query(countSQL, (err, countTotal) => {
        if (err) {
            throw err;
        }
        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            const recordsTotal = countTotal[0].countTotal;
            const recordsFiltered = countTotal[1] ? countTotal[1].countTotal : countTotal[0].countTotal
            let arr = {
                recordsTotal,
                recordsFiltered,
                data: result
            }
            return res.send(JSON.stringify(arr));
        })
    });
});

function getColumnsTypeHourReading(columnNum) {
    let result = 'hour_readings.id';

    switch (columnNum) {
        case '0':
            result = 'hour_readings.id'
            break;
        case '1':
            result = 'clients.client_name'
            break;
        case '2':
            result = 'clients.ident_code'
            break;
        case '3':
            result = 'hour_readings.date'
            break;
        case '4':
            result = 'clients.erp_type'
            break;
    }
    return result
}

function getColumnsTypeSTPHourReading(columnNum) {
    let result = 'stp_hour_readings.id';

    switch (columnNum) {
        case '0':
            result = 'stp_hour_readings.id'
            break;
        case '1':
            result = 'clients.client_name'
            break;
        case '2':
            result = 'clients.ident_code'
            break;
        case '3':
            result = 'stp_hour_readings.date'
            break;
        case '4':
            result = 'clients.erp_type'
            break;
    }
    return result
}

function getColumnsTypeGraphs(columnNum) {
    let result = 'hour_prediction.id';

    switch (columnNum) {
        case '0':
            result = 'hour_prediction.id'
            break;
        case '1':
            result = 'clients.client_name'
            break;
        case '2':
            result = 'clients.ident_code'
            break;
        case '3':
            result = 'hour_prediction.date'
            break;
        case '4':
            result = 'clients.erp_type'
            break;
    }
    return result
}

function getColumnsTypeSTPGraphs(columnNum) {
    let result = 'prediction.id';

    switch (columnNum) {
        case '0':
            result = 'prediction.id'
            break;
        case '1':
            result = 'clients.client_name'
            break;
        case '2':
            result = 'clients.ident_code'
            break;
        case '3':
            result = 'prediction.date'
            break;
        case '4':
            result = 'clients.erp_type'
            break;
    }
    return result
}

function getColumnsTypeESO(columnNum) {
    let result = 'hour_readings_eso.id';

    switch (columnNum) {
        case '0':
            result = 'hour_readings_eso.id'
            break;
        case '1':
            result = 'hour_readings_eso.date'
            break;
        case '2':
            result = 'hour_readings_eso.type'
            break;
    }
    return result
}

module.exports = router;