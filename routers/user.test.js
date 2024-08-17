const request = require('supertest')
const app = require('../setupApp')
const mongoose = require('mongoose')
const User = require('../models/user')
const Film = require('../models/film')

// Wipe database before each test is run and setup initial user
const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    username: 'Mike',
    email: 'mike@example.com',
    password: '56what!!',
}
const filmOneA = {
    title: 'film one a',
    imdbID: 't345',
    owner: userOneId
}
const filmOneB = {
    title: 'film one b',
    imdbID: 's345',
    owner: userOneId
}

beforeEach(async () => {
    await User.deleteMany()
    await Film.deleteMany()
    await new User(userOne).save()
    await new Film(filmOneA).save()
    await new Film(filmOneB).save()
})

// Close database connection after tests have run
afterAll(() => mongoose.connection.close())

// Sign up Tests
test('Should sign up a new user', async () => {
    // Correct status code
    const response = await request(app).post('/users').send({username: 'Alex', email: 'alex@example.com', password: 'Red123@!'})
    .expect(201)
    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    // Assert the password was hashed correctly
    expect(user.password).not.toBe('Red123@!')
    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            username: 'Alex',
            email: 'alex@example.com',
        }
    })
    // Assert that the age is defaulted to 0
    expect(user.age).toBe(0)
})

test('User sign up should fail with invalid data', async () => {
    // Email address already used
    await request(app).post('/users').send({username: 'Alex',email: 'mike@example.com', password: 'Red123@!'})
    // Missing username
    await request(app).post('/users').send({email: 'alex@example.com', password: 'Red123@!'}).expect(400)
    // Invalid email
    await request(app).post('/users').send({username: 'Alex', email: 'alex@', password: 'Red123@!'}).expect(400)
    // Missing email
    await request(app).post('/users').send({username: 'Alex', password: 'Red123@!'}).expect(400)
    // Negative number provided for age
    await request(app).post('/users').send({username: 'Alex', email: 'alex@example.com', password: 'Red123@!', age: -1}).expect(400)
    // Invalid password
    await request(app).post('/users').send({username: 'Alex', email: 'alex@example.com', password: 'password',}).expect(400)
})

// View profile tests
test('Should be able to view users profile and film list', async () => {
    // Correct status code
    const response = await request(app).get(`/users/${userOneId}`).expect(200)
    // Correct data is returned
    expect(response.body.user.username).toBe('Mike')
    expect(response.body.user.email).toBe('mike@example.com')
    expect(response.body.films.length).toBe(2)
    expect(response.body.films[0].title).toBe('film one a')
    expect(response.body.films[1].title).toBe('film one b')
})