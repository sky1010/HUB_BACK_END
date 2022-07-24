const express = require('express');
const router = express.Router();

//controllers 
const { createClient } = require("../../controllers/clients")

router.post('/createClient', createClient);


module.exports = router;