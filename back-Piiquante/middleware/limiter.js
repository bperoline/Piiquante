/* Import des modules necessaires */
const rateLimit = require("express-rate-limit");

/* Permet de limiter le nombre de requette dans un temps donné */
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 3
});

module.exports = limiter;