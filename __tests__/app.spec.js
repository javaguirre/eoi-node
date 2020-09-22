const request = require('supertest');

const app = require("../app");

// TODO Init Mongodb test DB

describe(
    'Testing Jest',
    () => {
        it('Sums correctly', async () => {
            expect(1 + 1).toEqual(2);
        })

        it('Should go to Login', async () => {
            const response = await request(app)
                .get('/login');

            expect(response.statusCode).toEqual(200);
        });

        it('Test Api Login', async () => {
            const response = await request(app)
                .post('/api_login')
                .send({
                    'email': 'miemail@example.com',
                    'password': 'mipassword'
                })
            ;

            expect(response.statusCode).toEqual(200);
            expect(response.body).toHaveProperty('token');
        });
    }
)
