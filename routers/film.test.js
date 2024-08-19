const request = require('supertest')
const app = require('../setupApp')
const mongoose = require('mongoose')
const User = require('../models/user')
const Film = require('../models/film')

// Define test data
const userTwoId = new mongoose.Types.ObjectId()
const filmTwoId = new mongoose.Types.ObjectId()
const userTwo = {_id: userTwoId, username: 'Jon', email: 'jon@example.com', password: '56what!!'}
const filmTwo = {_id: filmTwoId, title: 'film two', imdbID: 'g123', owner: userTwoId}

// Wipe database before each test and setup test data
beforeEach(async () => {
    await User.deleteMany()
    await Film.deleteMany()
    await new User(userTwo).save()
    await new Film(filmTwo).save()
})

// Close database connection after tests have run
afterAll(async () => {mongoose.connection.close()})

// Create a film
test('Should create a new film', async () => {
    // Correct status code
    const response = await request(app).post('/films').send({title: 'A great film', imdbID: 'a123', owner: userTwoId}).expect(201)
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
    await request(app).post('/films').send({title: 'film three', imdbID: 'g123', owner: userTwoId}).expect(400)
    // Missing title
    await request(app).post('/films').send({imdbID: 'e123', owner: userTwoId}).expect(400)
    // Missing owner
    await request(app).post('/films').send({title: 'film three', imdbID: 'f123'}).expect(400)
    // Invalid rating
    await request(app).post('/films').send({title: 'film three', imdbID: 'h123', owner: userTwoId, userRating: 6}).expect(400)
})

// View film
test('Should view data for a single film', async () => {
    // Correct status code
    const response = await request(app).get(`/films/${filmTwo._id}`).expect(200)
    // Correct data is recieved
    expect(response.body.film.title).toBe('film two')
    expect(response.body.film.imdbID).toBe('g123')
})

test('Get film should fail with invalid id', async () => {
    // Correct status code
    await request(app).get('/films/123').expect(400)
})

// Update film
test('Should update film with valid data', async () => {
    // Correct status code
    await request(app).patch(`/films/${filmTwo._id}`).send({
        "watched": true,
        "public": true,
        "userRating": 4.5,
        "notes": "a great film, would reccomend"
    }).expect(200)
    // Assert that the database was changed correctly
    const film = await Film.findById(filmTwo._id)
    expect(film.watched).toBe(true)
    expect(film.public).toBe(true)
    expect(film.userRating).toBe(4.5)
    expect(film.notes).toBe("a great film, would reccomend")
})

test('Film update should fail with invalid data or invalid id', async () => {
    // Invalid id
    await request(app).patch('/films/123').send({'watched': true}).expect(400)
    // Custom error message for Invalid rating
    const response = await request(app).patch(`/films/${filmTwo._id}`).send({'userRating': -1}).expect(400)
    expect(response.body.errors.userRating.message).toBe('Rating must be between 0 and 5.')
})

// Delete film
test('Should delete film with valid id', async () => {
    // Correct status code
    await request(app).delete(`/films/${filmTwoId}`).expect(200)
    // Assert the database was changed correctly
    const film = await Film.findById(filmTwoId)
    expect(film).toBeNull()
})

test('Film deletion should fail with invalid data', async () => {
    // Correct status code
    await request(app).delete('/films/123').expect(400)
})
