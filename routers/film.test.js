const request = require('supertest')
const app = require('../setupApp')
const mongoose = require('mongoose')
const User = require('../models/user')
const Film = require('../models/film')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

// Define test data
const userThreeId = new mongoose.Types.ObjectId()
const filmThreeId = new mongoose.Types.ObjectId()
const userThree = {
    _id: userThreeId, 
    username: 'Jon', 
    email: 'jon@example.com', 
    password: '56what!!',
    tokens: [{
        token: jwt.sign({_id: userThreeId}, JWT_SECRET)
    }]
}
const userThreeAuth = ['Authorization', `Bearer ${userThree.tokens[0].token}`]
const filmThree = {_id: filmThreeId, title: 'film two', imdbID: 'g123', owner: userThreeId}

// Wipe database before each test and setup test data
beforeEach(async () => {
    await User.deleteMany()
    await Film.deleteMany()
    await new User(userThree).save()
    await new Film(filmThree).save()
})

// Close database connection after tests have run
afterAll(async () => {mongoose.connection.close()})

// Create a film
test('Should create a new film', async () => {
    // Correct status code
    const response = await request(app).post('/films')
    .send({title: 'A great film', imdbID: 'a123', owner: userThreeId})
    .set(...userThreeAuth)
    .expect(201)
    // Assert that the database was changed correctly
    const film = Film.findById(response.body.id)
    expect(film).not.toBeNull()
    // Assertions about the response
    expect(response.body.film.title).toBe('A great film')
    expect(response.body.film.imdbID).toBe('a123')
    expect(response.body.film.public).toBe(false)
    expect(response.body.film.watched).toBe(false)
    expect(response.body.film.notes).toBe('')
})
test('Film creation should fail with invalid data', async () => {
    // imdbID already taken
    await request(app).post('/films').send({title: 'film three', imdbID: 'g123', owner: userThreeId}).set(...userThreeAuth)
    .expect(400)
    // Missing title
    await request(app).post('/films').send({imdbID: 'e123', owner: userThreeId}).set(...userThreeAuth)
    .expect(400)
    // Missing owner
    await request(app).post('/films').send({title: 'film three', imdbID: 'f123'}).set(...userThreeAuth)
    .expect(400)
    // Invalid rating
    await request(app).post('/films').send({title: 'film three', imdbID: 'h123', owner: userThreeId, userRating: 6}).set(...userThreeAuth)
    .expect(400)
})
test('Film creation should fail when not authenticated', async () => {
    // Correct status code
    const response = await request(app).post('/films').send({title: 'A great film', imdbID: 'a123', owner: userThreeId})
    .expect(401)
    // Correct error message
    expect(response.body.error).toBe('Please authenticate.')
})

// View film
test('Should view data for a single film', async () => {
    // Correct status code
    const response = await request(app).get(`/films/${filmThree._id}`).set(...userThreeAuth).expect(200)
    // Correct data is recieved
    expect(response.body.title).toBe('film two')
    expect(response.body.imdbID).toBe('g123')
})
test('Get film should fail with invalid id', async () => {
    // Correct status code
    await request(app).get('/films/123').set(...userThreeAuth).expect(500)
})
test('Get film should fail when not authenticated', async () => {
    // Correct status code
    const response = await request(app).get(`/films/${filmThree._id}`)
    .expect(401)
    // Correct error message
    expect(response.body.error).toBe('Please authenticate.')
})

// Update film
test('Should update film with valid data', async () => {
    // Correct status code
    await request(app).patch(`/films/${filmThree._id}`).set(...userThreeAuth).send({
        "watched": true,
        "public": true,
        "userRating": 4.5,
        "notes": "a great film, would reccomend"
    }).expect(200)
    // Assert that the database was changed correctly
    const film = await Film.findById(filmThree._id)
    expect(film.watched).toBe(true)
    expect(film.public).toBe(true)
    expect(film.userRating).toBe(4.5)
    expect(film.notes).toBe("a great film, would reccomend")
})
test('Film update should fail with invalid data or invalid id', async () => {
    // Invalid id
    await request(app).patch('/films/123').send({'watched': true}).set(...userThreeAuth).expect(400)
    // Custom error message for Invalid rating
    const response = await request(app).patch(`/films/${filmThree._id}`).set(...userThreeAuth)
    .send({'userRating': -1}).expect(400)
    expect(response.body.errors.userRating.message).toBe('Rating must be between 0 and 5.')
})
test('Update film should fail when not authenticated', async () => {
    // Correct status code
    const response = await request(app).patch(`/films/${filmThree._id}`)
    .send({title: 'A great film'})
    .expect(401)
    // Correct error message
    expect(response.body.error).toBe('Please authenticate.')
})

// Delete film
test('Should delete film with valid id', async () => {
    // Correct status code
    await request(app).delete(`/films/${filmThreeId}`).set(...userThreeAuth).expect(200)
    // Assert the database was changed correctly
    const film = await Film.findById(filmThreeId)
    expect(film).toBeNull()
})
test('Film deletion should fail with invalid data', async () => {
    // Correct status code
    await request(app).delete('/films/123').set(...userThreeAuth).expect(400)
})
test('Film deletion should fail when not authenticated', async () => {
    // Correct status code
    const response = await request(app).delete(`/films/${filmThreeId}`)
    .expect(401)
    // Correct error message
    expect(response.body.error).toBe('Please authenticate.')
})
