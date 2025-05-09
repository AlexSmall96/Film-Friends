/* 
The code in this file is based on material from the below Udemy course
https://www.udemy.com/course/the-complete-nodejs-developer-course-2
*/

const request = require('supertest')
const app = require('../setupApp')
const Request = require('../models/request')
const Reccomendation = require('../models/reccomendation')
const Film = require('../models/film')
import { beforeEach, afterAll, describe, test, expect } from 'vitest'

// Import test data and functions from setupRouterTests.js
const {
    wipeDBAndSaveData,
    closeConnection,
    userThree,
    userOneAuth,
    userTwoAuth,
    requestOne,
    filmOneA,
    filmTwo,
    recOne
} = require('./test-utils/setupRouterTests')

// Wipe database before each test and setup test data
beforeEach(wipeDBAndSaveData)

// Close database connection after tests have run
afterAll(closeConnection)

// Tests //

// Create reccomendations
describe('SEND RECCOMENDATIONS', () => {
    test("User can't reccomend a film they don't own", async () => {
        // Correct status code
        const response = await request(app).post('/data/reccomendations')
            .set(...userTwoAuth)
            .send({film: filmOneA._id, reciever: userThree._id})
            .expect(400)
        // Correct error message
        expect(response.body.error).toBe("You can't reccomend a film you haven't saved.")
    })
    test("User can't send a reccomendation to a user that is not their friend", async () => {
        // Correct status code
        const response = await request(app).post('/data/reccomendations')
            .set(...userTwoAuth)
            .send({film: filmTwo._id, reciever: userThree._id})
            .expect(400)
        // Correct error message
        expect(response.body.error).toBe("You can't send a reccomendation to this user because you are not friends.")
    })
    test("User can't send reccomendation if the film is not public", async () => {
        // Update film public field to false
        await Film.findByIdAndUpdate(filmTwo._id, {public: false})
        // Correct status code
        const response = await request(app).post('/data/reccomendations')
            .set(...userTwoAuth)
            .send({film: filmTwo._id, reciever: userThree._id})
            .expect(400)
        // Correct error message
        expect(response.body.error).toBe("Please mark this film as public before you reccomend it to others.")
    })
    test('User can send reccomendation if they own the film and are friends with the reciever', async () => {
        // Update friend request to be accepted
        await Request.findByIdAndUpdate(requestOne._id, {accepted: true})
        // Correct status code
        const response = await request(app).post('/data/reccomendations')
            .set(...userTwoAuth)
            .send({film: filmTwo._id, reciever: userThree._id})
            .expect(201)
        // Assert that the database was changed correctly
        const reccomendation = await Reccomendation.findById(response.body.reccomendation._id)
        expect(reccomendation).not.toBeNull()
        expect(reccomendation.liked).toBe(false)
        expect(reccomendation.message).toBe("Hey! Check out this awesome film I've just watched. I think you'll love it!")
    })
    test('Reccomendation should fail with invalid data', async () => {
        // Correct status code
        await request(app).post('/data/reccomendations')
            .set(...userTwoAuth)
            .send({film: '123', reciever: '123'})
            .expect(400)
    })
    test('Reccomendation should fail when not authenticated', async () => {
        // Correct status code
        const response = await request(app).post('/data/reccomendations').send({film: filmTwo._id, reciever: userThree._id}).expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

// Get reccomendations
describe('GET USERS RECCOMENDATIONS', () => {
    test('Should be able to get all of users reccomendations', async () => {
        // Correct status code
        const response = await request(app).get('/data/reccomendations').set(...userOneAuth).expect(200)
        // Correct number of reccomendations
        expect(response.body.length).toBe(11)
        // Last updated should be first in list
        const lastFilm = await Film.findById(response.body[0].film) 
        expect(lastFilm.Title).toBe('A film reccomended by user9')
    })
    test('Get reccomendations fails if user is not authenticated', async () => {
        // Correct status code
        const response = await request(app).get('/data/reccomendations').expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

// Delete a reccomendation (comment or like)
describe('DELETE A RECCOMENDATION', () => {
    test('Should be able to delete a reccomendation if user is owner of associated film', async () => {
        // Correct status code
        await request(app).delete(`/data/reccomendations/${recOne._id}`)
            .set(...userTwoAuth)
            .expect(200)
        // Assert that the database was changed correctly
        const reccomendation = await Reccomendation.findById(recOne._id)
        expect(reccomendation).toBe(null)
    })
    test('Delete reccomendation should fail with invalid id', async () => {
        await request(app).delete('/data/reccomendations/123').set(...userOneAuth).expect(400)
    })
    test('Delete reccomendation should fail if user is not owner of associated film', async () => {
        await request(app).delete(`/data/reccomendations/${recOne._id}`).set(...userOneAuth).expect(404)
    })
    test('Delete reccomendation should fail if user is not authenticated', async () => {
        // Correct status code
        const response = await request(app).delete(`/data/reccomendations/${recOne._id}`).expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})