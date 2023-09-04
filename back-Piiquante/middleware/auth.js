/* Import des modules necessaires */
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config({ encoding: "latin1" });

/**
 * Permet la vérification d'authentification
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodeurToken = jwt.verify(token, process.env.SECRET_KEY);
        const utilisateurId = decodeurToken.utilisateurId;
        req.auth = {
            userId: utilisateurId,
        }
        if (req.body.userId && req.body.userId !== utilisateurId) {
            throw "Invalid user ID";
        } else {
            next();
        }
    } catch {
        res.status(401).json({
            error: new Error("Invalid request!"),
        });
    }
};
