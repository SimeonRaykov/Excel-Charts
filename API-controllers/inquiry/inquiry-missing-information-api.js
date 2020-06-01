const express = require('express');
const router = express.Router();
const {
    db,
    dbSync
} = require('../../db.js');

const METERING_TYPES = {
    STP: '2',
    HOURLY: '1'
}

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
        order,
        profile_name
    } = req.body;

    const READING_TYPE = METERING_TYPES.STP;
    const columnNum = order[0].column;
    const columnType = getColumnsTypeFullTable(columnNum)
    const orderType = order[0].dir;
    let clientsInfo, sql, countSql;

    sql = `WITH recursive all_dates(date) AS (
        SELECT '${fromDate}' date
        UNION ALL
        SELECT date + interval 1 day FROM all_dates WHERE date + interval 1 day <= '${toDate}'
)`;
    if (ident_code != -1 || name != -1 || profile_name != '' || erp.length != 3) {
        clientsInfo = await filterClients(READING_TYPE, ident_code, name, erp, profile_name);
    } else {
        clientsInfo = await getAllClients(READING_TYPE);
    }
    if (!clientsInfo) {
        return res.send(JSON.stringify([]));
    }
    for (let i = 0; i < clientsInfo.length; i += 1) {
        sql += `SELECT DISTINCT d.date date, COALESCE(t.id, 'Липсва') AS id, COALESCE(c.ident_code,'${clientsInfo[i].ident_code}') AS ident_code, COALESCE(c.client_name,'${clientsInfo[i].client_name}') AS client_name, COALESCE(c.id,'${clientsInfo[i].id}') AS cId, COALESCE(c.erp_type, '${clientsInfo[i].erp_type}') AS erp_type
        FROM all_dates d
        LEFT JOIN stp_hour_readings t on t.date = d.date AND t.client_id = '${clientsInfo[i].id}'
        LEFT JOIN clients c ON c.id = t.client_id
        WHERE t.hour_zero = -1 OR t.hour_one = -1 OR t.hour_two = -1 OR t.hour_three = -1 OR  t.hour_four = -1 OR t.hour_five = -1 OR t.hour_five = -1
        OR t.hour_six = -1 OR t.hour_seven = -1 OR t.hour_eight = -1 OR t.hour_nine = -1 OR t.hour_ten = -1 OR t.hour_eleven = -1 OR t.hour_twelve = -1
        OR t.hour_thirteen = -1 OR t.hour_fourteen = -1 OR t.hour_fifteen = -1 OR t.hour_sixteen = -1 OR t.hour_seventeen = -1 OR t.hour_eighteen = -1
        OR t.hour_nineteen = -1 OR t.hour_twenty = -1 OR t.hour_twentyone = -1 OR t.hour_twentytwo = -1 OR t.hour_twentythree = -1 OR t.id IS NULL`;
        if (search.value) {
            sql += `  AND (d.date LIKE '%${search.value}%')`;
        }
        if (i != clientsInfo.length - 1) {
            sql += ` UNION `;
        }
    }
    countSql = sql;
    sql += ` ORDER BY ${columnType} ${orderType}
    LIMIT ${start},${length}`;
    db.query(countSql, (err, countRes) => {
        if (err) {
            throw err;
        }
        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            const count = countRes.length;
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

    const READING_TYPE = METERING_TYPES.HOURLY;
    const columnNum = order[0].column;
    const columnType = getColumnsTypeFullTable(columnNum)
    const orderType = order[0].dir;
    let clientsInfo, sql, countSql;

    sql = `WITH recursive all_dates(date) AS (
        SELECT '${fromDate}' date
        UNION ALL
        SELECT date + interval 1 day FROM all_dates WHERE date + interval 1 day <= '${toDate}'
)`;
    if (ident_code != -1 || name != -1 || erp.length != 3) {
        clientsInfo = await filterClients(READING_TYPE, ident_code, name, erp);
    } else {
        clientsInfo = await getAllClients(READING_TYPE);
    }
    if (!clientsInfo) {
        return res.send(JSON.stringify([]));
    }
    for (let i = 0; i < clientsInfo.length; i += 1) {
        sql += `SELECT DISTINCT d.date date, COALESCE(t.id, 'Липсва') AS id, COALESCE(c.ident_code,'${clientsInfo[i].ident_code}') AS ident_code, COALESCE(c.client_name,'${clientsInfo[i].client_name}') AS client_name, COALESCE(c.id,'${clientsInfo[i].id}') AS cId, COALESCE(c.erp_type, '${clientsInfo[i].erp_type}') AS erp_type
        FROM all_dates d
        LEFT JOIN hour_prediction t on t.date = d.date AND t.client_id = '${clientsInfo[i].id}'
        LEFT JOIN clients c ON c.id = t.client_id
        WHERE t.hour_zero = -1 OR t.hour_one = -1 OR t.hour_two = -1 OR t.hour_three = -1 OR  t.hour_four = -1 OR t.hour_five = -1 OR t.hour_five = -1
        OR t.hour_six = -1 OR t.hour_seven = -1 OR t.hour_eight = -1 OR t.hour_nine = -1 OR t.hour_ten = -1 OR t.hour_eleven = -1 OR t.hour_twelve = -1
        OR t.hour_thirteen = -1 OR t.hour_fourteen = -1 OR t.hour_fifteen = -1 OR t.hour_sixteen = -1 OR t.hour_seventeen = -1 OR t.hour_eighteen = -1
        OR t.hour_nineteen = -1 OR t.hour_twenty = -1 OR t.hour_twentyone = -1 OR t.hour_twentytwo = -1 OR t.hour_twentythree = -1 OR t.id IS NULL`;
        if (search.value) {
            sql += `  AND (d.date LIKE '%${search.value}%')`;
        }
        if (i != clientsInfo.length - 1) {
            sql += ` UNION `;
        }
    }
    countSql = sql;
    sql += ` ORDER BY ${columnType} ${orderType}
    LIMIT ${start},${length}`;
    db.query(countSql, (err, countRes) => {
        if (err) {
            throw err;
        }
        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            const count = countRes.length;
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
        order,
        profile_name
    } = req.body;
    fromDate = new Date(fromDate);
    toDate = new Date(toDate);
    const formattedFromDate = `${fromDate.getFullYear()}-${fromDate.getMonth()<10?`0${fromDate.getMonth()}`:fromDate.getMonth()}-01`;
    const formattedToDate = `${toDate.getFullYear()}-${toDate.getMonth()<10?`0${toDate.getMonth()}`:toDate.getMonth()}-01`;
    const READING_TYPE = METERING_TYPES.STP;
    const columnNum = order[0].column;
    const columnType = getColumnsTypeFullTable(columnNum)
    const orderType = order[0].dir;
    let clientsInfo, sql, countSql;

    sql = `WITH recursive all_dates(date) AS (
        SELECT '${formattedFromDate}' date
        UNION ALL
        SELECT date + interval 1 month FROM all_dates WHERE date + interval 1 month <= '${formattedToDate}'
)`;
    if (ident_code != -1 || name != -1 || profile_name != '' || erp.length != 3) {
        clientsInfo = await filterClients(READING_TYPE, ident_code, name, erp, profile_name);
    } else {
        clientsInfo = await getAllClients(READING_TYPE);
    }
    if (!clientsInfo) {
        return res.send(JSON.stringify([]));
    }
    for (let i = 0; i < clientsInfo.length; i += 1) {
        sql += `SELECT DISTINCT d.date date, COALESCE(t.id, 'Липсва') AS id, COALESCE(c.ident_code,'${clientsInfo[i].ident_code}') AS ident_code, COALESCE(c.client_name,'${clientsInfo[i].client_name}') AS client_name, COALESCE(c.id,'${clientsInfo[i].id}') AS cId, COALESCE(c.erp_type, '${clientsInfo[i].erp_type}') AS erp_type
        FROM all_dates d
        LEFT JOIN prediction p on p.date = d.date AND p.client_id = '${clientsInfo[i].id}'
        LEFT JOIN profile_coef t on t.date = d.date
        LEFT JOIN clients c ON c.id = p.client_id
        WHERE t.hour_zero = -1 OR t.hour_one = -1 OR t.hour_two = -1 OR t.hour_three = -1 OR  t.hour_four = -1 OR t.hour_five = -1 OR t.hour_five = -1
        OR t.hour_six = -1 OR t.hour_seven = -1 OR t.hour_eight = -1 OR t.hour_nine = -1 OR t.hour_ten = -1 OR t.hour_eleven = -1 OR t.hour_twelve = -1
        OR t.hour_thirteen = -1 OR t.hour_fourteen = -1 OR t.hour_fifteen = -1 OR t.hour_sixteen = -1 OR t.hour_seventeen = -1 OR t.hour_eighteen = -1
        OR t.hour_nineteen = -1 OR t.hour_twenty = -1 OR t.hour_twentyone = -1 OR t.hour_twentytwo = -1 OR t.hour_twentythree = -1 OR t.id IS NULL`;
        if (search.value) {
            sql += `  AND (d.date LIKE '%${search.value}%')`;
        }
        if (i != clientsInfo.length - 1) {
            sql += ` UNION `;
        }
    }
    countSql = sql;
    sql += ` ORDER BY ${columnType} ${orderType}
    LIMIT ${start},${length}`;
    db.query(countSql, (err, countRes) => {
        if (err) {
            throw err;
        }
        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            const count = countRes.length;
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

router.post('/api/filter/inquiry-missing-information/eso-graphs', async (req, res) => {
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
    const columnType = getColumnsTypeESO(columnNum)
    const orderType = order[0].dir;
    const hoursTable = 'hour_prediction_eso';
    const clientsTable = 'clients';
    let clientsInfo, sql, countSql;

    sql = `WITH recursive all_dates(date) AS (
        SELECT '${fromDate}' date
        UNION ALL
        SELECT date + interval 1 day FROM all_dates WHERE date + interval 1 day <= '${toDate}'
)`;
    if (ident_code != -1 || name != -1 || erp.length != 3) {
        clientsInfo = await filterClients('', ident_code, name, erp);
    } else {
        clientsInfo = await getClientsESO('graphs');
    }
    if (!clientsInfo) {
        return res.send(JSON.stringify([]));
    }
    for (let i = 0; i < clientsInfo.length; i += 1) {
        sql += `SELECT DISTINCT d.date date, COALESCE(t.id, 'Липсва') AS id, COALESCE(c.ident_code,'${clientsInfo[i].ident_code}') AS ident_code, COALESCE(c.client_name,'${clientsInfo[i].client_name}') AS client_name, COALESCE(c.id,'${clientsInfo[i].id}') AS cId, COALESCE(c.erp_type, '${clientsInfo[i].erp_type}') AS erp_type
        FROM all_dates d
        LEFT JOIN ${hoursTable} t on t.date = d.date AND t.client_id = '${clientsInfo[i].id}'
        LEFT JOIN ${clientsTable} c ON c.id = t.client_id
        WHERE t.hour_zero = -1 OR t.hour_one = -1 OR t.hour_two = -1 OR t.hour_three = -1 OR  t.hour_four = -1 OR t.hour_five = -1 OR t.hour_five = -1
        OR t.hour_six = -1 OR t.hour_seven = -1 OR t.hour_eight = -1 OR t.hour_nine = -1 OR t.hour_ten = -1 OR t.hour_eleven = -1 OR t.hour_twelve = -1
        OR t.hour_thirteen = -1 OR t.hour_fourteen = -1 OR t.hour_fifteen = -1 OR t.hour_sixteen = -1 OR t.hour_seventeen = -1 OR t.hour_eighteen = -1
        OR t.hour_nineteen = -1 OR t.hour_twenty = -1 OR t.hour_twentyone = -1 OR t.hour_twentytwo = -1 OR t.hour_twentythree = -1 OR t.id IS NULL`;
        if (search.value) {
            sql += `  AND (d.date LIKE '%${search.value}%')`;
        }
        if (i != clientsInfo.length - 1) {
            sql += ` UNION `;
        }
    }
    countSql = sql;
    sql += ` ORDER BY ${columnType} ${orderType}
    LIMIT ${start},${length}`;
    db.query(countSql, (err, countRes) => {
        if (err) {
            throw err;
        }
        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            const count = countRes.length;
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

router.post('/api/filter/inquiry-missing-information/eso-readings', async (req, res) => {
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
    const columnType = getColumnsTypeESO(columnNum)
    const orderType = order[0].dir;
    let clientsInfo, sql, countSql;
    const hoursTable = 'hour_readings_eso';
    const clientsTable = 'clients';

    sql = `WITH recursive all_dates(date) AS (
        SELECT '${fromDate}' date
        UNION ALL
        SELECT date + interval 1 day FROM all_dates WHERE date + interval 1 day <= '${toDate}'
)`;
    if (ident_code != -1 || name != -1 || erp.length != 3) {
        clientsInfo = await filterClients(-1, ident_code, name, erp);
    } else {
        clientsInfo = await getClientsESO('readings');
    }
    if (!clientsInfo) {
        return res.send(JSON.stringify([]));
    }
    for (let i = 0; i < clientsInfo.length; i += 1) {
        sql += `SELECT DISTINCT d.date date, COALESCE(t.id, 'Липсва') AS id, COALESCE(c.ident_code,'${clientsInfo[i].ident_code}') AS ident_code, COALESCE(c.client_name,'${clientsInfo[i].client_name}') AS client_name, COALESCE(c.id,'${clientsInfo[i].id}') AS cId, COALESCE(c.erp_type, '${clientsInfo[i].erp_type}') AS erp_type
        FROM all_dates d
        LEFT JOIN ${hoursTable} t on t.date = d.date AND t.client_id = '${clientsInfo[i].id}'
        LEFT JOIN ${clientsTable} c ON c.id = t.client_id
        WHERE t.hour_zero = -1 OR t.hour_one = -1 OR t.hour_two = -1 OR t.hour_three = -1 OR  t.hour_four = -1 OR t.hour_five = -1 OR t.hour_five = -1
        OR t.hour_six = -1 OR t.hour_seven = -1 OR t.hour_eight = -1 OR t.hour_nine = -1 OR t.hour_ten = -1 OR t.hour_eleven = -1 OR t.hour_twelve = -1
        OR t.hour_thirteen = -1 OR t.hour_fourteen = -1 OR t.hour_fifteen = -1 OR t.hour_sixteen = -1 OR t.hour_seventeen = -1 OR t.hour_eighteen = -1
        OR t.hour_nineteen = -1 OR t.hour_twenty = -1 OR t.hour_twentyone = -1 OR t.hour_twentytwo = -1 OR t.hour_twentythree = -1 OR t.id IS NULL`;
        if (search.value) {
            sql += `  AND (d.date LIKE '%${search.value}%')`;
        }
        if (i != clientsInfo.length - 1) {
            sql += ` UNION `;
        }
    }
    countSql = sql;

    sql += ` ORDER BY ${columnType} ${orderType}
    LIMIT ${start},${length}`;
    db.query(countSql, (err, countRes) => {
        if (err) {
            throw err;
        }
        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            const count = countRes.length;
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

    const READING_TYPE = METERING_TYPES.HOURLY;
    const columnNum = order[0].column;
    const columnType = getColumnsTypeFullTable(columnNum)
    const orderType = order[0].dir;
    let clientsInfo, sql, countSql;

    sql = `WITH recursive all_dates(date) AS (
        SELECT '${fromDate}' date
        UNION ALL
        SELECT date + interval 1 day FROM all_dates WHERE date + interval 1 day <= '${toDate}'
)`;
    if (ident_code != -1 || name != -1 || erp.length != 3) {
        clientsInfo = await filterClients(READING_TYPE, ident_code, name, erp);
    } else {
        clientsInfo = await getAllClients(READING_TYPE);
    }
    if (!clientsInfo) {
        return res.send(JSON.stringify([]));
    }
    for (let i = 0; i < clientsInfo.length; i += 1) {
        sql += `SELECT DISTINCT d.date date, COALESCE(t.id, 'Липсва') AS id, COALESCE(c.ident_code,'${clientsInfo[i].ident_code}') AS ident_code, COALESCE(c.client_name,'${clientsInfo[i].client_name}') AS client_name, COALESCE(c.id,'${clientsInfo[i].id}') AS cId, COALESCE(c.erp_type, '${clientsInfo[i].erp_type}') AS erp_type
        FROM all_dates d
        LEFT JOIN hour_readings t on t.date = d.date AND t.client_id = '${clientsInfo[i].id}'
        LEFT JOIN clients c ON c.id = t.client_id
        WHERE t.hour_zero = -1 OR t.hour_one = -1 OR t.hour_two = -1 OR t.hour_three = -1 OR  t.hour_four = -1 OR t.hour_five = -1 OR t.hour_five = -1
        OR t.hour_six = -1 OR t.hour_seven = -1 OR t.hour_eight = -1 OR t.hour_nine = -1 OR t.hour_ten = -1 OR t.hour_eleven = -1 OR t.hour_twelve = -1
        OR t.hour_thirteen = -1 OR t.hour_fourteen = -1 OR t.hour_fifteen = -1 OR t.hour_sixteen = -1 OR t.hour_seventeen = -1 OR t.hour_eighteen = -1
        OR t.hour_nineteen = -1 OR t.hour_twenty = -1 OR t.hour_twentyone = -1 OR t.hour_twentytwo = -1 OR t.hour_twentythree = -1 OR t.id IS NULL`;
        if (search.value) {
            sql += `  AND (d.date LIKE '%${search.value}%')`;
        }
        if (i != clientsInfo.length - 1) {
            sql += ` UNION `;
        }
    }
    countSql = sql;
    sql += ` ORDER BY ${columnType} ${orderType}
    LIMIT ${start},${length}`;
    db.query(countSql, (err, countRes) => {
        if (err) {
            throw err;
        }
        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            const count = countRes.length;
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
    let result = 'id';
    switch (columnNum) {
        case '0':
            result = 'id'
            break;
        case '1':
            result = 'client_name'
            break;
        case '2':
            result = 'ident_code'
            break;
        case '3':
            result = 'date'
            break;
        case '4':
            result = 'erp_type'
            break;
    }
    return result
}

function getColumnsTypeESO(columnNum) {
    let result = 'id';

    switch (columnNum) {
        case '0':
            result = 'id'
            break;
        case '1':
            result = 'client_name'
            break;
        case '2':
            result = 'ident_code'
            break;
        case '3':
            result = 'date'
            break;
    }
    return result
}

async function filterClients(type, ident_code, name, erp, profile_name) {
    let sql = `SELECT id, client_name, erp_type, ident_code
    FROM clients
    WHERE 1=1`
    if (type && type != -1) {
        sql += ` AND metering_type = '${type}'`;
    }

    if (ident_code && ident_code != -1) {
        sql += ` AND ident_code = '${ident_code}'`;
    }
    if (name && name != -1) {
        sql += ` AND client_name LIKE '%${name}%'`;
    }
    if (erp && erp.length !== 3 && erp.length != 0) {
        if (erp.length == 1) {
            sql += ` AND clients.erp_type = '${erp}'`;
        } else if (erp.length == 2) {
            sql += ` AND ( clients.erp_type = '${erp[0]}'`;
            sql += ` OR clients.erp_type = '${erp[1]}' )`;
        }
    } else if (erp == undefined) {
        return null;
    }
    if (profile_name && profileName != undefined && profileName != -1) {
        const profileID = await findProfileByName(profile_name).id;
        sql += ` AND profile_id = '${profileID}'`
    }
    const result = dbSync.query(sql);
    if (result.length) {
        return result;
    }
}

function findProfileByName(profileName) {
    let sql = `SELECT id 
    FROM stp_profiles
    WHERE profile_name = '${profileName}'`;
    const result = dbSync.query(sql);
    return result[0];
}

function getAllClients(type) {
    let sql = `SELECT id, client_name, erp_type, ident_code
    FROM clients `;
    if (type) {
        sql += ` WHERE clients.metering_type = '${type}'`;
    }

    const result = dbSync.query(sql);
    if (result.length) {
        return result;
    } else {
        throw 'search client by ident code failed';
    }
}

function getClientsESO(esoType) {
    let esoTable;
    if (esoType == 'graphs') {
        esoTable = 'hour_prediction_eso';
    } else if (esoType == 'readings') {
        esoTable = 'hour_readings_eso';
    }
    const sql = `SELECT clients.id, client_name, erp_type, ident_code
    FROM clients
    INNER JOIN ${esoTable} ON ${esoTable}.client_id = clients.id`;

    const result = dbSync.query(sql);
    if (result.length) {
        return result;
    } else {
        throw 'search client eso failed';
    }
}

module.exports = router;