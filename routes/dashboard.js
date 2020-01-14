const express = require('express');
const router = express.Router();
const {
    ensureAuthenticated
} = require('../config/auth');

router.get('/', (req, res) => {
    res.render('welcome');
});

router.get('/dashboard', ensureAuthenticated, (req, res) => res.render('../public/AdminLTE-master/index.ejs', {
    name: req.user.name,
    id: req.user.id,
    password: req.user.password
}));
router.get('/users/import/STP/Readings', ensureAuthenticated, (req, res) => res.render('importSTP.ejs'));
router.get('/users/import/hour-readings/CEZ', ensureAuthenticated, (req, res) => res.render('hour_readings.ejs'));
router.get('/users/import/hour-readings/evnORenergoPRO', ensureAuthenticated, (req, res) => res.render('hour_readingsMultiImport.ejs'));
router.get('/users/listReadings', ensureAuthenticated, (req, res) => res.render('listReadings.ejs'));
router.get('/users/clients/:id', ensureAuthenticated, (req, res) => res.render('clients.ejs'));
router.get('/users/reading/:id', ensureAuthenticated, (req, res) => res.render('readingDetails.ejs'));

module.exports = router;