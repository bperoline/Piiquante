/* Import des modules necessaires */
const sauce = require('../models/sauce')
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv").config({ encoding: "latin1" });
const fs = require('fs')

/**
 * Action permettant de recuperer toutes les sauces dans la BDD
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.default = (req, res, next) => {
    sauce.find().then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

/**
 * Action permettant de recuperer une sauce selon son id
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.sauceById = (req, res, next) => {
    sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

/**
 * Action permettant de sauvegarder une sauce 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.saveSauce = (req, res, next) => {

    // Recuperer les informations des sauces dans la BDD + initialiser certaines valeurs
    const sauceObject = JSON.parse(req.body.sauce);
    const ttSauce = new sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename
            }`,
        // Initialisation valeur like-dislike 0
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],

    });

    ttSauce.save().then(
        () => {
            res.status(201).json({
                message: 'Sauce sauvegardée'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

/**
 * Action permettant la mise à jour d'une sauce en verifiant le user id
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.majSauce = async (req, res, next) => {

    // Permet de recuperer l'userId
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.userId;

    const uneSauce = await sauce.findOne({
        _id: req.params.id
    });

    const requete = JSON.parse(JSON.stringify(req.body));
    const regex = /http:\/\/localhost:3000(.*)/

    // Verifie que l'utilisateur connecté est bien le créateur de la sauce
    if (uneSauce.userId === userId) {
        // si la requete a comme propriété sauce:
        if (requete.hasOwnProperty('sauce') === true) {
            req.body.sauce = JSON.parse(req.body.sauce)

            const unesauce = await sauce.findOne({
                _id: req.params.id
            }).then(
                (sauce) => {
                    // permet d'enlever le localost de l'URL de l'img selon le regex, et de retourner l'img actuel
                    const oldImg = regex.exec(sauce.imageUrl)
                    return oldImg[1];
                }
            ).catch(
                (error) => {
                    res.status(404).json({
                        error: error
                    });
                }
            );

            // permet la suppression de l'img
            fs.unlink(`.${unesauce}`, (err => {
                if (err) console.log(err);
                else {
                    console.log("Suppression de l'image");
                }
            }));

            // permet la modification via l'img
            sauce.updateOne({ _id: req.params.id }, {
                ...req.body.sauce, imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename
                    }`, _id: req.params.id
            })
                .then(() => res.status(200).json({ message: 'Sauce modifiée' }))
                .catch(error => res.status(400).json({ error })
                );
        }
        else {

            //permet la modification sans toucher a l'img
            sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Sauce modifiée' }))
                .catch(error => res.status(400).json({ error })
                );

        }

    };
}

/**
 * Action permettant la suppression d'une sauce
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.suppSauce = async (req, res, next) => {

    // Permet de recuperer l'userId
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.userId;

    const uneSauce = await sauce.findOne({
        _id: req.params.id
    });

    // Permet de supp une sauce s'il s'agit du créateur de la sauce
    if (uneSauce.userId === userId) {
        sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
            .catch(error => res.status(400).json({ error }));
    }
    else {
        res.status(401).json({ message: 'Non autorisé' });
    }

    const regex = /http:\/\/localhost:3000(.*)/
    const oldImg = regex.exec(uneSauce.imageUrl)

    // Permet de supprimer l'img dans le dossier img
    fs.unlink(`.${oldImg[1]}`, (err => {
        if (err) console.log(err);
        else {
            console.log("Image supprimée");
        }
    }));

};

/**
 * Action permettant de like et dislike une sauce
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.like = async (req, res, next) => {

    const laSauce = await sauce.findOne({
        _id: req.params.id
    })

    // Permet d'ajouter un +1 ou enlever le +1 en like et de sauvegarder
    // Permet d'ajouter un +1 ou enlever le +1 en dislike et de sauvegarder
    // Permet d'ajouter les userliked et userdisliked a la BDD
    switch (req.body.like) {
        case 1:
            if (!laSauce.usersLiked.includes(req.body.userId)) {
                laSauce.likes++
                laSauce.usersLiked.push(req.body.userId)
                laSauce.save();
                res.status(200).json({ message: 'Like' });
            }
            break;
        case 0:
            if (laSauce.usersLiked.includes(req.body.userId)) {
                laSauce.likes--
                laSauce.usersLiked.splice(req.body.userId)
                laSauce.save();
                res.status(200).json({ message: '-1 like' })
            }

            if (laSauce.usersDisliked.includes(req.body.userId)) {
                laSauce.dislikes--
                laSauce.usersDisliked.splice(req.body.userId)
                laSauce.save();
                res.status(200).json({ message: '-1 Dislike' })
            }

            break;
        case -1:
            if (!laSauce.usersDisliked.includes(req.body.userId)) {
                laSauce.dislikes++
                laSauce.usersDisliked.push(req.body.userId)
                laSauce.save();
                res.status(200).json({ message: 'Dislike' })
            }
            break;

        default:
            res.status(401).json({ message: 'Non autorisé' });
    }
}