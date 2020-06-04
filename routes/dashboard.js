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
router.get('/users/import/hourly', (req, res) => res.render('./imports/hourly.ejs', {
    name: user.getName()
}));
router.get('/users/import/eso', (req, res) => res.render('./imports/hourly-eso.ejs', {
    name: user.getName()
}));
router.get('/users/import/invoicing', (req, res) => res.render('./imports/importSTP.ejs', {
    name: user.getName()
}));

// Profiles
router.get('/users/profiles', (req, res) => res.render('./profiles/list-profiles-table.ejs', {
    name: user.getName()
}));
router.get('/users/profiles/:id', (req, res) => res.render('./profiles/profile-details.ejs', {
    name: user.getName()
}));

// Clients
router.get('/users/clients', (req, res) => res.render('./clients/clients.ejs', {
    name: user.getName()
}));
router.get('/users/clients/info/:id', (req, res) => res.render('./clients/clients-info.ejs', {
    name: user.getName()
}));
router.get('/users/clients-eso/info/:id', (req, res) => res.render('./clients/clients-eso-info.ejs', {
    name: user.getName()
}));

// Readings menu
router.get('/users/list/readings', (req, res) => res.render('./readings-menu/listReadings.ejs', {
    name: user.getName()
}));
router.get('/users/list/hour-readings', (req, res) => res.render('./readings-menu/listHourReadingsTable.ejs', {
    name: user.getName()
}));
router.get('/users/clients/stp-hour-reading/daily/s', (req, res) => res.render('./readings-menu/list-readings-stp.ejs', {
    name: user.getName()
}));
router.get('/users/clients/hour-reading/daily/s', (req, res) => res.render('./readings-menu/hour-readings-daily.ejs', {
    name: user.getName()
}));
router.get('/users/list/eso-hour-readings', (req, res) => res.render('./readings-menu/list-eso-hour-readings.ejs', {
    name: user.getName()
}));
router.get('/users/eso-hour-readings/daily/s', (req, res) => res.render('./readings-menu/eso-hour-readings-daily.ejs', {
    name: user.getName()
}));
router.get('/users/eso-graph-predictions/daily/s', (req, res) => res.render('./graphs-menu/eso-graph-predictions-daily.ejs', {
    name: user.getName()
}));

//  Graphs menu
router.get('/users/list/stp-graph-readings/', (req, res) => res.render('./graphs-menu/stp-graph-readings.ejs', {
    name: user.getName()
}));
router.get('/users/list/graph-readings/', (req, res) => res.render('./graphs-menu/graph-readings.ejs', {
    name: user.getName()
}));
router.get('/users/clients/graphs-stp-hour-prediction/monthly/s', (req, res) => res.render('./graphs-menu/graphs-stp-hour-prediction-daily.ejs', {
    name: user.getName()
}));
router.get('/users/clients/graphs-hour-prediction/daily/s', (req, res) => res.render('./graphs-menu/graphs-hour-prediction-daily.ejs', {
    name: user.getName()
}));
router.get('/users/list/eso-graph-readings/', (req, res) => res.render('./graphs-menu/list-eso-graphs.ejs', {
    name: user.getName()
}));

//  Invoicing
router.get('/users/invoicing-stp', (req, res) => res.render('./invoicing/list-readings-stp.ejs', {
    name: user.getName()
}));
router.get('/users/invoicing-hourly', (req, res) => res.render('./invoicing/list-readings-hourly.ejs', {
    name: user.getName()
}));
router.get('/users/invoicing/preview', (req, res) => res.render('./invoicing/invoicing-preview-readings.ejs', {
    name: user.getName()
}));
router.get('/users/clients/:id', (req, res) => res.render('./invoicing/clients.ejs', {
    name: user.getName()
}));
router.get('/users/reading/:id', (req, res) => res.render('./invoicing/readingDetails.ejs', {
    name: user.getName()
}));

//  Inquiry 
router.get('/users/inquiry', (req, res) => res.render('./inquiry/inquirySTP.ejs', {
    name: user.getName()
}));
router.get('/users/inquiry/readings', (req, res) => res.render('./inquiry/inquiry-readings.ejs', {
    name: user.getName()
}));
router.get('/users/inquiry/graphs', (req, res) => res.render('./inquiry/inquiry-graphs.ejs', {
    name: user.getName()
}));
router.get('/users/inquiry/imbalances', (req, res) => res.render('./inquiry/inquiry-imbalances.ejs', {
    name: user.getName()
}));
router.get('/users/inquiry/missing-information', (req, res) => res.render('./inquiry/inquiry-missing-information.ejs', {
    name: user.getName()
}));

module.exports = router;
module.exports.getUsername = user.getName()