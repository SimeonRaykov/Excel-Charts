const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.get('/api/data-listings/profiles', (req, res) => {
    let sql = `SELECT profile_name, type
 FROM stp_profiles`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    })
});

router.post('/api/filter/profiles', (req, res) => {
    let {
        search,
        start,
        length,
        order,
        name,
        erp
    } = req.body;

    const columnNum = order[0].column;
    const columnType = getColumnType(columnNum)
    const orderType = order[0].dir;

    let sql = `SELECT stp_profiles.id, 
    stp_profiles.profile_name, stp_profiles.type
    FROM stp_profiles
    WHERE 1=1 `;
    let countTotalSql = `SELECT COUNT(stp_profiles.id) as countTotal
    FROM stp_profiles
    WHERE 1=1 `;
    let countFilteredSql = `SELECT COUNT(stp_profiles.id) as countFiltered
    FROM stp_profiles
    WHERE 1=1 `;
    if (name != '' && name != undefined) {
        sql += ` AND stp_profiles.profile_name LIKE '%${name}%'`;
        countFilteredSql += ` AND stp_profiles.profile_name LIKE '%${name}%'`;
    }
    if (erp && erp.length !== 3 && erp.length != 0) {
        if (erp.length == 1) {
            sql += ` AND stp_profiles.type = '${erp}'`;
            countFilteredSql += ` AND stp_profiles.type = '${erp}'`;
        } else if (erp.length == 2) {
            sql += ` AND ( stp_profiles.type = '${erp[0]}'`;
            sql += ` OR stp_profiles.type = '${erp[1]}' )`;
            countFilteredSql += ` AND ( stp_profiles.type = '${erp[0]}'`;
            countFilteredSql += ` OR stp_profiles.type = '${erp[1]}' )`;
        }
    } else if (erp == undefined) {
        return res.send(JSON.stringify([]));
    }
    if (search.value) {
        sql += `  AND (stp_profiles.profile_name LIKE '%${search.value}%' ) `

        countFilteredSql += `  AND (stp_profiles.profile_name LIKE '%${search.value}%' ) `
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

router.post('/api/filter/profile-details', (req, res) => {
    let {
        fromDate,
        toDate,
        profileID
    } = req.body;

    const tableHours = `profile_coef`;
    const profileTable = `stp_profiles`;
    let sql = `SELECT ${profileTable}.profile_name, ${profileTable}.type,${tableHours}.date, ${tableHours}.hour_zero AS 'hr0',${tableHours}.hour_one AS 'hr1',  ${tableHours}.hour_two AS 'hr2', ${tableHours}.hour_three AS 'hr3', ${tableHours}.hour_four AS 'hr4', ${tableHours}.hour_five AS 'hr5', ${tableHours}.hour_six AS 'hr6', ${tableHours}.hour_seven AS 'hr7', ${tableHours}.hour_eight AS 'hr8', ${tableHours}.hour_nine AS 'hr9', ${tableHours}.hour_ten AS 'hr10', ${tableHours}.hour_eleven AS 'hr11', ${tableHours}.hour_twelve AS 'hr12', ${tableHours}.hour_thirteen AS 'hr13', ${tableHours}.hour_fourteen AS 'hr14', ${tableHours}.hour_fifteen AS 'hr15', ${tableHours}.hour_sixteen AS 'hr16', ${tableHours}.hour_seventeen AS 'hr17', ${tableHours}.hour_eighteen AS 'hr18', ${tableHours}.hour_nineteen AS 'hr19', ${tableHours}.hour_twenty AS 'hr20', ${tableHours}.hour_twentyone AS 'hr21', ${tableHours}.hour_twentytwo AS 'hr22', ${tableHours}.hour_twentythree AS 'hr23'
    FROM ${profileTable}
    INNER JOIN ${tableHours} on ${profileTable}.id = ${tableHours}.profile_id  
    WHERE ${profileTable}.id = ${profileID} `;
    if (fromDate != -1 && toDate != -1) {
        sql += ` AND ${tableHours}.date>='${fromDate}' AND ${tableHours}.date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += ` AND ${tableHours}.date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += ` AND ${tableHours}.date<='${toDate}' `;
    }

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

function getColumnType(columnNum) {
    let result = 'profile_coef.id';

    switch (columnNum) {
        case '0':
            result = 'stp_profiles.id'
            break;
        case '1':
            result = 'stp_profiles.profile_name'
            break;
        case '2':
            result = 'stp_profiles.type'
            break;
    }
    return result
}

module.exports = router;