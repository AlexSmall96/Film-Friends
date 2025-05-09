/* 
The code in this file is based on material from the below Udemy course
https://www.udemy.com/course/the-complete-nodejs-developer-course-2
*/

const request = require('supertest')
const app = require('../setupApp')
const Film = require('../models/film')
import { beforeEach, afterAll, describe, test, expect } from 'vitest'

// Import test data and functions from setupRouterTests.js
const {
    wipeDBAndSaveData,
    closeConnection,
    userOne,
    userOneAuth,
    userTwoAuth,
    filmOneA
} = require('./test-utils/setupRouterTests')

// Wipe database before each test and setup test data
beforeEach(wipeDBAndSaveData)

// Close database connection after tests have run
afterAll(closeConnection)

// Create a film
describe('CREATE A FILM', () => {
    test('Should create a new film', async () => {
        // Correct status code
        const response = await request(app).post('/data/films')
        .send({
            Title: 'A great film', 
            Year: '1996',
            Type: 'movie',
            imdbID: 'a123', owner: userOne._id})
        .set(...userOneAuth)
        .expect(201)
        // Assert that the database was changed correctly
        const film = Film.findById(response.body.id)
        expect(film).not.toBeNull()
        // Assertions about the response
        expect(response.body.film.Title).toBe('A great film')
        expect(response.body.film.imdbID).toBe('a123')
        expect(response.body.film.Year).toBe('1996')
        expect(response.body.film.Type).toBe('movie')
        expect(response.body.film.public).toBe(false)
        expect(response.body.film.watched).toBe(false)
        expect(response.body.film.notes).toBe('')
    })
    test('Film creation should fail with invalid data', async () => {
        // Missing title
        await request(app).post('/data/films').send({imdbID: 'e123'}).set(...userOneAuth)
        .expect(400)
        // Invalid rating
        await request(app).post('/data/films').send({Title: 'film three', imdbID: 'h123', userRating: 6}).set(...userOneAuth)
        .expect(400)
    })
    test('Film creation should fail when not authenticated', async () => {
        // Correct status code
        const response = await request(app).post('/data/films').send({Title: 'A great film', imdbID: 'a123', owner: userOne._id})
        .expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

describe('VIEW A USERS FILM LIST', () => {
    test('Should load all films if user is owner of film list', async () => {
        // Default sort is last updated
        const response = await request(app).get(`/data/films/${userOne._id}`).set(...userOneAuth)
        // Should be 6 films
        expect(response.body.films).toHaveLength(6)
        // Love Actually should be first
        expect(response.body.films[0].Title).toBe('Love Actually')
        // Sort alphabetically
        const responseSorted = await request(app).get(`/data/films/${userOne._id}/?sort=A-Z`).set(...userOneAuth)
        // Film one a should be first
        expect(responseSorted.body.films[0].Title).toBe('Film one a')
    })
    test('Should load only public films if user is not owner of film list', async () => {
        const response = await request(app).get(`/data/films/${userOne._id}`).set(...userTwoAuth)
        // Should show 3 films
        expect(response.body.films).toHaveLength(3)
        expect(response.body.films[0].public).toBe(true)
        expect(response.body.films[0].Title).toBe('Love Actually')
        expect(response.body.films[1].Title).toBe('Star Wars')
        expect(response.body.films[2].Title).toBe('Film one a')
    })
    test('View films should fail with invalid id', async () => {
        await request(app).get('/data/films/invalidID').set(...userTwoAuth).expect(400)
    })
    test('View films should fail when not authenticated', async () => {
        const response = await request(app).get(`/data/films/${userOne._id}`).expect(401)
        expect(response.body.error).toBe('Please authenticate.')
    })
})

describe('GET ALL FILMS', () => {
    test('Should load all films up to provided limit in the correct order', async () => {
        const response = await request(app).get(`/data/films/?limit=${3}`)
        // Should be 3 films total
        const films = response.body
        expect(films).toHaveLength(3)
        // First film should be highest rated - 5
        const firstFilm = films[0]
        expect(firstFilm.Title).toBe('A film reccomended by user0')
        expect(firstFilm.userRating).toBe(5)
        // Second film should be most recently updated
        const secondFilm = films[1]
        expect(secondFilm.Title).toBe('Star Wars')
        // Third film should be second most recently updated
        const thirdFilm = films[2]
        expect(thirdFilm.Title).toBe('A film reccomended by user9')
    })
})

// Update film
describe('UPDATE A FILM', () => {
    test('Should update film with valid data', async () => {
        // Correct status code
        await request(app).patch(`/data/films/${filmOneA._id}`).set(...userOneAuth).send({
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
        await request(app).patch(`/data/films/${filmOneA._id}`).send({'watched': true}).set(...userTwoAuth).expect(404)
    })
    test('Film update should fail with invalid data or invalid id', async () => {
        // Invalid id
        await request(app).patch('/data/films/123').send({'watched': true}).set(...userOneAuth).expect(400)
        // Custom error message for Invalid rating
        const response = await request(app).patch(`/data/films/${filmOneA._id}`).set(...userOneAuth)
        .send({'userRating': -1}).expect(400)
        expect(response.body.errors.userRating.message).toBe('Rating must be between 0 and 5.')
    })
    test('Update film should fail when not authenticated', async () => {
        // Correct status code
        const response = await request(app).patch(`/data/films/${filmOneA._id}`)
        .send({title: 'A great film'})
        .expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

// Delete film
describe('DELETE A FILM', () => {
    test('Should delete film with valid id', async () => {
        // Correct status code
        await request(app).delete(`/data/films/${filmOneA._id}`).set(...userOneAuth).expect(200)
        // Assert the database was changed correctly
        const film = await Film.findById(filmOneA._id)
        expect(film).toBeNull()
    })
    test('Film deletion should fail with invalid data', async () => {
        // Correct status code
        await request(app).delete('/data/films/123').set(...userOneAuth).expect(400)
    })
    test('Delete film should fail if user is not owner of film', async () => {
        // Correct status code
        await request(app).delete(`/data/films/${filmOneA._id}`).set(...userTwoAuth).expect(404)
    })
    test('Film deletion should fail when not authenticated', async () => {
        // Correct status code
        const response = await request(app).delete(`/data/films/${filmOneA._id}`)
        .expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

