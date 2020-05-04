const express = require('express');
const router = express.Router();
const {
    db,
    dbSync
} = require('../../db.js');

router.post('/api/filter/inquiry-missing-information/stp-hour-readings', async (req, res) => {
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
    const columnType = getColumnsTypeFullTable(columnNum)
    const orderType = order[0].dir;
    const {
        id,
        client_name,
        erp_type
    } = await searchClientByIdentCode(ident_code);
    const clientsTable = `clients`;
    const table = `stp_hour_readings`;
    let countSQL = `WITH recursive all_dates(date) AS (
        SELECT '${fromDate}' date
        UNION ALL 
        SELECT date + interval 1 day FROM all_dates WHERE date + interval 1 day <= '${toDate}'
)
SELECT COUNT(d.date) count
FROM all_dates d
LEFT JOIN ${table} t on t.date = d.date AND t.client_id = '${id}'
LEFT JOIN ${clientsTable} c ON c.id = t.client_id 
WHERE t.hour_zero = -1 OR t.hour_one = -1 OR t.hour_two = -1 OR t.hour_three = -1 OR  t.hour_four = -1 OR t.hour_five = -1 OR t.hour_five = -1
OR t.hour_six = -1 OR t.hour_seven = -1 OR t.hour_eight = -1 OR t.hour_nine = -1 OR t.hour_ten = -1 OR t.hour_eleven = -1 OR t.hour_twelve = -1 
OR t.hour_thirteen = -1 OR t.hour_fourteen = -1 OR t.hour_fifteen = -1 OR t.hour_sixteen = -1 OR t.hour_seventeen = -1 OR t.hour_eighteen = -1
OR t.hour_nineteen = -1 OR t.hour_twenty = -1 OR t.hour_twentyone = -1 OR t.hour_twentytwo = -1 OR t.hour_twentythree = -1 OR t.id IS NULL`
    let sql = `WITH recursive all_dates(date) AS (
        SELECT '${fromDate}' date
        UNION ALL 
        SELECT date + interval 1 day FROM all_dates WHERE date + interval 1 day <= '${toDate}'
)
SELECT DISTINCT d.date date, COALESCE(t.id, 'Липсва') AS id, COALESCE(c.ident_code,'${ident_code}') AS ident_code, COALESCE(c.client_name,'${client_name}') AS client_name, COALESCE(c.id,'${id}') AS cId, COALESCE(c.erp_type, '${erp_type}') AS erp_type
FROM all_dates d 
LEFT JOIN ${table} t on t.date = d.date AND t.client_id = '${id}'
LEFT JOIN ${clientsTable} c ON c.id = t.client_id 
WHERE t.hour_zero = -1 OR t.hour_one = -1 OR t.hour_two = -1 OR t.hour_three = -1 OR  t.hour_four = -1 OR t.hour_five = -1 OR t.hour_five = -1
OR t.hour_six = -1 OR t.hour_seven = -1 OR t.hour_eight = -1 OR t.hour_nine = -1 OR t.hour_ten = -1 OR t.hour_eleven = -1 OR t.hour_twelve = -1 
OR t.hour_thirteen = -1 OR t.hour_fourteen = -1 OR t.hour_fifteen = -1 OR t.hour_sixteen = -1 OR t.hour_seventeen = -1 OR t.hour_eighteen = -1
OR t.hour_nineteen = -1 OR t.hour_twenty = -1 OR t.hour_twentyone = -1 OR t.hour_twentytwo = -1 OR t.hour_twentythree = -1 OR t.id IS NULL`
    if (search.value) {
        sql += `  AND (d.date LIKE '%${search.value}%' )`;
        countSQL += `  AND (d.date LIKE '%${search.value}%'  ) `;
    }
    sql += ` ORDER BY ${columnType} ${orderType}
LIMIT ${start},${length}`;
    db.query(countSQL, (err, countTotal) => {
        if (err) {
            throw err;
        }
        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            const count = countTotal[0].count;
            const recordsFiltered = count,
                recordsTotal = count;
            let arr = {
                recordsTotal,
                recordsFiltered,
                data: result
            }
            return res.send(JSON.stringify(arr));
        })
    });
});

router.post('/api/filter/inquiry-missing-information/graphs', async (req, res) => {
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
    const columnType = getColumnsTypeFullTable(columnNum)
    const orderType = order[0].dir;
    const {
        id,
        client_name,
        erp_type
    } = await searchClientByIdentCode(ident_code);
    const clientsTable = `clients`;
    const table = `hour_prediction`;
    let countSQL = `WITH recursive all_dates(date) AS (
        SELECT '${fromDate}' date
        UNION ALL 
        SELECT date + interval 1 day FROM all_dates WHERE date + interval 1 day <= '${toDate}'
)
SELECT COUNT(d.date) count
FROM all_dates d
LEFT JOIN ${table} t on t.date = d.date AND t.client_id = '${id}'
LEFT JOIN ${clientsTable} c ON c.id = t.client_id 
WHERE t.hour_zero = -1 OR t.hour_one = -1 OR t.hour_two = -1 OR t.hour_three = -1 OR  t.hour_four = -1 OR t.hour_five = -1 OR t.hour_five = -1
OR t.hour_six = -1 OR t.hour_seven = -1 OR t.hour_eight = -1 OR t.hour_nine = -1 OR t.hour_ten = -1 OR t.hour_eleven = -1 OR t.hour_twelve = -1 
OR t.hour_thirteen = -1 OR t.hour_fourteen = -1 OR t.hour_fifteen = -1 OR t.hour_sixteen = -1 OR t.hour_seventeen = -1 OR t.hour_eighteen = -1
OR t.hour_nineteen = -1 OR t.hour_twenty = -1 OR t.hour_twentyone = -1 OR t.hour_twentytwo = -1 OR t.hour_twentythree = -1 OR t.id IS NULL`
    let sql = `WITH recursive all_dates(date) AS (
        SELECT '${fromDate}' date
        UNION ALL 
        SELECT date + interval 1 day FROM all_dates WHERE date + interval 1 day <= '${toDate}'
)
SELECT DISTINCT d.date date, COALESCE(t.id, 'Липсва') AS id, COALESCE(c.ident_code,'${ident_code}') AS ident_code, COALESCE(c.client_name,'${client_name}') AS client_name, COALESCE(c.id,'${id}') AS cId, COALESCE(c.erp_type, '${erp_type}') AS erp_type
FROM all_dates d 
LEFT JOIN ${table} t on t.date = d.date AND t.client_id = '${id}'
LEFT JOIN ${clientsTable} c ON c.id = t.client_id 
WHERE t.hour_zero = -1 OR t.hour_one = -1 OR t.hour_two = -1 OR t.hour_three = -1 OR  t.hour_four = -1 OR t.hour_five = -1 OR t.hour_five = -1
OR t.hour_six = -1 OR t.hour_seven = -1 OR t.hour_eight = -1 OR t.hour_nine = -1 OR t.hour_ten = -1 OR t.hour_eleven = -1 OR t.hour_twelve = -1 
OR t.hour_thirteen = -1 OR t.hour_fourteen = -1 OR t.hour_fifteen = -1 OR t.hour_sixteen = -1 OR t.hour_seventeen = -1 OR t.hour_eighteen = -1
OR t.hour_nineteen = -1 OR t.hour_twenty = -1 OR t.hour_twentyone = -1 OR t.hour_twentytwo = -1 OR t.hour_twentythree = -1 OR t.id IS NULL`
    if (search.value) {
        sql += `  AND (d.date LIKE '%${search.value}%' )`;
        countSQL += `  AND (d.date LIKE '%${search.value}%'  ) `;
    }
    sql += ` ORDER BY ${columnType} ${orderType}
LIMIT ${start},${length}`;
    db.query(countSQL, (err, countTotal) => {
        if (err) {
            throw err;
        }
        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            const count = countTotal[0].count;
            const recordsFiltered = count,
                recordsTotal = count;
            let arr = {
                recordsTotal,
                recordsFiltered,
                data: result
            }
            return res.send(JSON.stringify(arr));
        })
    });
});
router.post('/api/filter/inquiry-missing-information/stp-graphs', async (req, res) => {
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
    const columnType = getColumnsTypeFullTable(columnNum)
    const orderType = order[0].dir;
    const {
        id,
        client_name,
        erp_type
    } = await searchClientByIdentCode(ident_code);

    const clientsTable = `clients`;
    const hoursTable = `profile_coef`;
    const table = `prediction`;
    let countSQL = `WITH recursive all_dates(date) AS (
        SELECT '${fromDate}' date
        UNION ALL
        SELECT date + interval 1 month FROM all_dates WHERE date + interval 1 month <= '${toDate}'
)
SELECT DISTINCT d.date date, COALESCE(p.id, 'Липсва') AS id, COALESCE(c.ident_code,'${ident_code}') AS ident_code, COALESCE(c.client_name,'${client_name}') AS client_name, COALESCE(c.id,'${id}') AS cId, COALESCE(c.erp_type, '${erp_type}') AS erp_type
FROM all_dates d
LEFT JOIN ${table} p on p.date = d.date AND p.client_id = '${id}'
LEFT JOIN ${hoursTable} t on t.date = d.date 
LEFT JOIN ${clientsTable} c ON c.id = p.client_id
WHERE t.hour_zero = -1 OR t.hour_one = -1 OR t.hour_two = -1 OR t.hour_three = -1 OR  t.hour_four = -1 OR t.hour_five = -1 OR t.hour_five = -1
OR t.hour_six = -1 OR t.hour_seven = -1 OR t.hour_eight = -1 OR t.hour_nine = -1 OR t.hour_ten = -1 OR t.hour_eleven = -1 OR t.hour_twelve = -1 
OR t.hour_thirteen = -1 OR t.hour_fourteen = -1 OR t.hour_fifteen = -1 OR t.hour_sixteen = -1 OR t.hour_seventeen = -1 OR t.hour_eighteen = -1
OR t.hour_nineteen = -1 OR t.hour_twenty = -1 OR t.hour_twentyone = -1 OR t.hour_twentytwo = -1 OR t.hour_twentythree = -1 OR p.id IS NULL`
    let sql = `WITH recursive all_dates(date) AS (
        SELECT '${fromDate}' date
        UNION ALL
        SELECT date + interval 1 month FROM all_dates WHERE date + interval 1 month <= '${toDate}'
)
SELECT DISTINCT d.date date, COALESCE(p.id, 'Липсва') AS id, COALESCE(c.ident_code,'${ident_code}') AS ident_code, COALESCE(c.client_name,'${client_name}') AS client_name, COALESCE(c.id,'${id}') AS cId, COALESCE(c.erp_type, '${erp_type}') AS erp_type
FROM all_dates d
LEFT JOIN ${table} p on p.date = d.date AND p.client_id = '${id}'
LEFT JOIN ${hoursTable} t on t.date = d.date 
LEFT JOIN clients c ON c.id = p.client_id
WHERE t.hour_zero = -1 OR t.hour_one = -1 OR t.hour_two = -1 OR t.hour_three = -1 OR  t.hour_four = -1 OR t.hour_five = -1 OR t.hour_five = -1
OR t.hour_six = -1 OR t.hour_seven = -1 OR t.hour_eight = -1 OR t.hour_nine = -1 OR t.hour_ten = -1 OR t.hour_eleven = -1 OR t.hour_twelve = -1 
OR t.hour_thirteen = -1 OR t.hour_fourteen = -1 OR t.hour_fifteen = -1 OR t.hour_sixteen = -1 OR t.hour_seventeen = -1 OR t.hour_eighteen = -1
OR t.hour_nineteen = -1 OR t.hour_twenty = -1 OR t.hour_twentyone = -1 OR t.hour_twentytwo = -1 OR t.hour_twentythree = -1 OR p.id IS NULL`
    if (search.value) {
        sql += `  AND (d.date LIKE '%${search.value}%' )`;
        countSQL += `  AND (d.date LIKE '%${search.value}%'  ) `;
    }
    sql += ` ORDER BY ${columnType} ${orderType}
LIMIT ${start},${length}`;

    db.query(countSQL, (err, countTotal) => {
        if (err) {
            throw err;
        }
        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            const count = countTotal.length;
            const recordsFiltered = count,
                recordsTotal = count;
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
    let sql = ` WITH recursive all_dates(date) AS (
	SELECT '${fromDate}' date
        UNION ALL 
	SELECT date + interval 1 day FROM all_dates where date + interval 1 day <= '${toDate}'
)
SELECT DISTINCT d.date date, COALESCE(id, '-') AS id, COALESCE(t.type, '-') AS type
FROM all_dates d
LEFT JOIN ${table} t on t.date = d.date
WHERE t.hour_zero = -1 OR t.hour_one = -1 OR t.hour_two = -1 OR t.hour_three = -1 OR  t.hour_four = -1 OR t.hour_five = -1 OR t.hour_five = -1
OR t.hour_six = -1 OR t.hour_seven = -1 OR t.hour_eight = -1 OR t.hour_nine = -1 OR t.hour_ten = -1 OR t.hour_eleven = -1 OR t.hour_twelve = -1 
OR t.hour_thirteen = -1 OR t.hour_fourteen = -1 OR t.hour_fifteen = -1 OR t.hour_sixteen = -1 OR t.hour_seventeen = -1 OR t.hour_eighteen = -1
OR t.hour_nineteen = -1 OR t.hour_twenty = -1 OR t.hour_twentyone = -1 OR t.hour_twentytwo = -1 OR t.hour_twentythree = -1 OR id IS NULL`
    let countSQL = ` WITH recursive all_dates(date) AS (
	SELECT '${fromDate}' date
        UNION ALL 
	SELECT date + interval 1 day FROM all_dates where date + interval 1 day <= '${toDate}'
)
SELECT COUNT(d.date) count
FROM all_dates d
LEFT JOIN  hour_readings_eso t on t.date = d.date
WHERE t.hour_zero = -1 OR t.hour_one = -1 OR t.hour_two = -1 OR t.hour_three = -1 OR  t.hour_four = -1 OR t.hour_five = -1 OR t.hour_five = -1
OR t.hour_six = -1 OR t.hour_seven = -1 OR t.hour_eight = -1 OR t.hour_nine = -1 OR t.hour_ten = -1 OR t.hour_eleven = -1 OR t.hour_twelve = -1 
OR t.hour_thirteen = -1 OR t.hour_fourteen = -1 OR t.hour_fifteen = -1 OR t.hour_sixteen = -1 OR t.hour_seventeen = -1 OR t.hour_eighteen = -1
OR t.hour_nineteen = -1 OR t.hour_twenty = -1 OR t.hour_twentyone = -1 OR t.hour_twentytwo = -1 OR t.hour_twentythree = -1 OR id IS NULL`
    if (search.value) {
        sql += `  AND (d.date LIKE '%${search.value}%' )`;
        countSQL += `  AND (d.date LIKE '%${search.value}%'  ) `;
    }
    sql += ` ORDER BY ${columnType} ${orderType}
LIMIT ${start},${length}`;

    db.query(countSQL, (err, countTotal) => {
        if (err) {
            throw err;
        }
        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            const count = countTotal[0].count;
            const recordsFiltered = count,
                recordsTotal = count;
            let arr = {
                recordsTotal,
                recordsFiltered,
                data: result
            }

            return res.send(JSON.stringify(arr));
        })
    });
});

router.post('/api/filter/inquiry-missing-information/hour-readings', async (req, res) => {
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
    const columnType = getColumnsTypeFullTable(columnNum)
    const orderType = order[0].dir;
    const {
        id,
        client_name,
        erp_type
    } = await searchClientByIdentCode(ident_code);
    const clientsTable = `clients`;
    const table = `hour_readings`;
    let countSQL = `WITH recursive all_dates(date) AS (
        SELECT '${fromDate}' date
        UNION ALL 
        SELECT date + interval 1 day FROM all_dates WHERE date + interval 1 day <= '${toDate}'
)
SELECT COUNT(d.date) count
FROM all_dates d
LEFT JOIN ${table} t on t.date = d.date AND t.client_id = '${id}'
LEFT JOIN ${clientsTable} c ON c.id = t.client_id 
WHERE t.hour_zero = -1 OR t.hour_one = -1 OR t.hour_two = -1 OR t.hour_three = -1 OR  t.hour_four = -1 OR t.hour_five = -1 OR t.hour_five = -1
OR t.hour_six = -1 OR t.hour_seven = -1 OR t.hour_eight = -1 OR t.hour_nine = -1 OR t.hour_ten = -1 OR t.hour_eleven = -1 OR t.hour_twelve = -1 
OR t.hour_thirteen = -1 OR t.hour_fourteen = -1 OR t.hour_fifteen = -1 OR t.hour_sixteen = -1 OR t.hour_seventeen = -1 OR t.hour_eighteen = -1
OR t.hour_nineteen = -1 OR t.hour_twenty = -1 OR t.hour_twentyone = -1 OR t.hour_twentytwo = -1 OR t.hour_twentythree = -1 OR t.id IS NULL`
    let sql = `WITH recursive all_dates(date) AS (
        SELECT '${fromDate}' date
        UNION ALL 
        SELECT date + interval 1 day FROM all_dates WHERE date + interval 1 day <= '${toDate}'
)
SELECT DISTINCT d.date date, COALESCE(t.id, 'Липсва') AS id, COALESCE(c.ident_code,'${ident_code}') AS ident_code, COALESCE(c.client_name,'${client_name}') AS client_name, COALESCE(c.id,'${id}') AS cId, COALESCE(c.erp_type, '${erp_type}') AS erp_type
FROM all_dates d 
LEFT JOIN ${table} t on t.date = d.date AND t.client_id = '${id}'
LEFT JOIN ${clientsTable} c ON c.id = t.client_id 
WHERE t.hour_zero = -1 OR t.hour_one = -1 OR t.hour_two = -1 OR t.hour_three = -1 OR  t.hour_four = -1 OR t.hour_five = -1 OR t.hour_five = -1
OR t.hour_six = -1 OR t.hour_seven = -1 OR t.hour_eight = -1 OR t.hour_nine = -1 OR t.hour_ten = -1 OR t.hour_eleven = -1 OR t.hour_twelve = -1 
OR t.hour_thirteen = -1 OR t.hour_fourteen = -1 OR t.hour_fifteen = -1 OR t.hour_sixteen = -1 OR t.hour_seventeen = -1 OR t.hour_eighteen = -1
OR t.hour_nineteen = -1 OR t.hour_twenty = -1 OR t.hour_twentyone = -1 OR t.hour_twentytwo = -1 OR t.hour_twentythree = -1 OR t.id IS NULL`
    if (search.value) {
        sql += `  AND (d.date LIKE '%${search.value}%' )`;
        countSQL += `  AND (d.date LIKE '%${search.value}%'  ) `;
    }
    sql += ` ORDER BY ${columnType} ${orderType}
LIMIT ${start},${length}`;
    db.query(countSQL, (err, countTotal) => {
        if (err) {
            throw err;
        }
        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            const count = countTotal[0].count;
            const recordsFiltered = count,
                recordsTotal = count;
            let arr = {
                recordsTotal,
                recordsFiltered,
                data: result
            }

            return res.send(JSON.stringify(arr));
        })
    });
});

function getColumnsTypeFullTable(columnNum) {
    let result = 't.id';
    switch (columnNum) {
        case '0':
            result = 't.id'
            break;
        case '1':
            result = 'c.client_name'
            break;
        case '2':
            result = 'c.ident_code'
            break;
        case '3':
            result = 'd.date'
            break;
        case '4':
            result = 'c.erp_type'
            break;
    }
    return result
}

function getColumnsTypeESO(columnNum) {
    let result = 't.id';

    switch (columnNum) {
        case '0':
            result = 't.id'
            break;
        case '1':
            result = 'd.date'
            break;
        case '2':
            result = 't.type'
            break;
    }
    return result
}

function searchClientByIdentCode(identCode) {
    const sql = `SELECT id, client_name, erp_type
FROM clients
WHERE ident_code = '${identCode}'`
    const result = dbSync.query(sql);
    if (result.length) {
        return result[0];
    } else {
        throw 'search client by ident code failed';
    }
}

module.exports = router;