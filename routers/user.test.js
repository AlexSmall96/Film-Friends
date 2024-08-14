const request = require('supertest')
const app = require('../setupApp')
const mongoose = require('mongoose')

// Close database connection after tests have run
afterAll(() => mongoose.connection.close())

// Sign up
test('Should sign up a new user', async () => {
    await request(app)
    .post('/users')
    .send({
        username: 'Alex',
        email: 'alex@example.com',
        password: 'Red123@!'
    })
    .expect(201)
})

test('User sign up should fail with invalid data', async () => {
    // Missing username
    await request(app)
    .post('/users')
    .send({
        email: 'alex@example.com',
        password: 'Red123@!'
    })
    .expect(400)
    // Invalid email
    await request(app)
    .post('/users')
    .send({
        username: 'Alex',
        email: 'alex@',
        password: 'Red123@!'
    })
    .expect(400)
    // Missing email
    await request(app)
    .post('/users')
    .send({
        username: 'Alex',
        password: 'Red123@!'
    })
    .expect(400)
    // Negative number provided for age
    await request(app)
    .post('/users')
    .send({
        username: 'Alex',
        email: 'alex@example.com',
        password: 'Red123@!',
        age: -1
    })
    .expect(400)
    // Invalid password
    await request(app)
    .post('/users')
    .send({
        username: 'Alex',
        email: 'alex@example.com',
        password: 'password',
    })
    .expect(400)
})