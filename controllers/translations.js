const Translations = require('../sqlmodels/translationsModel');
const express = require('express');
const router = express.Router();
const fs = require('fs');

router.get('/All', async(req, res) => {
    try {
        const trans = await Translations.findAll();
        res.json(trans);
    } catch (error) {
        res.json({message: error.message})
    }
} )



module.exports = router;