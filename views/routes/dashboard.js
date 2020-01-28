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
router.get('/users/import/STP/Readings', ensureAuthenticated, (req, res) => res.render('./imports/importSTP.ejs', {
    name: user.getName()
}));
router.get('/users/import/hour-readings/CEZ', ensureAuthenticated, (req, res) => res.render('./imports/hour_readings.ejs', {
    name: user.getName()
}));
router.get('/users/import/profiles/evnOrEnergoPRO', ensureAuthenticated, (req, res) => res.render('./imports/profiles', {
    name: user.getName()
}))
router.get('/users/import/hour-readings/evnORenergoPRO', ensureAuthenticated, (req, res) => res.render('./imports/hour_readingsMultiImport.ejs', {
    name: user.getName()
}));

router.get('/users/import/profiles', ensureAuthenticated, (req, res) => res.render('./imports/profiles.ejs', {
    name: user.getName()
}));

router.get('/users/import/graphs', ensureAuthenticated, (req, res) => res.render('./imports/graphs.ejs', {
    name: user.getName()
}));


// STP Listing
router.get('/users/listReadings', ensureAuthenticated, (req, res) => res.render('./STP listings/listReadings.ejs', {
    name: user.getName()
}));
router.get('/users/clients/:id', ensureAuthenticated, (req, res) => res.render('./STP listings/clients.ejs', {
    name: user.getName()
}));
router.get('/users/reading/:id', ensureAuthenticated, (req, res) => res.render('./STP listings/readingDetails.ejs', {
    name: user.getName()
}));
router.get('/users/listClients-STP', ensureAuthenticated, (req, res) => res.render('./STP listings/listClients.ejs', {
    name: user.getName()
}))
router.get('/users/clients/STP-Details/:id', (req, res) => res.render('./STP listings/listSTPClientDetails.ejs', {
    name: user.getName()
}))

// Hour-readings

router.get('/users/clients/hour-reading/:id', ensureAuthenticated, (req, res) => res.render('./hour-readings/clients-hour-readings.ejs', {
    name: user.getName()
}));
router.get('/users/clients/hour-reading/daily/s', ensureAuthenticated, (req, res) => res.render('./hour-readings/hour-readings-daily.ejs', {
    name: user.getName()
}));
router.get('/users/listClients-hours', ensureAuthenticated, (req, res) => res.render('./hour-readings/listClients-Hourly.ejs', {
    name: user.getName()
}));
module.exports = router;