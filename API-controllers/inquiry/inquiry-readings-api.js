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
    let sql;
    if (profile_name) {
        let profileNameSQL = ` SELECT id
         FROM stp_profiles
     WHERE profile_name = '${profile_name}'
     LIMIT 1 `;
        let profileRes = dbSync.query(profileNameSQL);
        profileID = profileRes[0].id;
    }
    if (metering_type.length == 1) {
        if (metering_type == 1) {
            metering_type = 'hour_readings';
        } else if (metering_type == 2) {
            metering_type = 'stp_hour_readings';
        }
        sql = `SELECT clients.ident_code, ${metering_type}.date, ${metering_type}.hour_zero AS 'hr0', ${metering_type}.hour_one AS 'hr1', ${metering_type}.hour_two AS 'hr2', ${metering_type}.hour_three AS 'hr3', ${metering_type}.hour_four AS 'hr4', ${metering_type}.hour_five AS 'hr5', ${metering_type}.hour_six AS 'hr6', ${metering_type}.hour_seven AS 'hr7' ${metering_type}.hour_eight AS 'hr8', ${metering_type}.hour_nine AS 'hr9', ${metering_type}.hour_ten AS 'hr10', ${metering_type}.hour_eleven AS 'hr11', ${metering_type}.hour_twelve AS 'hr12', ${metering_type}.hour_thirteen AS 'hr13', ${metering_type}.hour_fourteen AS 'hr14', ${metering_type}.hour_fifteen AS 'hr15' , ${metering_type}.hour_sixteen AS 'hr16', ${metering_type}.hour_seventeen AS 'hr17', ${metering_type}.hour_eighteen AS 'hr18', ${metering_type}.hour_nineteen AS 'hr19', ${metering_type}.hour_twenty AS 'hr20', ${metering_type}.hour_twentyone AS 'hr21', ${metering_type}.hour_twentytwo AS 'hr22', ${metering_type}.hour_twentythree AS 'hr23' FROM clients
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
    } else if (metering_type.length == 2) {
        metering_type = 'stp_hour_readings';
        sql = `SELECT clients.ident_code,${metering_type}.date,  IF(${metering_type}.hour_zero = -1, 0, hour_zero) AS 'hr0',IF(${metering_type}.hour_one = -1, 0, hour_one) AS 'hr1',  IF(${metering_type}.hour_two = -1, 0, hour_two) AS 'hr2', IF(${metering_type}.hour_three = -1, 0, hour_three) AS 'hr3', IF(${metering_type}.hour_four = -1, 0, hour_four) AS 'hr4', IF(${metering_type}.hour_five = -1, 0, hour_five) AS 'hr5', IF(${metering_type}.hour_six = -1, 0, hour_six) AS 'hr6', IF(${metering_type}.hour_seven = -1, 0, hour_seven) AS 'hr7', IF(${metering_type}.hour_eight = -1, 0, hour_eight) AS 'hr8', IF(${metering_type}.hour_nine = -1, 0, hour_nine) AS 'hr9', IF(${metering_type}.hour_ten = -1, 0, hour_ten) AS 'hr10', IF(${metering_type}.hour_eleven = -1, 0, hour_eleven) AS 'hr11', IF(${metering_type}.hour_twelve = -1, 0, hour_twelve) AS 'hr12', IF(${metering_type}.hour_thirteen = -1, 0, hour_thirteen) AS 'hr13', IF(${metering_type}.hour_fourteen = -1, 0, hour_fourteen) AS 'hr14', IF(${metering_type}.hour_fifteen = -1, 0, hour_fifteen) AS 'hr15' , IF(${metering_type}.hour_sixteen = -1, 0, hour_sixteen) AS 'hr16', IF(${metering_type}.hour_seventeen = -1, 0, hour_seventeen) AS 'hr17', IF(${metering_type}.hour_eighteen = -1, 0, hour_eighteen) AS 'hr18', IF(${metering_type}.hour_nineteen = -1, 0, hour_nineteen) AS 'hr19', IF(${metering_type}.hour_twenty = -1, 0, hour_twenty) AS 'hr20', IF(${metering_type}.hour_twentyone = -1, 0, hour_twentyone) AS 'hr21', IF(${metering_type}.hour_twentytwo = -1, 0, hour_twentytwo) AS 'hr22', IF(${metering_type}.hour_twentythree = -1, 0, hour_twentythree) AS 'hr23' FROM clients
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
        sql += ' UNION ';
        metering_type = 'hour_readings';
        sql += `SELECT clients.ident_code,${metering_type}.date, IF(${metering_type}.hour_zero = -1, 0, hour_zero) AS 'hr0',IF(${metering_type}.hour_one = -1, 0, hour_one) AS 'hr1',  IF(${metering_type}.hour_two = -1, 0, hour_two) AS 'hr2', IF(${metering_type}.hour_three = -1, 0, hour_three) AS 'hr3', IF(${metering_type}.hour_four = -1, 0, hour_four) AS 'hr4', IF(${metering_type}.hour_five = -1, 0, hour_five) AS 'hr5', IF(${metering_type}.hour_six = -1, 0, hour_six) AS 'hr6', IF(${metering_type}.hour_seven = -1, 0, hour_seven) AS 'hr7', IF(${metering_type}.hour_eight = -1, 0, hour_eight) AS 'hr8', IF(${metering_type}.hour_nine = -1, 0, hour_nine) AS 'hr9', IF(${metering_type}.hour_ten = -1, 0, hour_ten) AS 'hr10', IF(${metering_type}.hour_eleven = -1, 0, hour_eleven) AS 'hr11', IF(${metering_type}.hour_twelve = -1, 0, hour_twelve) AS 'hr12', IF(${metering_type}.hour_thirteen = -1, 0, hour_thirteen) AS 'hr13', IF(${metering_type}.hour_fourteen = -1, 0, hour_fourteen) AS 'hr14', IF(${metering_type}.hour_fifteen = -1, 0, hour_fifteen) AS 'hr15' , IF(${metering_type}.hour_sixteen = -1, 0, hour_sixteen) AS 'hr16', IF(${metering_type}.hour_seventeen = -1, 0, hour_seventeen) AS 'hr17', IF(${metering_type}.hour_eighteen = -1, 0, hour_eighteen) AS 'hr18', IF(${metering_type}.hour_nineteen = -1, 0, hour_nineteen) AS 'hr19', IF(${metering_type}.hour_twenty = -1, 0, hour_twenty) AS 'hr20', IF(${metering_type}.hour_twentyone = -1, 0, hour_twentyone) AS 'hr21', IF(${metering_type}.hour_twentytwo = -1, 0, hour_twentytwo) AS 'hr22', IF(${metering_type}.hour_twentythree = -1, 0, hour_twentythree) AS 'hr23' FROM clients
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
    } else if (metering_type.length === 0) {
        return res.send(JSON.stringify(result));
    }
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

module.exports = router;