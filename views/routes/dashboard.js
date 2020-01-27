const express = require('express');
const router = express.Router();
const {
    ensureAuthenticated
} = require('../config/auth');

router.get('/', (req, res) => {
    res.render('welcome');
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

router.get('/dashboard', ensureAuthenticated, (req, res) => res.render('../public/AdminLTE-master/index.ejs', {
    name: req.user.name,
    id: req.user.id,
    password: req.user.password

}, user.setName(req.user.name)));

// Imports
router.get('/users/import/STP/Readings', (req, res) => res.render('./imports/importSTP.ejs', {
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
}))

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
router.get('/users/listClients-STP', (req, res) => res.render('./STP listings/listClients.ejs', {
    name: user.getName()
}))

// Hour-readings
router.get('/users/listClients-hours', ensureAuthenticated, (req, res) => res.render('./hour-readings/listClients-Hourly.ejs', {
    name: user.getName()
}));
router.get('/users/clients/hour-reading/:id', ensureAuthenticated, (req, res) => res.render('./hour-readings/clients-hour-readings.ejs', {
    name: user.getName()
}));
router.get('/users/clients/hour-reading/daily/s', ensureAuthenticated, (req, res) => res.render('./hour-readings/hour-readings-daily.ejs', {
    name: user.getName()
}));

module.exports = router;