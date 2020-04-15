const express = require('express');
const router = express.Router();
const {
    db,
    dbSync
} = require('../../db.js');

router.post('/api/filter/inquiry-missing-information/hour-readings', (req, res) => {
    let {
        fromDate,
        toDate,
        name,
        ident_code,
        erp,
        profile_name,
        metering_type
    } = req.body;

    let profileID = -1;
    if (profile_name) {
        let profileNameSQL = ` SELECT id
         FROM stp_profiles
     WHERE profile_name = '${profile_name}'
     LIMIT 1 `;
        let profileRes = dbSync.query(profileNameSQL);
        profileID = profileRes[0].id;
    }
    let sql = `SELECT clients.ident_code,${metering_type}.date, ${metering_type}.hour_zero AS 'hr0',${metering_type}.hour_one AS 'hr1',  ${metering_type}.hour_two AS 'hr2', ${metering_type}.hour_three AS 'hr3', ${metering_type}.hour_four AS 'hr4', ${metering_type}.hour_five AS 'hr5', ${metering_type}.hour_six AS 'hr6', ${metering_type}.hour_seven AS 'hr7', ${metering_type}.hour_eight AS 'hr8', ${metering_type}.hour_nine AS 'hr9', ${metering_type}.hour_ten AS 'hr10', ${metering_type}.hour_eleven AS 'hr11', ${metering_type}.hour_twelve AS 'hr12', ${metering_type}.hour_thirteen AS 'hr13', ${metering_type}.hour_fourteen AS 'hr14', ${metering_type}.hour_fifteen AS 'hr15', ${metering_type}.hour_sixteen AS 'hr16', ${metering_type}.hour_seventeen AS 'hr17', ${metering_type}.hour_eighteen AS 'hr18', ${metering_type}.hour_nineteen AS 'hr19', ${metering_type}.hour_twenty AS 'hr20', ${metering_type}.hour_twentyone AS 'hr21', ${metering_type}.hour_twentytwo AS 'hr22', ${metering_type}.hour_twentythree AS 'hr23' FROM clients
    INNER JOIN ${metering_type} on clients.id = ${metering_type}.client_id  
    WHERE 1=1 `;
    if (fromDate != -1 && toDate != -1) {
        sql += ` AND ${metering_type}.date>='${fromDate}' AND ${metering_type}.date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += ` AND ${metering_type}.date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += ` AND ${metering_type}.date<='${toDate}' `;
    }
    if (name != -1) {
        sql += ` AND clients.client_name = '${name}' `
    }
    if (ident_code != -1) {
        sql += ` AND clients.ident_code = '${ident_code}'`;
    }
    if (erp && erp.length !== 3 && erp.length != 0) {
        if (erp.length == 1) {
            sql += ` AND clients.erp_type = '${erp}'`;
        } else if (erp.length == 2) {
            sql += ` AND ( clients.erp_type = '${erp[0]}'`;
            sql += ` OR clients.erp_type = '${erp[1]}' )`;
        }
    } else if (erp == undefined) {
        return res.send(JSON.stringify([]));
    }

    if (profileID != -1 && metering_type == 'stp_hour_readings') {
        sql += ` AND profile_id = ${profileID}`
    }
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

router.post('/api/filter/inquiry-missing-information/graphs', (req, res) => {
    let {
        fromDate,
        toDate,
        name,
        ident_code,
        erp,
        profile_name,
        metering_type
    } = req.body;

    let profileID = -1;
    if (profile_name) {
        let profileNameSQL = ` SELECT id
         FROM stp_profiles
     WHERE profile_name = '${profile_name}'
     LIMIT 1 `;
        let profileRes = dbSync.query(profileNameSQL);
        profileID = profileRes[0].id;
    }
    let sql = `SELECT clients.ident_code,${metering_type}.date, ${metering_type}.hour_zero AS 'hr0',${metering_type}.hour_one AS 'hr1',  ${metering_type}.hour_two AS 'hr2', ${metering_type}.hour_three AS 'hr3', ${metering_type}.hour_four AS 'hr4', ${metering_type}.hour_five AS 'hr5', ${metering_type}.hour_six AS 'hr6', ${metering_type}.hour_seven AS 'hr7', ${metering_type}.hour_eight AS 'hr8', ${metering_type}.hour_nine AS 'hr9', ${metering_type}.hour_ten AS 'hr10', ${metering_type}.hour_eleven AS 'hr11', ${metering_type}.hour_twelve AS 'hr12', ${metering_type}.hour_thirteen AS 'hr13', ${metering_type}.hour_fourteen AS 'hr14', ${metering_type}.hour_fifteen AS 'hr15', ${metering_type}.hour_sixteen AS 'hr16', ${metering_type}.hour_seventeen AS 'hr17', ${metering_type}.hour_eighteen AS 'hr18', ${metering_type}.hour_nineteen AS 'hr19', ${metering_type}.hour_twenty AS 'hr20', ${metering_type}.hour_twentyone AS 'hr21', ${metering_type}.hour_twentytwo AS 'hr22', ${metering_type}.hour_twentythree AS 'hr23' FROM clients
    INNER JOIN ${metering_type} on clients.id = ${metering_type}.client_id  
    WHERE 1=1 `;
    if (fromDate != -1 && toDate != -1) {
        sql += ` AND ${metering_type}.date>='${fromDate}' AND ${metering_type}.date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += ` AND ${metering_type}.date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += ` AND ${metering_type}.date<='${toDate}' `;
    }
    if (name != -1) {
        sql += ` AND clients.client_name = '${name}' `
    }
    if (ident_code != -1) {
        sql += ` AND clients.ident_code = '${ident_code}'`;
    }
    if (erp && erp.length !== 3 && erp.length != 0) {
        if (erp.length == 1) {
            sql += ` AND clients.erp_type = '${erp}'`;
        } else if (erp.length == 2) {
            sql += ` AND ( clients.erp_type = '${erp[0]}'`;
            sql += ` OR clients.erp_type = '${erp[1]}' )`;
        }
    } else if (erp == undefined) {
        return res.send(JSON.stringify([]));
    }

    if (profileID != -1 && metering_type == 'stp_hour_readings') {
        sql += ` AND profile_id = ${profileID}`
    }
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
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