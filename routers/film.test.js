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

test('Should view data for a single film', async () => {
    // Correct status code
    const response = await request(app).get(`/films/${filmTwo._id}`).expect(200)
    // Correct data is recieved
    expect(response.body.film.title).toBe('film two')
    expect(response.body.film.imdbID).toBe('g123')
})