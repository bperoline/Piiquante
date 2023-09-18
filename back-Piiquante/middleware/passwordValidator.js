/* Import des modules necessaires */
let passwordValidator = require('password-validator');

// Permet la création d'un schema
let schema = new passwordValidator();

// Permet d'ajouter ces proprietées
schema
    // Minimum 8 caractères
    .is().min(8)
    // Maximum 100 caractères                                   
    .is().max(100)
    // Majuscule                                
    .has().uppercase()
    // Minuscule                             
    .has().lowercase()
    // 2 chiffres                            
    .has().digits(2)
    // Pas d'espace                               
    .has().not().spaces()
    // Refus de ces mdp                         
    .is().not().oneOf(['Passw0rd', 'Password123']);

// Permet d'exporter le schema de validiter du mdp
module.exports = (req, res, next) => {
    if (schema.validate(req.body.password)) {
        next();
    } else {
        return res.status(404).json({ error: `Le mot de passe n'est pas assez fort ${schema.validate('req.body.password', { list: true })}` })
    }
}