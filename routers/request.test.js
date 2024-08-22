const request = require('supertest')
const app = require('../setupApp')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Request = require('../models/request')
const JWT_SECRET = process.env.JWT_SECRET

// Define test data
const userFourId = new mongoose.Types.ObjectId()
const userFiveId = new mongoose.Types.ObjectId()
const userSixId = new mongoose.Types.ObjectId()
const userFour = {
    _id: userFourId, 
    username: 'claire', 
    email: 'claire@example.com', 
    password: '56how!!',
    tokens: [{
        token: jwt.sign({_id: userFourId}, JWT_SECRET)
    }]
}
const userFive = {
    _id: userFiveId, 
    username: 'josh', 
    email: 'josh@example.com', 
    password: '56then!!',
    tokens: [{
        token: jwt.sign({_id: userFiveId}, JWT_SECRET)
    }]
}
const userSix = {
    _id: userSixId, 
    username: 'dan', 
    email: 'dan@example.com', 
    password: '56there!!',
    tokens: [{
        token: jwt.sign({_id: userSixId}, JWT_SECRET)
    }]
}
const requestOne = {
    sender: userFiveId,
    reciever: userSixId
}
const userFourAuth = ['Authorization', `Bearer ${userFour.tokens[0].token}`]
const userFiveAuth = ['Authorization', `Bearer ${userFive.tokens[0].token}`]
const userSixAuth = ['Authorization', `Bearer ${userSix.tokens[0].token}`]

// Wipe database before each test and setup test data
beforeEach(async () => {
    await User.deleteMany()
    await Request.deleteMany()
    await new User(userFour).save()
    await new User(userFive).save()
    await new User(userSix).save()
    await new Request(requestOne).save()
})

// Close database connection after tests have run
afterAll(() => mongoose.connection.close())

// Send Friend Request tests
test('User should be able send a request to another user if there is no existing request between them.', async () => {
    // Correct status code
    const response = await request(app).post('/requests').send({reciever: userFiveId}).set(...userFourAuth).expect(201)
    // Assert that the database was changed correctly
    const friendRequest = await Request.findById(response.body.request._id)
    expect(friendRequest).not.toBeNull()
    // Assertions about the response
    expect(response.body.request.accepted).toBe(false)
    expect(response.body.request.declined).toBe(false)
})
test('User should not be able to send a request to the same person twice', async () => {
    // Correct status code
    const response = await request(app).post('/requests').send({reciever: userSixId}).set(...userFiveAuth).expect(400)
    // Correct error message
    expect(response.body.error).toBe("You've already sent a friend request to this user.")
})
test('User should not be able to send a request to someone that has already sent them a request', async () => {
    // Correct status code
    const response = await request(app).post('/requests').send({reciever: userFiveId}).set(...userSixAuth).expect(400)
    // Correct error message
    expect(response.body.error).toBe("This user has already sent you a friend request.")
})
test('User should not be able to send a request to themselves', async () => {
    // Correct status code
    const response = await request(app).post('/requests').send({reciever: userFiveId}).set(...userFiveAuth).expect(400)
    // Correct error message
    expect(response.body.error).toBe("You can't send a friend request to yourself.")
})
test('Request should fail with invalid reciever id', async () => {
    await request(app).post('/requests').send({reciever: '123'}).set(...userSixAuth).expect(400)
})
test('Request should fail when user is not authenticated', async () => {
    await request(app).post('/requests').send({reciever: userFiveId}).expect(401)
})


