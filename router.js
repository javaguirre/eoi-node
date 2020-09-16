const express = require("express");
const router = express.Router();

router.get('/', (request, response) => {
    const mysession = request.session;

    if (mysession.email) {
        return response.redirect('/admin');
    }

    response.render('index');
});

router.get('/admin', (request, response) => {
    const session = request.session;

    if (session.email) {
        response.render('admin', { email: session.email })
    } else {
        return response.redirect('/login');
    }
});

router.get('/login', (request, response) => {
    const session = request.session;

    if (session.email) {
        return response.redirect('/admin');
    }

    response.render('login');
});

router.post('/login', (request, response) => {
    request.session.email = request.body.email;
    return response.redirect('/admin');
});

router.get('/logout', (request, response) => {
    request.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        response.redirect('/');
    })
});

// POST CRUD API
const POST_ENDPOINT = '/api/v1/posts';

router.use((request, response, next) => {
    console.log(`Router Time: ${Date.now()}`)
    next();
});

router.post(POST_ENDPOINT, (request, response) => {
    const post = request.body;
    // TODO Save it somewhere
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
