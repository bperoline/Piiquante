/* Import des modules necessaires */
const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauce')
const guardAuth = require("../middleware/auth");
const guardMulter = require("../middleware/multer-config");

/* Route pour la sauce */
router.get('/', guardAuth, sauceCtrl.default);
router.get('/:id', guardAuth, sauceCtrl.sauceById);
router.post("/", guardAuth, guardMulter, sauceCtrl.saveSauce);
router.put('/:id', guardAuth, guardMulter, sauceCtrl.majSauce);
router.delete('/:id', guardAuth, guardMulter, sauceCtrl.suppSauce);
router.post('/:id/like', guardAuth, sauceCtrl.like);


module.exports = router;