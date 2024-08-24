const request = require('supertest')
const app = require('../setupApp')
const User = require('../models/user')
const Request = require('../models/request')
const Film = require('../models/film')

// Import test data and functions from setupRouterTests.js
const {
    wipeDBAndSaveData,
    closeConnection,
    userOne,
    userTwo,
    userThree,
    userOneAuth,
    userTwoAuth,
    userThreeAuth,
    requestOne,
    filmOneA,
    filmTwo
} = require('./testing/setupRouterTests')

// Wipe database before each test and setup test data
beforeEach(wipeDBAndSaveData)

// Close database connection after tests have run
afterAll(closeConnection)

// Tests //

// Create reccomendations
describe('Send Reccomendations:', () => {
    test("User can't reccomend a film they don't own", async () => {
        // Correct status code
        const response = await request(app).post('/reccomendations')
            .set(...userTwoAuth)
            .send({film: filmOneA._id, reciever: userThree._id})
            .expect(400)
        // Correct error message
        expect(response.body.error).toBe("You can't reccomend a film you haven't saved.")
    })
    test("User can't send a reccomendation to a user that is not their friend", async () => {
        // Correct status code
        const response = await request(app).post('/reccomendations')
            .set(...userTwoAuth)
            .send({film: filmTwo._id, reciever: userThree._id})
            .expect(400)
        // Correct error message
        expect(response.body.error).toBe("You can't send a reccomendation to this user because you are not friends.")
    })
    test('User can send reccomendation if they own the film and are friends with the reciever', async () => {
        // Update friend request to be accepted
        await Request.findByIdAndUpdate(requestOne._id, {accepted: true})
        // Correct status code
        const response = await request(app).post('/reccomendations')
            .set(...userTwoAuth)
            .send({film: filmTwo._id, reciever: userThree._id})
            .expect(201)
    })
    test('Reccomendation should fail with invalid data', async () => {
        // Correct status code
        await request(app).post('/reccomendations')
            .set(...userTwoAuth)
            .send({film: '123', reciever: '123'})
            .expect(400)
    })
    test('Reccomendation should fail when not authenticated', async () => {
        // Correct status code
        const response = await request(app).post('/reccomendations').send({film: filmTwo._id, reciever: userThree._id}).expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

// Get reccomendations
describe('Get all reccomendations:', () => {
    test('Should be able to get all of users reccomendations', async () => {
        // Correct status code
        const response = await request(app).get('/reccomendations').set(...userOneAuth).expect(200)
        // Correct number of reccomendations
        expect(response.body.reccomendations.length).toBe(10)
        // Last updated should be first in list
        const lastFilm = await Film.findById(response.body.reccomendations[0].film) 
        expect(lastFilm.title).toBe('A film reccomended by user9')
        // Test pagination
        const paginatedResponseOne = await request(app).get('/reccomendations/?limit=5&skip=5')
            .set(...userOneAuth)
            .expect(200)
        const paginatedResponseTwo = await request(app).get('/reccomendations/?limit=4&skip=7')
            .set(...userOneAuth)
            .expect(200)
        expect(paginatedResponseOne.body.reccomendations.length).toBe(5)
        expect(paginatedResponseTwo.body.reccomendations.length).toBe(3)
    })
    test('Get reccomendations fails if user is not authenticated', async () => {
        // Correct status code
        const response = await request(app).get('/reccomendations').expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})