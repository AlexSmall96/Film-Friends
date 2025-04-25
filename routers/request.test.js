/* 
The code in this file is based on material from the below Udemy course
https://www.udemy.com/course/the-complete-nodejs-developer-course-2
*/

const request = require('supertest')
const app = require('../setupApp')
const User = require('../models/user')
const Request = require('../models/request')
import { beforeEach, afterAll, describe, test, expect } from 'vitest'

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
    requestOne
} = require('./test-utils/setupRouterTests')

// Wipe database before each test and setup test data
beforeEach(wipeDBAndSaveData)

// Close database connection after tests have run
afterAll(closeConnection)

// Tests //

// Send Friend Request
describe('SEND FRIEND REQUEST', () => {
    test('User should be able send a request to another user if there is no existing request between them.', async () => {
        // Correct status code
        const response = await request(app).post('/data/requests').send({reciever: userTwo._id}).set(...userOneAuth).expect(201)
        // Assert that the database was changed correctly
        const friendRequest = await Request.findById(response.body.request._id)
        expect(friendRequest).not.toBeNull()
        // Assertions about the response
        expect(response.body.request.accepted).toBe(false)
        expect(response.body.request.sender.toString()).toBe(userOne._id.toString())
        expect(response.body.request.reciever.toString()).toBe(userTwo._id.toString())
    })
    test('User should not be able to send a request to the same person twice', async () => {
        // Correct status code
        const response = await request(app).post('/data/requests').send({reciever: userThree._id}).set(...userTwoAuth).expect(400)
        // Correct error message
        expect(response.body.error).toBe("Friend request already sent.")
    })
    test('User should not be able to send a request to someone that has already sent them a request', async () => {
        // Correct status code
        const response = await request(app).post('/data/requests').send({reciever: userTwo._id}).set(...userThreeAuth).expect(400)
        // Correct error message
        expect(response.body.error).toBe("Friend request already sent.")
    })
    test('User should not be able to send a request to themselves', async () => {
        // Correct status code
        const response = await request(app).post('/data/requests').send({reciever: userTwo._id}).set(...userTwoAuth).expect(400)
        // Correct error message
        expect(response.body.error).toBe("You can't send a friend request to yourself.")
    })
    test('Request should fail with invalid reciever id', async () => {
        await request(app).post('/data/requests').send({reciever: '123'}).set(...userThreeAuth).expect(400)
    })
    test('Request should fail when user is not authenticated', async () => {
        // Correct status code
        const response = await request(app).post('/data/requests').send({reciever: userTwo._id}).expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

// Get friend requests
describe('GET FRIEND REQUESTS', () => {
    test('Should be able to get all pending or accepted friend requests', async () => {
        // Correct status code
        const response = await request(app).get('/data/requests').set(...userOneAuth).expect(200)
        // Correct number of requests sent / recieved. 
        expect(response.body.length).toBe(10)
        // Test pagination and sorting
        // Last to be updated should be first in list, accepted request should be last
        const finalRequest = response.body[9]
        expect(finalRequest.accepted).toBe(true)
        expect(finalRequest.isSender).toBe(true)
        expect(finalRequest.sender.username).toBe('Mike')
        const firstRequest = response.body[0]
        expect(firstRequest.accepted).toBe(false)
        expect(firstRequest.isSender).toBe(false)
        expect(firstRequest.sender.username).toBe('user9')        
        // Should get the correct number per page
        const paginatedResponseOne = await request(app).get('/data/requests?limit=3&skip=3').set(...userOneAuth).expect(200)
        const paginatedResponseTwo = await request(app).get('/data/requests?limit=5&skip=5').set(...userOneAuth).expect(200)
        expect(paginatedResponseOne.body.length).toBe(3)
        expect(paginatedResponseTwo.body.length).toBe(5)
    })
    test('Correct data is returned in a request', async () => {
        // Correct status code
        const response = await request(app).get('/data/requests').set(...userThreeAuth).expect(200)
        // Correct data is returned
        const friendRequest = response.body[0] 
        expect(friendRequest.isSender).toBe(false)
        expect(friendRequest.sender).toMatchObject({
            username: 'Steve',
            image: 'https://res.cloudinary.com/dojzptdbc/image/upload/v1744633674/defaultProfile_fjp9f4.png'
        })
        expect(friendRequest.reciever).toMatchObject({
            username: 'claire',
            image: 'https://res.cloudinary.com/dojzptdbc/image/upload/v1744633674/defaultProfile_fjp9f4.png'
        })  
    })
    test('Get friend requests should fail when not authenticated', async () => {
        // Correct status code
        const response = await request(app).get('/data/requests').expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

// Update friend requests
describe('UPDATE FRIEND REQUESTS', () => {
    test('Reciever of friend request should be able to accept it.', async () => {
        // Correct status code
        await request(app).patch(`/data/requests/${requestOne._id}`).set(...userThreeAuth).send({
            accepted: true
        }).expect(200)
        // Assert the database was changed correctly
        const req = await Request.findById(requestOne._id)
        expect(req.accepted).toBe(true)
    })
    test('Update friend request should fail with invalid id', async () => {
        // Correct status code
        await request(app).patch('/data/requests/123').set(...userThreeAuth).send({accepted:true}).expect(400)
    })
    test('Update friend request should fail if user is not reciever', async () => {
        // Correct status code
        await request(app).patch(`/data/requests/${requestOne._id}`).set(...userTwoAuth).send({accepted:true}).expect(404)
    })
    test('Update friend request should fail when not authenticated', async () => {
        // Correct status code
        const response = await request(app).patch(`/data/requests/${requestOne._id}`).send({accepted:true}).expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

// Delete friend requests
describe('DELETE FRIEND REQUESTS', () => {
    test('User should be able to delete friend request', async () => {
        // Correct status code
        await request(app).delete(`/data/requests/${requestOne._id}`).set(...userTwoAuth).expect(200)
        // Assert the database was changed correctly
        const req = await Request.findById(requestOne._id)
        expect(req).toBeNull()
    })
    test('Delete friend request should fail with invalid id', async () => {
        // Correct status code
        await request(app).delete('/data/requests/123').set(...userTwoAuth).expect(400)
    })
    test('Delete friend request should fail when not authenticated', async () => {
        // Correct status code
        const response = await request(app).delete(`/data/requests/${requestOne._id}`).expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})
