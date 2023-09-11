const sauce = require('../models/sauce')
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv").config({ encoding: "latin1" });
const fs = require('fs')

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

exports.saveSauce = (req, res, next) => {

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
                message: 'Post saved successfully!'
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

exports.majSauce = async (req, res, next) => {

    const requete = JSON.parse(JSON.stringify(req.body));
    const regex = /http:\/\/localhost:3000(.*)/

    if (requete.hasOwnProperty('sauce') === true) {
        req.body.sauce = JSON.parse(req.body.sauce)

        const unesauce = await sauce.findOne({
            _id: req.params.id
        }).then(
            (sauce) => {
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
                console.log("\nDeleted file: example_file.txt");
            }
        }));

        // permet la modification via l'img
        sauce.updateOne({ _id: req.params.id }, {
            ...req.body.sauce, imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename
                }`, _id: req.params.id
        })
            .then(() => res.status(200).json({ message: 'Objet modifié !' }))
            .catch(error => res.status(400).json({ error })
            );
    }
    else {

        //permet la modification sans toucher a l'img
        sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet modifié !' }))
            .catch(error => res.status(400).json({ error })
            );

    }

};


exports.suppSauce = async (req, res, next) => {

    // Permet de recuperer l'userId
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.userId;

    // Permet de supp une sauce de la BDD + site
    const uneSauce = await sauce.findOne({
        _id: req.params.id
    });

    if (uneSauce.userId === userId) {
        sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
            .catch(error => res.status(400).json({ error }));
    }
    else {
        res.status(401).json({ message: 'Not authorized' });
    }

    // Permet de supprimer l'img dans le fichier img

    const regex = /http:\/\/localhost:3000(.*)/
    const oldImg = regex.exec(uneSauce.imageUrl)

    fs.unlink(`.${oldImg[1]}`, (err => {
        if (err) console.log(err);
        else {
            console.log("Image supprimée");
        }
    }));

};






// export.like =


//module.exports = router;