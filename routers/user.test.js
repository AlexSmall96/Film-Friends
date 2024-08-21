const request = require('supertest')
const app = require('../setupApp')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Film = require('../models/film')
const JWT_SECRET = process.env.JWT_SECRET

// Define test data
const userOneId = new mongoose.Types.ObjectId()
const userTwoId = new mongoose.Types.ObjectId()
const userSearchAId = new mongoose.Types.ObjectId()
const userSearchBId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId, 
    username: 'Mike', 
    email: 'mike@example.com', 
    password: '56what!!',
    tokens: [{
        token: jwt.sign({_id: userOneId}, JWT_SECRET)
    }]
}
const userTwo = {
    _id: userTwoId,
    username: 'Steve',
    email: 'steve@example.com',
    password: '123green@',
    tokens: [{
        token: jwt.sign({_id: userTwoId}, JWT_SECRET)
    }]
}
const userOneAuth = ['Authorization', `Bearer ${userOne.tokens[0].token}`]
const userTwoAuth = ['Authorization', `Bearer ${userTwo.tokens[0].token}`]
const userSearchA = { _id: userSearchAId, username: 'Jane', email: 'jane@example.com', password: '34red>?'}
const userSearchB = { _id: userSearchBId, username: 'Jane44', email: 'jane44@another.com', password: '34green>?'}
const filmOneA = {title: 'film one a', imdbID: 't345', owner: userOneId, public: true}
const filmOneB = {title: 'film one b', imdbID: 's345', owner: userOneId, public: false}

// Wipe database before each test and setup test data
beforeEach(async () => {
    await User.deleteMany()
    await Film.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new User(userSearchA).save()
    await new User(userSearchB).save()
    await new Film(filmOneA).save()
    await new Film(filmOneB).save()
})

// Close database connection after tests have run
afterAll(() => mongoose.connection.close())

// Sign up Tests
test('Should sign up a new user', async () => {
    // Correct status code
    const response = await request(app).post('/users').send({username: 'Alex', email: 'alex@example.com', password: 'Red123@!'}).expect(201)
    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    // Assert the password was hashed correctly
    expect(user.password).not.toBe('Red123@!')
    // Assertions about the response
    expect(response.body).toMatchObject({user: {
            username: 'Alex',
            email: 'alex@example.com',
        }
    })
    // Assert that the age is defaulted to 0
    expect(user.age).toBe(0)
})

test('User sign up should fail with invalid data', async () => {
    // Username taken
    await request(app).post('/users').send({username: 'Jane'}).expect(400)
    // Email taken
    await request(app).post('/users').send({email: 'jane@example.com'}).expect(400)
    // Custom error messages
    const response = await request(app).post('/users').send({age: -1, email: 'mike@', password: 'password'}).expect(400)
    const errors = response.body.errors
    // Invalid age
    expect(errors.age.message).toBe('Age must be a positive number.')
    // Invalid email
    expect(errors.email.message).toBe('Email is invalid')
    // Invalid password
    expect(errors.password.message).toBe('Password cannot contain "password"')
})
// Login tests
test('Should be able to login with valid credentials', async () => {
    // Correct status code
    const response = await request(app).post('/users/login')
    .send({email: userOne.email, password: userOne.password})
    .expect(200)
    // Correct token is created
    expect(response.body.user.tokens.length).toBe(2)
    expect(response.body.token).toBe(response.body.user.tokens[1].token)
})

test('Login should fail with invalid credentials', async () => {
    // Correct status code
    await request(app).post('/users/login')
    .send({email: userOne.email, password: 'wrongpassword'})
    .expect(400)
})

// Logout tests
test('Logout should be successful when authenticated', async () => {
    // Correct status code
    const response = await request(app).post('/users/logout').set(...userOneAuth).expect(200)
    // Token has been removed from tokens array
    expect(userOne.tokens.length).toBe(1)
})

// View profile tests
test('User should be able to view their own profile and all films', async () => {
    // userOne views their own profile
    // Correct status code
    const response = await request(app).get(`/users/${userOneId}`).set(...userOneAuth).expect(200)
    // Correct data is returned
    expect(response.body.profile.username).toBe('Mike')
    expect(response.body.profile.email).toBe('mike@example.com')
    expect(response.body.films.length).toBe(2)
    expect(response.body.films[0].title).toBe('film one a')
    expect(response.body.films[1].title).toBe('film one b')
})

test('User should be able to view another users username, age and public films', async () => {
    // userTwo views userOne's profile
    // Correct status code
    const response = await request(app).get(`/users/${userOneId}`).set(...userTwoAuth).expect(200)
    // Correct data is returned
    expect(response.body.profile.username).toBe('Mike')
    expect(response.body.profile.age).toBe(0)
    expect(response.body.films.length).toBe(1)
    expect(response.body.films[0].title).toBe('film one a')
    // Private data is not returned
    expect(Object.keys(response.body.profile).includes('email')).toBe(false)
    expect(Object.keys(response.body.profile).includes('password')).toBe(false)
})

test('Get profile should fail with invalid id', async () => {
    // Correct status code
    await request(app).get('/users/123').set(...userOneAuth).expect(400)
})

// Search for profiles
test('Should be able to search for user by username', async () => {
    // Search 1: Search for ' JAne' - should return Jane and Jane44 with status code 200
    const resultsForJane = await request(app).get('/users/?username= JAne').set(...userOneAuth).expect(200)
    expect(resultsForJane.body.users.length).toBe(2)
    // Search 2: Search for 'Jane44 ' - should only return Jane44 with status code 200
    const resultsForJane44 = await request(app).get('/users/?username=Jane44 ').set(...userOneAuth).expect(200)
    expect(resultsForJane44.body.users.length).toBe(1)
    expect(resultsForJane44.body.users[0].email).toBe('jane44@another.com')
    // Search 3: Search for abc - should return no results with status code 200
    const resultsForAbc = await request(app).get('/users/?username=abc').set(...userOneAuth).expect(200)
    expect(resultsForAbc.body.users.length).toBe(0)
})

// Edit profile
test('Should be able to edit valid fields with valid data', async () => {
    // Correct status code
    await request(app).patch(`/users/${userOneId}`).send({
        username: 'Mike2',
        email: 'mike2@example.com',
        age: 28,
        password: 'new12345'
    }).set(...userOneAuth).expect(200)
    // Assert that the database was changed correctly
    const user = await User.findById(userOneId)
    expect(user.username).toBe('Mike2')
    expect(user.email).toBe('mike2@example.com')
    expect(user.age).toBe(28)
})

test('Profile edit should fail with invalid data or invalid id', async () => {
    // Invalid id
    await request(app).patch('/users/123').send({username: 'Mike3'}).set(...userOneAuth).expect(400)
    // Username taken
    await request(app).patch(`/users/${userOneId}`).send({username: 'Jane'}).set(...userOneAuth).expect(400)
    // Email taken
    await request(app).patch(`/users/${userOneId}`).send({email: 'jane@example.com'}).set(...userOneAuth).expect(400)
    // Custom error messages
    const response = await request(app).patch(`/users/${userOneId}`).send({age: -1, email: 'mike@', password: 'password'}).set(...userOneAuth).expect(400)
    const errors = response.body.errors
    // Invalid age
    expect(errors.age.message).toBe('Age must be a positive number.')
    // Invalid email
    expect(errors.email.message).toBe('Email is invalid')
    // Invalid password
    expect(errors.password.message).toBe('Password cannot contain "password"')
})

// Delete profile
test('Should delete profile with valid id', async () => {
    // Correct status code
    await request(app).delete(`/users/${userOneId}`).set(...userOneAuth).expect(200)
    // Assert the database was changed correctly
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('User deletion should fail with invalid data', async () => {
    // Correct status code
    await request(app).delete('/users/123').set(...userOneAuth).expect(400)
})