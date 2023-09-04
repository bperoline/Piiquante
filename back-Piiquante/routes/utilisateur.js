const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/utilisateur');
const GuardPasswordValidator = require("../middleware/GuardPasswordValidator");
const GuardLimiter = require("../middleware/GuardLimiter");

router.post('/signup', GuardPasswordValidator, userCtrl.signup);

router.post('/login', GuardLimiter, userCtrl.login);

module.exports = router;