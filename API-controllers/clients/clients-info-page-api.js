const express = require('express');
const router = express.Router();
const {
    db,
    dbSync
} = require('../../db.js');

router.get('/api/getClientSTP/details/datalist/:operator', (req, res) => {
    let operator = req.params.operator;
    let sql = `SELECT * FROM stp_profiles WHERE type = ${operator}`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(result);
    });
});
router.post('/api/saveClientSTPChanges/details/:id', async (req, res) => {
    const profileName = req.body.profileName;
    const isManufacturer = req.body.isManufacturer;
    const clientName = req.body.name;
    const clientID = req.params.id;
    let selectProfileSQL = `SELECT id FROM stp_profiles
    WHERE profile_name = '${profileName}'
    LIMIT 1`;
    let resultProfile = await dbSync.query(selectProfileSQL);
    let profileID = 0;
    if (resultProfile.length) {
        profileID = resultProfile[0].id;
    }

    let sql = `UPDATE clients SET profile_id = ${profileID},client_name = '${clientName}' , is_manufacturer= ${isManufacturer} WHERE id=${clientID}`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(result);
    });
});
router.get('/api/getClientInfo/:id', (req, res) => {
    let clientID = req.params.id;
    let sql = `SELECT clients.id, stp_profiles.profile_name, client_name, ident_code, metering_type, is_manufacturer, profile_id, erp_type FROM clients
    INNER JOIN stp_profiles on clients.profile_id = stp_profiles.id
    WHERE clients.id = ${clientID}`;
     db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        if (!result || result == '' || result == undefined || result == null) {
            sql = `SELECT clients.id, client_name, ident_code, metering_type, is_manufacturer, profile_id, erp_type FROM clients
            WHERE clients.id = ${clientID}`;
            db.query(sql, (err, result) => {
                if (err) {
                    throw err;
                }
                return res.send(result[0]);
            })
        } else {
            return res.send(result[0]);
        }
    });
});
router.get('/api/hour-readings/:fromDate/:toDate/:clientID', (req, res) => {
    const fromDate = req.params.fromDate;
    const toDate = req.params.toDate;
    const clientID = req.params.clientID;
    let sql = `SELECT clients.ident_code, hour_readings.date, hour_readings.hour_one AS 'hr1',  hour_readings.hour_two AS 'hr2', hour_readings.hour_three AS 'hr3', hour_readings.hour_four AS 'hr4', hour_readings.hour_five AS 'hr5', hour_readings.hour_six AS 'hr6', hour_readings.hour_seven AS 'hr7', hour_readings.hour_eight AS 'hr8', hour_readings.hour_nine AS 'hr9', hour_readings.hour_ten AS 'hr10', hour_readings.hour_eleven AS 'hr11', hour_readings.hour_twelve AS 'hr12', hour_readings.hour_thirteen AS 'hr13', hour_readings.hour_fourteen AS 'hr14', hour_readings.hour_fifteen AS 'hr15', hour_readings.hour_sixteen AS 'hr16', hour_readings.hour_seventeen AS 'hr17', hour_readings.hour_eighteen AS 'hr18', hour_readings.hour_nineteen AS 'hr19', hour_readings.hour_twenty AS 'hr20', hour_readings.hour_twentyone AS 'hr21', hour_readings.hour_twentytwo AS 'hr22', hour_readings.hour_twentythree AS 'hr23', hour_readings.hour_zero AS 'hr24'FROM clients
    INNER JOIN hour_readings on clients.id = hour_readings.client_id
    WHERE clients.id = '${clientID}' `;
    if (fromDate != -1 && toDate != -1) {
        sql += `AND date>='${fromDate}' AND date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += `AND date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += `AND date<='${toDate}' `;
    }
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});
router.get('/api/stp-hour-readings/:fromDate/:toDate/:clientID', (req, res) => {
    const fromDate = req.params.fromDate;
    const toDate = req.params.toDate;
    const clientID = req.params.clientID;
    let sql = `SELECT clients.ident_code, stp_hour_readings.date, stp_hour_readings.hour_one AS 'hr1',  stp_hour_readings.hour_two AS 'hr2', stp_hour_readings.hour_three AS 'hr3', stp_hour_readings.hour_four AS 'hr4', stp_hour_readings.hour_five AS 'hr5', stp_hour_readings.hour_six AS 'hr6', stp_hour_readings.hour_seven AS 'hr7', stp_hour_readings.hour_eight AS 'hr8', stp_hour_readings.hour_nine AS 'hr9', stp_hour_readings.hour_ten AS 'hr10', stp_hour_readings.hour_eleven AS 'hr11', stp_hour_readings.hour_twelve AS 'hr12', stp_hour_readings.hour_thirteen AS 'hr13', stp_hour_readings.hour_fourteen AS 'hr14', stp_hour_readings.hour_fifteen AS 'hr15', stp_hour_readings.hour_sixteen AS 'hr16', stp_hour_readings.hour_seventeen AS 'hr17', stp_hour_readings.hour_eighteen AS 'hr18', stp_hour_readings.hour_nineteen AS 'hr19', stp_hour_readings.hour_twenty AS 'hr20', stp_hour_readings.hour_twentyone AS 'hr21', stp_hour_readings.hour_twentytwo AS 'hr22', stp_hour_readings.hour_twentythree AS 'hr23', stp_hour_readings.hour_zero AS 'hr24'FROM clients
    INNER JOIN stp_hour_readings on clients.id = stp_hour_readings.client_id
    WHERE clients.id = '${clientID}' `;
    if (fromDate != -1 && toDate != -1) {
        sql += `AND date>='${fromDate}' AND date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += `AND date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += `AND date<='${toDate}' `;
    }
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});
router.get('/api/graph-predictions/:fromDate/:toDate/:clientID', (req, res) => {
    const fromDate = req.params.fromDate;
    const toDate = req.params.toDate;
    const clientID = req.params.clientID;
    let sql = `SELECT clients.ident_code, hour_prediction.date, hour_prediction.hour_one AS 'hr1',  hour_prediction.hour_two AS 'hr2', hour_prediction.hour_three AS 'hr3', hour_prediction.hour_four AS 'hr4', hour_prediction.hour_five AS 'hr5', hour_prediction.hour_six AS 'hr6', hour_prediction.hour_seven AS 'hr7', hour_prediction.hour_eight AS 'hr8', hour_prediction.hour_nine AS 'hr9', hour_prediction.hour_ten AS 'hr10', hour_prediction.hour_eleven AS 'hr11', hour_prediction.hour_twelve AS 'hr12', hour_prediction.hour_thirteen AS 'hr13', hour_prediction.hour_fourteen AS 'hr14', hour_prediction.hour_fifteen AS 'hr15', hour_prediction.hour_sixteen AS 'hr16', hour_prediction.hour_seventeen AS 'hr17', hour_prediction.hour_eighteen AS 'hr18', hour_prediction.hour_nineteen AS 'hr19', hour_prediction.hour_twenty AS 'hr20', hour_prediction.hour_twentyone AS 'hr21', hour_prediction.hour_twentytwo AS 'hr22', hour_prediction.hour_twentythree AS 'hr23', hour_prediction.hour_zero AS 'hr24'FROM clients
    INNER JOIN hour_prediction on clients.id = hour_prediction.client_id
    WHERE clients.id = '${clientID}' `;
    if (fromDate != -1 && toDate != -1) {
        sql += `AND date>='${fromDate}' AND date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += `AND date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += `AND date<='${toDate}' `;
    }
     db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});
router.get('/api/stp-graph-predictions/:fromDate/:toDate/:clientID', (req, res) => {
    const fromDate = req.params.fromDate;
    const toDate = req.params.toDate;
    const clientID = req.params.clientID;
    let sql = `SELECT clients.ident_code, profile_coef.date, profile_coef.hour_one AS 'phr1',  profile_coef.hour_two AS 'phr2', profile_coef.hour_three AS 'phr3', profile_coef.hour_four AS 'phr4', profile_coef.hour_five AS 'phr5', profile_coef.hour_six AS 'phr6', profile_coef.hour_seven AS 'phr7', profile_coef.hour_eight AS 'phr8', profile_coef.hour_nine AS 'phr9', profile_coef.hour_ten AS 'phr10', profile_coef.hour_eleven AS 'phr11', profile_coef.hour_twelve AS 'phr12', profile_coef.hour_thirteen AS 'phr13', profile_coef.hour_fourteen AS 'phr14', profile_coef.hour_fifteen AS 'phr15', profile_coef.hour_sixteen AS 'phr16', profile_coef.hour_seventeen AS 'phr17', profile_coef.hour_eighteen AS 'phr18', profile_coef.hour_nineteen AS 'phr19', profile_coef.hour_twenty AS 'phr20', profile_coef.hour_twentyone AS 'phr21', profile_coef.hour_twentytwo AS 'phr22', profile_coef.hour_twentythree AS 'phr23', profile_coef.hour_zero AS 'phr0',amount FROM clients
    INNER JOIN profile_coef ON profile_coef.profile_id = clients.profile_id 
    INNER JOIN prediction ON prediction.client_id = clients.id
    WHERE clients.id = '${clientID}'
    AND MONTH(prediction.date) = MONTH(profile_coef.date) 
    AND YEAR(prediction.date) = YEAR(profile_coef.date) `;
    if (fromDate != -1 && toDate != -1) {
        sql += `AND profile_coef.date>='${fromDate}' AND profile_coef.date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += `AND profile_coef.date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += `AND profile_coef.date<='${toDate}' `;
    }
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});
router.get('/api/imbalances/getClient/:fromDate/:toDate/:id', (req, res) => {
    const fromDate = req.params.fromDate;
    const toDate = req.params.toDate;
    const clientID = req.params.id;
    let sql = `SELECT clients.ident_code,hour_readings.date, hour_readings.hour_one AS 'hr0',hour_readings.hour_two AS 'hr1',  hour_readings.hour_three AS 'hr2', hour_readings.hour_four AS 'hr3', hour_readings.hour_five AS 'hr4', hour_readings.hour_six AS 'hr5', hour_readings.hour_seven AS 'hr6', hour_readings.hour_eight AS 'hr7', hour_readings.hour_nine AS 'hr8', hour_readings.hour_ten AS 'hr9', hour_readings.hour_eleven AS 'hr10', hour_readings.hour_twelve AS 'hr11', hour_readings.hour_thirteen AS 'hr12', hour_readings.hour_fourteen AS 'hr13', hour_readings.hour_fifteen AS 'hr14', hour_readings.hour_sixteen AS 'hr15', hour_readings.hour_seventeen AS 'hr16', hour_readings.hour_eighteen AS 'hr17', hour_readings.hour_nineteen AS 'hr18', hour_readings.hour_twenty AS 'hr19', hour_readings.hour_twentyone AS 'hr20', hour_readings.hour_twentytwo AS 'hr21', hour_readings.hour_twentythree AS 'hr22', hour_readings.hour_zero AS 'hr23', hour_prediction.hour_one AS 'phr0', hour_prediction.hour_two AS 'phr1',  hour_prediction.hour_three AS 'phr2', hour_prediction.hour_four AS 'phr3', hour_prediction.hour_five AS 'phr4', hour_prediction.hour_six AS 'phr5', hour_prediction.hour_seven AS 'phr6', hour_prediction.hour_eight AS 'phr7', hour_prediction.hour_nine AS 'phr8', hour_prediction.hour_ten AS 'phr9', hour_prediction.hour_eleven AS 'phr10', hour_prediction.hour_twelve AS 'phr11', hour_prediction.hour_thirteen AS 'phr12', hour_prediction.hour_fourteen AS 'phr13', hour_prediction.hour_fifteen AS 'phr14', hour_prediction.hour_sixteen AS 'phr15', hour_prediction.hour_seventeen AS 'phr16', hour_prediction.hour_eighteen AS 'phr17', hour_prediction.hour_nineteen AS 'phr18', hour_prediction.hour_twenty AS 'phr19', hour_prediction.hour_twentyone AS 'phr20', hour_prediction.hour_twentytwo AS 'phr21', hour_prediction.hour_twentythree AS 'phr22', hour_prediction.hour_zero AS 'phr23', is_manufacturer FROM clients
    INNER JOIN hour_readings on clients.id = hour_readings.client_id 
    INNER JOIN hour_prediction on hour_prediction.client_id = clients.id
    WHERE clients.id = ${clientID} `;
    if (fromDate != -1 && toDate != -1) {
        sql += ` AND hour_prediction.date>='${fromDate}' AND hour_prediction.date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += ` AND hour_prediction.date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += ` AND hour_prediction.date<='${toDate}' `;
    }
    sql += ` GROUP BY hour_prediction.date`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});
router.get('/api/stp-imbalances/getClient/:fromDate/:toDate/:id', (req, res) => {
    const fromDate = req.params.fromDate;
    const toDate = req.params.toDate;
    const clientID = req.params.id;
    let sql = `SELECT clients.ident_code,profile_coef.date, amount, stp_hour_readings.hour_one AS 'hr0',stp_hour_readings.hour_two AS 'hr1',  stp_hour_readings.hour_three AS 'hr2', stp_hour_readings.hour_four AS 'hr3', stp_hour_readings.hour_five AS 'hr4', stp_hour_readings.hour_six AS 'hr5', stp_hour_readings.hour_seven AS 'hr6', stp_hour_readings.hour_eight AS 'hr7', stp_hour_readings.hour_nine AS 'hr8', stp_hour_readings.hour_ten AS 'hr9', stp_hour_readings.hour_ten AS 'hr10', stp_hour_readings.hour_twelve AS 'hr11', stp_hour_readings.hour_thirteen AS 'hr12', stp_hour_readings.hour_fourteen AS 'hr13', stp_hour_readings.hour_fifteen AS 'hr14', stp_hour_readings.hour_sixteen AS 'hr15', stp_hour_readings.hour_seventeen AS 'hr16', stp_hour_readings.hour_eighteen AS 'hr17', stp_hour_readings.hour_nineteen AS 'hr18', stp_hour_readings.hour_twenty AS 'hr19', stp_hour_readings.hour_twentyone AS 'hr20', stp_hour_readings.hour_twentytwo AS 'hr21', stp_hour_readings.hour_twentythree AS 'hr22', stp_hour_readings.hour_zero AS 'hr23',
     profile_coef.hour_one AS 'phr0', profile_coef.hour_two AS 'phr1', profile_coef.hour_three AS 'phr2', profile_coef.hour_four AS 'phr3', profile_coef.hour_five AS 'phr4', profile_coef.hour_six AS 'phr5', profile_coef.hour_seven AS 'phr6', profile_coef.hour_eight AS 'phr7', profile_coef.hour_nine AS 'phr8', profile_coef.hour_ten AS 'phr9', profile_coef.hour_eleven AS 'phr10', profile_coef.hour_twelve AS 'phr11', profile_coef.hour_thirteen AS 'phr12', profile_coef.hour_fourteen AS 'phr13', profile_coef.hour_fifteen AS 'phr14', profile_coef.hour_sixteen AS 'phr15', profile_coef.hour_seventeen AS 'phr16', profile_coef.hour_eighteen AS 'phr17', profile_coef.hour_nineteen AS 'phr18', profile_coef.hour_twenty AS 'phr19', profile_coef.hour_twentyone AS 'phr20', profile_coef.hour_twentytwo AS 'phr21', profile_coef.hour_twentythree AS 'phr22', profile_coef.hour_zero AS 'phr23', is_manufacturer FROM clients
    INNER JOIN stp_hour_readings ON clients.id = stp_hour_readings.client_id 
    INNER JOIN profile_coef ON profile_coef.profile_id = clients.profile_id
    INNER JOIN prediction ON prediction.client_id = clients.id
    WHERE MONTH(prediction.date) = MONTH(profile_coef.date)
    AND YEAR(prediction.date) = YEAR(profile_coef.date)
    AND profile_coef.date = stp_hour_readings.date
    AND clients.id = ${clientID} `;
    if (fromDate != -1 && toDate != -1) {
        sql += ` AND profile_coef.date>='${fromDate}' AND profile_coef.date<= '${toDate}' `;
    } else if (fromDate != -1 && toDate == -1) {
        sql += ` AND profile_coef.date>='${fromDate}' `;
    } else if (toDate != -1 && fromDate == -1) {
        sql += ` AND profile_coef.date<='${toDate}' `;
    }
    sql += ` GROUP BY profile_coef.date`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});
router.get('/api/hour-readings/getClient/:id', (req, res) => {
    let sql = `SELECT * FROM clients
    INNER JOIN hour_readings on clients.id = hour_readings.client_id 
    WHERE clients.id = '${req.params.id}' `;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});
router.get('/api/stp-hour-readings/getClient/:id', (req, res) => {
    let sql = `SELECT * FROM clients
    INNER JOIN stp_hour_readings on clients.id = stp_hour_readings.client_id 
    WHERE clients.id = '${req.params.id}' `;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});
router.get('/api/graph-predictions/getClient/:id', (req, res) => {
    let sql = `SELECT * FROM clients
    INNER JOIN hour_prediction on clients.id = hour_prediction.client_id 
    WHERE clients.id = '${req.params.id}' `;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

router.get('/api/stp-graph-predictions/getClient/:id', (req, res) => {
    let sql = `SELECT clients.client_name, profile_coef.date, amount, profile_coef.hour_zero AS 'phr0',profile_coef.hour_one AS 'phr1',  profile_coef.hour_two AS 'phr2', profile_coef.hour_three AS 'phr3', profile_coef.hour_four AS 'phr4', profile_coef.hour_five AS 'phr5', profile_coef.hour_six AS 'phr6', profile_coef.hour_seven AS 'phr7', profile_coef.hour_eight AS 'phr8', profile_coef.hour_nine AS 'phr9', profile_coef.hour_ten AS 'phr10', profile_coef.hour_eleven AS 'phr11', profile_coef.hour_twelve AS 'phr12', profile_coef.hour_thirteen AS 'phr13', profile_coef.hour_fourteen AS 'phr14', profile_coef.hour_fifteen AS 'phr15', profile_coef.hour_sixteen AS 'phr16', profile_coef.hour_seventeen AS 'phr17', profile_coef.hour_eighteen AS 'phr18', profile_coef.hour_nineteen AS 'phr19', profile_coef.hour_twenty AS 'phr20', profile_coef.hour_twentyone AS 'phr21', profile_coef.hour_twentytwo AS 'phr22', profile_coef.hour_twentythree AS 'phr23' FROM clients
    INNER JOIN profile_coef ON profile_coef.profile_id = clients.profile_id 
    INNER JOIN prediction ON prediction.client_id = clients.id
    WHERE clients.id = '${req.params.id}'
    AND MONTH(prediction.date) = MONTH(profile_coef.date) 
    AND YEAR(prediction.date) = YEAR(profile_coef.date)`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});
router.get('/api/imbalances/getClient/:id', (req, res) => {
    let sql = `SELECT clients.ident_code,hour_readings.date, hour_readings.hour_zero AS 'hr0',hour_readings.hour_one AS 'hr1',  hour_readings.hour_two AS 'hr2', hour_readings.hour_three AS 'hr3', hour_readings.hour_four AS 'hr4', hour_readings.hour_five AS 'hr5', hour_readings.hour_six AS 'hr6', hour_readings.hour_seven AS 'hr7', hour_readings.hour_eight AS 'hr8', hour_readings.hour_nine AS 'hr9', hour_readings.hour_ten AS 'hr10', hour_readings.hour_eleven AS 'hr11', hour_readings.hour_twelve AS 'hr12', hour_readings.hour_thirteen AS 'hr13', hour_readings.hour_fourteen AS 'hr14', hour_readings.hour_fifteen AS 'hr15', hour_readings.hour_sixteen AS 'hr16', hour_readings.hour_seventeen AS 'hr17', hour_readings.hour_eighteen AS 'hr18', hour_readings.hour_nineteen AS 'hr19', hour_readings.hour_twenty AS 'hr20', hour_readings.hour_twentyone AS 'hr21', hour_readings.hour_twentytwo AS 'hr22', hour_readings.hour_twentythree AS 'hr23', hour_prediction.hour_zero AS 'phr0', hour_prediction.hour_one AS 'phr1',  hour_prediction.hour_two AS 'phr2', hour_prediction.hour_three AS 'phr3', hour_prediction.hour_four AS 'phr4', hour_prediction.hour_five AS 'phr5', hour_prediction.hour_six AS 'phr6', hour_prediction.hour_seven AS 'phr7', hour_prediction.hour_eight AS 'phr8', hour_prediction.hour_nine AS 'phr9', hour_prediction.hour_ten AS 'phr10', hour_prediction.hour_eleven AS 'phr11', hour_prediction.hour_twelve AS 'phr12', hour_prediction.hour_thirteen AS 'phr13', hour_prediction.hour_fourteen AS 'phr14', hour_prediction.hour_fifteen AS 'phr15', hour_prediction.hour_sixteen AS 'phr16', hour_prediction.hour_seventeen AS 'phr17', hour_prediction.hour_eighteen AS 'phr18', hour_prediction.hour_nineteen AS 'phr19', hour_prediction.hour_twenty AS 'phr20', hour_prediction.hour_twentyone AS 'phr21', hour_readings.hour_twentytwo AS 'phr22', hour_prediction.hour_twentythree AS 'phr23',is_manufacturer FROM clients
    INNER JOIN hour_readings on clients.id = hour_readings.client_id 
    INNER JOIN hour_prediction on hour_prediction.client_id = clients.id
    WHERE clients.id = ${req.params.id}
    GROUP BY hour_prediction.date
`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

router.get('/api/stp-imbalances/getClient/:id', (req, res) => {
    let clientID = req.params.id;
    let sql = `SELECT clients.ident_code,profile_coef.date, amount, stp_hour_readings.hour_one AS 'hr0',stp_hour_readings.hour_two AS 'hr1',  stp_hour_readings.hour_three AS 'hr2', stp_hour_readings.hour_four AS 'hr3', stp_hour_readings.hour_five AS 'hr4', stp_hour_readings.hour_six AS 'hr5', stp_hour_readings.hour_seven AS 'hr6', stp_hour_readings.hour_eight AS 'hr7', stp_hour_readings.hour_nine AS 'hr8', stp_hour_readings.hour_ten AS 'hr9', stp_hour_readings.hour_ten AS 'hr10', stp_hour_readings.hour_twelve AS 'hr11', stp_hour_readings.hour_thirteen AS 'hr12', stp_hour_readings.hour_fourteen AS 'hr13', stp_hour_readings.hour_fifteen AS 'hr14', stp_hour_readings.hour_sixteen AS 'hr15', stp_hour_readings.hour_seventeen AS 'hr16', stp_hour_readings.hour_eighteen AS 'hr17', stp_hour_readings.hour_nineteen AS 'hr18', stp_hour_readings.hour_twenty AS 'hr19', stp_hour_readings.hour_twentyone AS 'hr20', stp_hour_readings.hour_twentytwo AS 'hr21', stp_hour_readings.hour_twentythree AS 'hr22', stp_hour_readings.hour_zero AS 'hr23',
    profile_coef.hour_one AS 'phr0', profile_coef.hour_two AS 'phr1', profile_coef.hour_three AS 'phr2', profile_coef.hour_four AS 'phr3', profile_coef.hour_five AS 'phr4', profile_coef.hour_six AS 'phr5', profile_coef.hour_seven AS 'phr6', profile_coef.hour_eight AS 'phr7', profile_coef.hour_nine AS 'phr8', profile_coef.hour_ten AS 'phr9', profile_coef.hour_eleven AS 'phr10', profile_coef.hour_twelve AS 'phr11', profile_coef.hour_thirteen AS 'phr12', profile_coef.hour_fourteen AS 'phr13', profile_coef.hour_fifteen AS 'phr14', profile_coef.hour_sixteen AS 'phr15', profile_coef.hour_seventeen AS 'phr16', profile_coef.hour_eighteen AS 'phr17', profile_coef.hour_nineteen AS 'phr18', profile_coef.hour_twenty AS 'phr19', profile_coef.hour_twentyone AS 'phr20', profile_coef.hour_twentytwo AS 'phr21', profile_coef.hour_twentythree AS 'phr22', profile_coef.hour_zero AS 'phr23', is_manufacturer FROM clients
   INNER JOIN stp_hour_readings ON clients.id = stp_hour_readings.client_id 
   INNER JOIN profile_coef ON profile_coef.profile_id = clients.profile_id
   INNER JOIN prediction ON prediction.client_id = clients.id
   WHERE MONTH(prediction.date) = MONTH(profile_coef.date)
   AND YEAR(prediction.date) = YEAR(profile_coef.date)
   AND profile_coef.date = stp_hour_readings.date
   AND clients.id = ${clientID} 
`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(JSON.stringify(result));
    });
});

router.get('/api/getClientSTP/details/:id', (req, res) => {
    let clientID = req.params.id;
    let sql = `SELECT DISTINCT client_name, ident_code, profile_id, is_manufacturer ,operator FROM clients 
    INNER JOIN invoicing on invoicing.client_id = clients.id
    WHERE clients.metering_type = 2 AND clients.id = ${clientID}`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        return res.send(result[0]);
    });
});

module.exports = router;