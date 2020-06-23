const express = require('express');
const router = express.Router();
const {
    db,
    dbSync
} = require('../../db.js');

router.get('/api/groups-clients', (req, res) => {
    const sql = `SELECT DISTINCT client_name AS name FROM clients`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});

router.get('/api/clients-groups/:name', (req, res) => {
    const {
        name
    } = req.params;
    const sql = `SELECT id, ident_code, metering_type, erp_type FROM clients
    WHERE client_name = '${name}'
    AND NOT EXISTS(
        SELECT client_id
        FROM group_clients
        INNER JOIN clients ON clients.id = group_clients.client_id
        WHERE group_clients.client_id = clients.id
        AND client_name = '${name}'
        )`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});

router.get('/api/clients-in-group/:groupID', (req, res) => {
    const {
        groupID
    } = req.params;
    const sql = `SELECT group_clients.id, clients.ident_code, clients.metering_type, clients.erp_type, clients.client_name
     FROM clients
     INNER JOIN group_clients ON group_clients.client_id = clients.id
    WHERE group_clients.group_id = '${groupID}'`;

    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});

router.get('/api/groups', (req, res) => {
    const sql = `SELECT id, name FROM groups`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});

router.post('/api/group', (req, res) => {
    const {
        groupName
    } = req.body;
    const sql = `INSERT INTO groups (name,created_at,updated_at) VALUES('${groupName}', now(), now())`;
    db.query(sql, (err, result) => {
        if (err) {
            //  DUPLICATE ENTRY
            if (err.errno === 1062) {
                return res.status(409).send({
                    message: 'Duplicate entry!'
                });
            }
        }
        res.send(result);
    });
});

router.post('/api/clients-group', (req, res) => {
    const {
        objArr,
    } = req.body;

    const sql = `INSERT INTO group_clients (group_id, client_id, created_at, updated_at) VALUES ?`;
    db.query(sql, [objArr], function (err, result) {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});

router.delete('/api/clients-groups/:id', (req, res) => {
    const {
        id
    } = req.params;
    const sql = `DELETE FROM group_clients
    WHERE group_clients.id = '${id}'`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});

module.exports = router;