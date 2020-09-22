const express = require("express");

const router = express.Router();

// Rutas
router.get('/', (request, response) => {
    response.render('chat');
});


module.exports = router;
