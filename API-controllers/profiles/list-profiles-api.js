const express = require('express');
const router = express.Router();
const {
    db
} = require('../../db.js');

router.post('/api/filter/profiles', (req, res) => {
    let {
        search,
        start,
        length,
        order,
        fromDate,
        toDate,
        name,
        erp
    } = req.body;

    const columnNum = order[0].column;
    const columnType = getColumnType(columnNum)
    const orderType = order[0].dir;

    let sql = `SELECT profile_coef.id, profile_coef.date, 
    stp_profiles.profile_name, stp_profiles.type
    FROM profile_coef
    INNER JOIN stp_profiles ON profile_coef.profile_id = stp_profiles.id
    WHERE 1=1 `;
    let countTotalSql = `SELECT COUNT(profile_coef.id) as countTotal
    FROM profile_coef
    INNER JOIN stp_profiles ON profile_coef.profile_id = stp_profiles.id
    WHERE 1=1 `;
    let countFilteredSql = `SELECT COUNT(profile_coef.id) as countFiltered
    FROM profile_coef
    INNER JOIN stp_profiles ON profile_coef.profile_id = stp_profiles.id
    WHERE 1=1 `;
    if (fromDate != '' && fromDate != undefined && toDate != '' && toDate != undefined) {
        sql += ` AND profile_coef.date >= '${fromDate}' AND profile_coef.date <= '${toDate}' `;
        countFilteredSql += ` AND profile_coef.date >= '${fromDate}' AND profile_coef.date <= '${toDate}' `;
    } else if (fromDate != '' && fromDate != undefined && (toDate == '' || toDate == undefined)) {
        sql += ` AND profile_coef.date >= '${fromDate}' `;
        countFilteredSql += ` AND profile_coef.date >= '${fromDate}' `;
    } else if (toDate != '' && toDate != undefined && (fromDate == '' || fromDate == undefined)) {
        sql += ` AND profile_coef.date <= '${toDate}' `;
        countFilteredSql += ` AND profile_coef.date <= '${toDate}' `;
    }
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

function getColumnType(columnNum) {
    let result = 'profile_coef.id';

    switch (columnNum) {
        case '0':
            result = 'profile_coef.id'
            break;
        case '1':
            result = 'stp_profiles.profile_name'
            break;
        case '2':
            result = 'profile_coef.date'
            break;
        case '3':
            result = 'stp_profiles.type'
            break;
    }
    return result
}

module.exports = router;