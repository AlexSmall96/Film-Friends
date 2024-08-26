const request = require('supertest')
const app = require('../setupApp')
const User = require('../models/user')
const Request = require('../models/request')

// Import test data and functions from setupRouterTests.js
const {
    wipeDBAndSaveData,
    closeConnection,
    userTwo,
    userThree,
    userOneAuth,
    userTwoAuth,
    userThreeAuth,
    requestOne
} = require('./testing/setupRouterTests')

// Wipe database before each test and setup test data
beforeEach(wipeDBAndSaveData)

// Close database connection after tests have run
afterAll(closeConnection)

// Tests //

// Send Friend Request
describe('Send Friend Request', () => {
    test('User should be able send a request to another user if there is no existing request between them.', async () => {
        // Correct status code
        const response = await request(app).post('/requests').send({reciever: userTwo._id}).set(...userOneAuth).expect(201)
        // Assert that the database was changed correctly
        const friendRequest = await Request.findById(response.body.request._id)
        expect(friendRequest).not.toBeNull()
        // Assertions about the response
        expect(response.body.request.accepted).toBe(false)
        expect(response.body.request.declined).toBe(false)
    })
    test('User should not be able to send a request to the same person twice', async () => {
        // Correct status code
        const response = await request(app).post('/requests').send({reciever: userThree._id}).set(...userTwoAuth).expect(400)
        // Correct error message
        expect(response.body.error).toBe("You've already sent a friend request to this user.")
    })
    test('User should not be able to send a request to someone that has already sent them a request', async () => {
        // Correct status code
        const response = await request(app).post('/requests').send({reciever: userTwo._id}).set(...userThreeAuth).expect(400)
        // Correct error message
        expect(response.body.error).toBe("This user has already sent you a friend request.")
    })
    test('User should not be able to send a request to themselves', async () => {
        // Correct status code
        const response = await request(app).post('/requests').send({reciever: userTwo._id}).set(...userTwoAuth).expect(400)
        // Correct error message
        expect(response.body.error).toBe("You can't send a friend request to yourself.")
    })
    test('Request should fail with invalid reciever id', async () => {
        await request(app).post('/requests').send({reciever: '123'}).set(...userThreeAuth).expect(400)
    })
    test('Request should fail when user is not authenticated', async () => {
        // Correct status code
        const response = await request(app).post('/requests').send({reciever: userTwo._id}).expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

// Get friend requests
describe('Get friend requests', () => {
    test('Should be able to get all non declined friend requests', async () => {
        // Correct status code
        const response = await request(app).get('/requests').set(...userOneAuth).expect(200)
        // Correct number of requests sent / recieved. 
        expect(response.body.requests.length).toBe(9)
        // Excludes declined requests
        response.body.requests.map(request => expect(request.declined).toBe(false))
        // Test pagination and sorting
        // Last to be updated should be first in list, accepted request should be last
        const user1 = await User.find({username: 'user1'})
        const user9 = await User.find({username: 'user9'})
        const id1 = response.body.requests[8].reciever
        const id9 = response.body.requests[0].sender
        expect(user1[0].id).toBe(id1)
        expect(user9[0].id).toBe(id9)
        // Should get the correct number per page
        const paginatedResponseOne = await request(app).get('/requests?limit=3&skip=3').set(...userOneAuth).expect(200)
        const paginatedResponseTwo = await request(app).get('/requests?limit=5&skip=5').set(...userOneAuth).expect(200)
        expect(paginatedResponseOne.body.requests.length).toBe(3)
        expect(paginatedResponseTwo.body.requests.length).toBe(4)
    })
    test('Get friend requests should fail when not authenticated', async () => {
        // Correct status code
        const response = await request(app).get('/requests').expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

// Update friend requests
describe('Update friend requests', () => {
    test('Reciever of friend request should be able to accept or decline it', async () => {
        // Correct status code
        const response = await request(app).patch(`/requests/${requestOne._id}`).set(...userThreeAuth).send({
            accepted: true,
            declined: true
        }).expect(200)
        // Assert the database was changed correctly
        const req = await Request.findById(requestOne._id)
        expect(req.accepted).toBe(true)
        expect(req.declined).toBe(true)
    })
    test('Update friend request should fail with invalid id', async () => {
        // Correct status code
        await request(app).patch('/requests/123').set(...userThreeAuth).send({accepted:true}).expect(400)
    })
    test('Update friend request should fail if user is not reciever', async () => {
        // Correct status code
        await request(app).patch(`/requests/${requestOne._id}`).set(...userTwoAuth).send({accepted:true}).expect(404)
    })
    test('Update friend request should fail when not authenticated', async () => {
        // Correct status code
        const response = await request(app).patch(`/requests/${requestOne._id}`).send({accepted:true}).expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

// Delete friend requests
describe('Delete friend requests', () => {
    test('Sender of friend request should be able to delete it', async () => {
        // Correct status code
        await request(app).delete(`/requests/${requestOne._id}`).set(...userTwoAuth).expect(200)
        // Assert the database was changed correctly
        const req = await Request.findById(requestOne._id)
        expect(req).toBeNull()
    })
    test('Delete friend request should fail with invalid id', async () => {
        // Correct status code
        await request(app).delete('/requests/123').set(...userTwoAuth).expect(400)
    })
    test('Delete friend request should fail if user is not sender', async () => {
        // Correct status code
        await request(app).delete(`/requests/${requestOne._id}`).set(...userThreeAuth).expect(404)
    })
    test('Delete friend request should fail when not authenticated', async () => {
        // Correct status code
        const response = await request(app).delete(`/requests/${requestOne._id}`).expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})
