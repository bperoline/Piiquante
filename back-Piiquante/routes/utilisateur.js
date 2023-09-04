/* Import des modules necessaires */
const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/utilisateur');
const GuardPasswordValidator = require("../middleware/passwordValidator");
const GuardLimiter = require("../middleware/limiter");

/* Route pour s'inscrire et se connecter */
router.post('/signup', GuardPasswordValidator, userCtrl.signup);
router.post('/login', GuardLimiter, userCtrl.login);

module.exports = router;