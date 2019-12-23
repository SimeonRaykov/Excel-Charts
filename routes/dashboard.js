const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');

router.get('/', (req, res) => {
    res.render('welcome');
});

router.get('/dashboard', ensureAuthenticated, (req, res) => res.render('dashboard', {
    name:req.user.name,
    id:req.user.id,
    password:req.user.password
}));

router.get('/users/listReadings', ensureAuthenticated, (req, res) => res.render('listReadings.ejs'));

module.exports = router;