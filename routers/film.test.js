const request = require('supertest')
const app = require('../setupApp')
const Film = require('../models/film')

// Import test data and functions from setupRouterTests.js
const {
    wipeDBAndSaveData,
    closeConnection,
    userOne,
    userOneAuth,
    userTwoAuth,
    filmOneA
} = require('./testing/setupRouterTests')

// Wipe database before each test and setup test data
beforeEach(wipeDBAndSaveData)

// Close database connection after tests have run
afterAll(closeConnection)

// Tests //

// Create a film
describe('Create a film:', () => {
    test('Should create a new film', async () => {
        // Correct status code
        const response = await request(app).post('/films')
        .send({title: 'A great film', imdbID: 'a123', owner: userOne._id})
        .set(...userOneAuth)
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
        await request(app).post('/films').send({title: 'film three', imdbID: 't345'}).set(...userOneAuth)
        .expect(400)
        // Missing title
        await request(app).post('/films').send({imdbID: 'e123'}).set(...userOneAuth)
        .expect(400)
        // Invalid rating
        await request(app).post('/films').send({title: 'film three', imdbID: 'h123', userRating: 6}).set(...userOneAuth)
        .expect(400)
    })
    test('Film creation should fail when not authenticated', async () => {
        // Correct status code
        const response = await request(app).post('/films').send({title: 'A great film', imdbID: 'a123', owner: userOne._id})
        .expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})


// View film
describe('Create a film:', () => {
    test('Should view data for a single film', async () => {
        // Correct status code
        const response = await request(app).get(`/films/${filmOneA._id}`).set(...userOneAuth).expect(200)
        // Correct data is recieved
        expect(response.body.title).toBe('film one a')
        expect(response.body.imdbID).toBe('t345')
    })
    test('Get film should fail with invalid id', async () => {
        // Correct status code
        await request(app).get('/films/123').set(...userOneAuth).expect(500)
    })
    test('Get film should fail when not authenticated', async () => {
        // Correct status code
        const response = await request(app).get(`/films/${filmOneA._id}`)
        .expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})


// Update film
describe('Update a film', () => {
    test('Should update film with valid data', async () => {
        // Correct status code
        await request(app).patch(`/films/${filmOneA._id}`).set(...userOneAuth).send({
            "watched": true,
            "public": true,
            "userRating": 4.5,
            "notes": "a great film, would reccomend"
        }).expect(200)
        // Assert that the database was changed correctly
        const film = await Film.findById(filmOneA._id)
        expect(film.watched).toBe(true)
        expect(film.public).toBe(true)
        expect(film.userRating).toBe(4.5)
        expect(film.notes).toBe("a great film, would reccomend")
    })
    test('Update film should fail if user is not owner of film', async () => {
        // Correct status code
        await request(app).patch(`/films/${filmOneA._id}`).send({'watched': true}).set(...userTwoAuth).expect(404)
    })
    test('Film update should fail with invalid data or invalid id', async () => {
        // Invalid id
        await request(app).patch('/films/123').send({'watched': true}).set(...userOneAuth).expect(400)
        // Custom error message for Invalid rating
        const response = await request(app).patch(`/films/${filmOneA._id}`).set(...userOneAuth)
        .send({'userRating': -1}).expect(400)
        expect(response.body.errors.userRating.message).toBe('Rating must be between 0 and 5.')
    })
    test('Update film should fail when not authenticated', async () => {
        // Correct status code
        const response = await request(app).patch(`/films/${filmOneA._id}`)
        .send({title: 'A great film'})
        .expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

// Delete film
describe('Delete a film', () => {
    test('Should delete film with valid id', async () => {
        // Correct status code
        await request(app).delete(`/films/${filmOneA._id}`).set(...userOneAuth).expect(200)
        // Assert the database was changed correctly
        const film = await Film.findById(filmOneA._id)
        expect(film).toBeNull()
    })
    test('Film deletion should fail with invalid data', async () => {
        // Correct status code
        await request(app).delete('/films/123').set(...userOneAuth).expect(400)
    })
    test('Delete film should fail if user is not owner of film', async () => {
        // Correct status code
        await request(app).delete(`/films/${filmOneA._id}`).set(...userTwoAuth).expect(404)
    })
    test('Film deletion should fail when not authenticated', async () => {
        // Correct status code
        const response = await request(app).delete(`/films/${filmOneA._id}`)
        .expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

