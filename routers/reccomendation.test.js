const request = require('supertest')
const app = require('../setupApp')
const User = require('../models/user')
const Request = require('../models/request')
const film = require('../models/film')

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