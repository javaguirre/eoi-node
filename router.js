const express = require("express");

const Post = require('./models/post');
const User = require('./models/user');

const AuthenticationService = require('./auth');

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
        return response.render('admin', { email: session.email })
    }

    return response.redirect('/login');
});

router.get('/login', (request, response) => {
    const session = request.session;

    if (session.email) {
        return response.redirect('/admin');
    }

    response.render('login');
});

router.post('/login', (request, response) => {
    const isAuthenticated = AuthenticationService.authenticate(
        request.body);

    if (!isAuthenticated) {
        return response.render(
            'login', {error: 'Authentication failed'})
    }

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
    const postObj = new Post(request.body);
    postObj.save((err) => err ? console.log(err) : null);
    response.send(JSON.stringify(postObj));
});

router.get(POST_ENDPOINT, (request, response) => {
    Post.find({
    }).then(data => {
         console.log(data);
         return response.send(data);
    }).catch(err => {
        console.log(err);
        response.status(400);
        return response.send({'error': 'Could\'t connect to Database'});
    });
});

router.get(`${POST_ENDPOINT}/:slug`, (request, response) => {
    Post.findOne({ slug: request.params.slug })
        .then(data => console.log(data))
        .catch(err => console.log(err));
    response.send('GET');
});

router.put(`${POST_ENDPOINT}/:slug`, (request, response) => {
    Post.findOneAndUpdate({ slug: request.params.slug }, request.body).then(
        (data) => {
            response.send(data);
        }
    ).catch(err => {
        response.status(400);
        response.send({'error': err})
    })
});

router.delete(`${POST_ENDPOINT}/:slug`, (request, response) => {
    Post.findOneAndDelete({ slug: request.params.slug }).then(
        () => {
            response.status(204);
            response.end();
        }
    );
});

module.exports = router;
