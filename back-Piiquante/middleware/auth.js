/* Import des modules necessaires */
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config({ encoding: "latin1" });

// Permet de verifier l'authentification
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId,
        }
        console.log(req.auth)
        if (req.body.userId && req.body.userId !== userId) {
            throw "Identifiant invalide";
        } else {
            next();
        }
    } catch {
        res.status(401).json({
            error: new Error("Requete invalide!"),
        });
    }
};
