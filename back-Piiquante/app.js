const express = require('express')
const app = express()
const mongoose = require('mongoose');
const path = require("path");
const utilisateurRoutes = require('./routes/utilisateur');
const sauceRoutes = require('./routes/sauce')

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json());

app.use(express.urlencoded({ extended: true }))


const helmet = require("helmet");
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

const rateLimit = require("express-rate-limit");

app.use(
    rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 100,
        message:
            "Vous avez effectué plus de 100 requêtes dans une limite de 10 minutes!",
        headers: true,
    })
);

app.use('/api/auth', utilisateurRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

app.use('/api/sauces', sauceRoutes);

module.exports = app;