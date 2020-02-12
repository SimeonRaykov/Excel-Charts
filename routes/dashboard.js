const express = require('express');
const router = express.Router();
const {
    ensureAuthenticated
} = require('../config/auth');

router.get('/', (req, res) => {
    res.render('./authentication/login', {
        layout: 'layoutAuth.ejs'
    });
});

class User {
    constructor() {
        this.name = '';
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
    }
}
let user = new User();

router.get('/dashboard', (req, res) => res.render('../public/AdminLTE-master/index.ejs', {
    name: req.user.name,
    id: req.user.id,
    password: req.user.password

}, user.setName(req.user.name)));
router.get('/users/listClients-hours', (req, res) => res.render('./hour-readings/listClients-Hourly.ejs', {
    name: user.getName()
}));
// Imports
router.get('/users/import/stp', (req, res) => res.render('./imports/stp.ejs', {
    name: user.getName()
}));

router.get('/users/import/STP/Readings', (req, res) => res.render('./imports/importSTP.ejs', {
    name: user.getName()
}));
router.get('/users/import/STP/HourPredictions', (req, res) => res.render('./imports/importSTP-Predictions.ejs', {
    name: user.getName()
}));
router.get('/users/import/hour-readings/CEZ', (req, res) => res.render('./imports/hour_readings.ejs', {
    name: user.getName()
}));
router.get('/users/import/profiles/evnOrEnergoPRO', (req, res) => res.render('./imports/profiles', {
    name: user.getName()
}))
router.get('/users/import/hour-readings/evnORenergoPRO', (req, res) => res.render('./imports/hour_readingsMultiImport.ejs', {
    name: user.getName()
}));

router.get('/users/import/profiles', (req, res) => res.render('./imports/profiles.ejs', {
    name: user.getName()
}));
router.get('/users/import/graphs', (req, res) => res.render('./imports/graphs.ejs', {
    name: user.getName()
}));
router.get('/users/import/stp-hour-readings', (req, res) => res.render('./imports/stp_hour_readings.ejs', {
    name: user.getName()
}));

// STP Listing
router.get('/users/listReadings', (req, res) => res.render('./STP listings/listReadings.ejs', {
    name: user.getName()
}));
router.get('/users/clients/:id', (req, res) => res.render('./STP listings/clients.ejs', {
    name: user.getName()
}));
router.get('/users/reading/:id', (req, res) => res.render('./STP listings/readingDetails.ejs', {
    name: user.getName()
}));

router.get('/users/listClients-STP', (req, res) => res.render('./STP listings/listClients-STP.ejs', {
    name: user.getName()
}));
router.get('/users/clients/STP-Details/:id', (req, res) => res.render('./STP listings/listSTPClientDetails.ejs', {
    name: user.getName()
}));

// Hour-readings

router.get('/users/clients/hour-reading/:id', (req, res) => res.render('./hour-readings/clients-hour-readings.ejs', {
    name: user.getName()
}));
router.get('/users/clients/hour-reading/daily/s', (req, res) => res.render('./hour-readings/hour-readings-daily.ejs', {
    name: user.getName()
}));
router.get('/users/listHourReadings', (req, res) => res.render('./hour-readings/listHourReadingsTable.ejs', {
    name: user.getName()
}));

// Graphs
router.get('/users/graphs/STP', (req, res) => res.render('./Graphs/GraphSTP.ejs', {
    name: user.getName()
}))

router.get('/users/graphs/STP/:id', (req, res) => res.render('./Graphs/GraphSTP-Client.ejs', {
    name: user.getName()
}))


// Exports
router.get('/users/inquiry', (req, res) => res.render('./exports/inquirySTP.ejs', {
    name: user.getName()
}))


// Clients
router.get('/users/clients', (req, res) => res.render('./clients/clients.ejs', {
    name: user.getName()
}));

router.get('/users/clients/info/:id', (req, res) => res.render('./clients/clients-info.ejs', { //./hour-readings/clients-hour-readings.ejs'
    name: user.getName()
}));

// Invoicing
router.get('/users/invoicing', (req, res) => res.render('./invoicing/list-readings-stp.ejs', {
    name: user.getName()
}));

// Readings menu - STP Hour - readings
router.get('/users/clients/stp-hour-reading/daily/s', (req, res) => res.render('./readings-menu/list-readings-stp.ejs', {
    name: user.getName()
}));

module.exports = router;