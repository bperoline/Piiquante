/* Import des modules necessaires */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const utilisateur = require('../models/utilisateur');
const dotenv = require("dotenv").config({ encoding: "latin1" });

/**
 * Permet de se creer un compte
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(mdp => {
            let ecqEmail = regexEmail(req.body.email)
            if (ecqEmail === true) {
                const user = new Utilisateur({
                    email: req.body.email,
                    password: mdp
                });
                user.save()
                    .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                    .catch(error => res.status(400).json({ error }));
            }
            else {
                res.status(403).json({ message: "L'email saisie n'est pas conforme" })
            }
        })
        .catch(error => res.status(500).json({ error }));
};

/**
 * Permet de se connecter
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.login = (req, res, next) => {
    utilisateur.findOne({ email: req.body.email })
        .then((utilisateur) => {
            if (!utilisateur) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
            }
            bcrypt.compare(req.body.password, utilisateur.password)
                .then((valid) => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    res.status(200).json({
                        userId: utilisateur._id,
                        token: jwt.sign(
                            { userId: utilisateur._id },
                            process.env.SECRET_KEY,
                            { expiresIn: '1h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

/**
 * Permet de verifier l'adresse mail via les Regex
 * @param {*} email 
 * @returns 
 */
function regexEmail(email) {

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    const resultatEmail = emailRegex.test(email)

    return resultatEmail
}


