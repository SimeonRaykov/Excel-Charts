const express = require('express');
const router = express.Router();
const {
    db,
    dbSync
} = require('../../db.js');
router.get('/api/data-listings/profile-name', (req, res) => {
    let sql = `SELECT clients.profile_id, clients.client_name, stp_profiles.profile_name
     FROM clients
     INNER JOIN stp_profiles ON stp_profiles.id = clients.profile_id 
     WHERE profile_id != 0
     AND metering_type = 2
     GROUP BY stp_profiles.profile_name`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

router.post('/api/filter/inquiry-readings/', (req, res) => {
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
    let sql = `SELECT clients.ident_code,${metering_type}.date, ${metering_type}.hour_one AS 'hr0',${metering_type}.hour_two AS 'hr1',  ${metering_type}.hour_three AS 'hr2', ${metering_type}.hour_four AS 'hr3', ${metering_type}.hour_five AS 'hr4', ${metering_type}.hour_six AS 'hr5', ${metering_type}.hour_seven AS 'hr6', ${metering_type}.hour_eight AS 'hr7', ${metering_type}.hour_nine AS 'hr8', ${metering_type}.hour_ten AS 'hr9', ${metering_type}.hour_eleven AS 'hr10', ${metering_type}.hour_twelve AS 'hr11', ${metering_type}.hour_thirteen AS 'hr12', ${metering_type}.hour_fourteen AS 'hr13', ${metering_type}.hour_fifteen AS 'hr14', ${metering_type}.hour_sixteen AS 'hr15', ${metering_type}.hour_seventeen AS 'hr16', ${metering_type}.hour_eighteen AS 'hr17', ${metering_type}.hour_nineteen AS 'hr18', ${metering_type}.hour_twenty AS 'hr19', ${metering_type}.hour_twentyone AS 'hr20', ${metering_type}.hour_twentytwo AS 'hr21', ${metering_type}.hour_twentythree AS 'hr22', ${metering_type}.hour_zero AS 'hr23' FROM clients
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
        sql += ` AND clients.name = '${name}' `
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
    console.log(profileID);
    if (profileID!=-1 && metering_type == 'stp_hour_readings') {
        sql +=` AND profile_id = ${profileID}`
    }
    let query = db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        console.log(query.sql);
        return res.send(JSON.stringify(result));
    });
});

module.exports = router;