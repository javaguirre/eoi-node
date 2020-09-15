const express = require("express");
const router = express.Router();

router.get('/', (request, response) => {
    response.send('{"Hola": "mundo"}');
});

// POST CRUD API
const POST_ENDPOINT = '/api/v1/posts';

router.use((request, response, next) => {
    console.log(`Router Time: ${Date.now()}`)
    next();
});

router.post(POST_ENDPOINT, (request, response) => {
    response.send('POST');
});

router.get(POST_ENDPOINT, (request, response) => {
    response.send('GET');
});

router.get(`${POST_ENDPOINT}/:id`, (request, response) => {
    response.send('GET');
});

router.put(`${POST_ENDPOINT}/:id`, (request, response) => {
    response.send('PUT');
});

router.delete(`${POST_ENDPOINT}/:id`, (request, response) => {
    response.send(`DELETE ${request.params.id}`);
});

module.exports = router;
