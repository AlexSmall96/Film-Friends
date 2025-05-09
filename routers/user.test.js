/* 
The code in this file is based on material from the below Udemy course
https://www.udemy.com/course/the-complete-nodejs-developer-course-2
*/

const request = require('supertest')
const app = require('../setupApp')
const User = require('../models/user')
const Film = require('../models/film')
import { beforeEach, afterAll, describe, test, expect } from 'vitest'

// Import test data and functions from setupRouterTests.js
const {
    wipeDBAndSaveData,
    closeConnection,
    userOne,
    userTwo,
    userOneAuth,
    userTwoAuth,
    userThreeAuth
} = require('./test-utils/setupRouterTests')

// Wipe database before each test and setup test data
beforeEach(wipeDBAndSaveData)

// Close database connection after tests have run
afterAll(closeConnection)

// Sign up Tests
describe('SIGN UP', () => {
    test('Should sign up a new user', async () => {
        // Correct status code
        const response = await request(app).post('/data/users').send({username: 'Alex', email: 'alex@example.com', password: 'Red123@!'}).expect(201)
        // Assert that the database was changed correctly
        const user = await User.findById(response.body.user._id)
        expect(user).not.toBeNull()
        // Assert the password was hashed correctly
        expect(user.password).not.toBe('Red123@!')
        // Assertions about the response
        expect(response.body).toMatchObject({user: {
                username: 'Alex',
                email: 'alex@example.com',
            }
        })
        // Assert that the age is defaulted to 0
        expect(user.age).toBe(0)
    })
    test('User sign up should fail with invalid data', async () => {
        // Username taken
        await request(app).post('/data/users').send({username: 'Jane'}).expect(400)
        // Email taken
        await request(app).post('/data/users').send({email: 'jane@example.com'}).expect(400)
        // Custom error messages
        const response = await request(app).post('/data/users').send({email: 'mike@', password: 'password'}).expect(400)
        const errors = response.body.errors
        // Invalid email
        expect(errors.email.message).toBe('Email is invalid')
        // Invalid password
        expect(errors.password.message).toBe('Password cannot contain "password"')
    })
})

// Login tests
describe('LOGIN', () => {
    test('Should be able to login with valid credentials', async () => {
        // Correct status code
        const response = await request(app).post('/data/users/login')
        .send({email: userOne.email, password: userOne.password})
        .expect(200)
        // Correct token is created
        expect(response.body.token).not.toBeNull()
    })
    test('Login should fail with invalid credentials', async () => {
        // Correct status code
        await request(app).post('/data/users/login')
        .send({email: userOne.email, password: 'wrongpassword'})
        .expect(400)
    })
})

// Logout tests
describe('LOGOUT', () => {
    test('Logout should be successful when authenticated', async () => {
        // Correct status code
        await request(app).post('/data/users/logout').set(...userOneAuth).expect(200)
        // Token has been removed from tokens array
        expect(userOne.tokens.length).toBe(1)
    })
    test('Logout should be unsuccessful when not authenticated', async () => {
        // Correct status code
        const response = await request(app).post('/data/users/logout').expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

// Check token tests
describe('CHECK TOKEN', () => {
    test('Valid token should return a 200 status code', async () => {
        await request(app).get('/data/users/token').set(...userOneAuth).expect(200)
    })
    test('Invalid or expired token should return a 401 status code', async () => {
        // No token
        await request(app).get('/data/users/token').expect(401)
        // Invalid token
        await request(app).get('/data/users/token').set('Authorization', `Bearer 123`).expect(401)
        // Expired token
        // Logout user so token expires
        await request(app).post('/data/users/logout').set(...userOneAuth)
        await request(app).get('/data/users/token').set(...userOneAuth).expect(401)
    })
})

// View profile tests
describe('VIEW PROFILE', () => {
    test('User should be able to view their own profile', async () => {
        // userOne views their own profile
        // Correct status code
        const response = await request(app).get(`/data/users/${userOne._id}`).set(...userOneAuth).expect(200)
        // Correct data is returned
        expect(response.body.profile.username).toBe('Mike')
        expect(response.body.profile.email).toBe('mike@example.com')
        expect(response.body.profile.image).toBe('https://res.cloudinary.com/dojzptdbc/image/upload/v1691658951/media/images/pexels-photo-1043474_mfhznv.jpg')
    })
    test('User should be able to view another users username and profile image', async () => {
        // userTwo views userOne's profile
        // Correct status code
        const response = await request(app).get(`/data/users/${userOne._id}`).set(...userTwoAuth).expect(200)
        // Correct data is returned
        expect(response.body.profile.username).toBe('Mike')
        expect(response.body.profile.image).toBe('https://res.cloudinary.com/dojzptdbc/image/upload/v1691658951/media/images/pexels-photo-1043474_mfhznv.jpg')
        // Private data is not returned
        expect(Object.keys(response.body.profile).includes('email')).toBe(false)
        expect(Object.keys(response.body.profile).includes('password')).toBe(false)
    })
    test('Similarity scores should be correct', async () => {
        // userTwo views userOne's profile
        const response = await request(app).get(`/data/users/${userOne._id}`).set(...userTwoAuth).expect(200)
        // Similarity score should be 0.7; the average score across both common films
        // Star Wars rated as 5 (user 1) and 4 (user 2): 0.8 similarity
        // Love Actually rated as 3 (user 1) and 1 (user 2): 0.6 similarity
        expect(response.body.similarity).toBe(0.7)
        // userThree views userTwo's profile
        const responseNullScore = await request(app).get(`/data/users/${userTwo._id}`).set(...userThreeAuth).expect(200)
        expect(responseNullScore.body.similarity).toBe(null)
    })
    test('View profile should be unsuccessful when not authenticated', async () => {
        // Correct status code
        const response = await request(app).get(`/data/users/${userOne._id}`).expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
    test('View profile should fail with invalid id', async () => {
        // Correct status code
        await request(app).get('/data/users/123').set(...userOneAuth).expect(400)
    })
})

// Search for profiles
describe('SEARCH FOR PROFILES', () => {
    test('Should be able to search for user by username', async () => {
        // Search 1: Search for ' USer' - should return user0...user9 with status code 200
        const resultsForUser = await request(app).get('/data/users/?username= USer').set(...userOneAuth).expect(200)
        expect(resultsForUser.body.length).toBe(10)
        // Test pagination - should return the correct number per page
        const resultsForUserPaginated1 = await request(app).get('/data/users/?username=User&limit=5&skip=0').set(...userOneAuth).expect(200)
        const resultsForUserPaginated2 = await request(app).get('/data/users/?username=User&limit=3&skip=3').set(...userOneAuth).expect(200)
        expect(resultsForUserPaginated1.body.length).toBe(5)
        expect(resultsForUserPaginated2.body.length).toBe(3)
        // Test Sorting - last updated should be the first in list
        expect(resultsForUserPaginated1.body[0].username).toBe('user9')
        // Search 2: Search for 'user2 ' - should only return user2 with status code 200
        const resultsForUser2 = await request(app).get('/data/users/?username=user2 ').set(...userOneAuth).expect(200)
        expect(resultsForUser2.body.length).toBe(1)
        expect(resultsForUser2.body[0].email).toBe('user2@example.com')
        // Search 3: Search for abc - should return no results with status code 200
        const resultsForAbc = await request(app).get('/data/users/?username=abc').set(...userOneAuth).expect(200)
        expect(resultsForAbc.body.length).toBe(0)
    })
    test('Search for profiles should be unsuccessful when not authenticated', async () => {
        // Correct status code
        const response = await request(app).get('/data/users/?username= User').expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

// Edit profile
describe('EDIT PROFILE', () => {
    test('Should be able to edit username and email with valid data', async () => {
        // Correct status code
        await request(app).patch(`/data/users/me`).send({
            username: 'Mike2',
            email: 'mike2@example.com'
        }).set(...userOneAuth).expect(200)
        // Assert that the database was changed correctly
        const user = await User.findById(userOne._id)
        expect(user.username).toBe('Mike2')
        expect(user.email).toBe('mike2@example.com')
    })
    test('Should be able to update password with valid data', async () => {
        await request(app).patch(`/data/users/me`).send({
            currPassword: '56what!!',
            newPassword: '76what!!'
        }).set(...userOneAuth).expect(200)
    })
    test('Profile edit should fail with invalid data', async () => {
        // Username taken
        await request(app).patch(`/data/users/me`).send({username: 'user1'}).set(...userOneAuth).expect(400)
        // Email taken
        await request(app).patch(`/data/users/me`).send({email: 'user1@example.com'}).set(...userOneAuth).expect(400)
        // Current password incorrect
        const responseCurrPassword = await request(app).patch(`/data/users/me`).send({email: 'mike@example.com', currPassword: '100what!!'}).set(...userOneAuth).expect(400)
        expect(responseCurrPassword.body.errors.password.message).toBe('Current password incorrect.')
        // New password invalid
        const responseNewPassword = await request(app).patch(`/data/users/me`).send({email: 'mike@example.com', currPassword: '56what!!', newPassword: 'password'}).set(...userOneAuth).expect(400)
        expect(responseNewPassword.body.errors.password.message).toBe('Password cannot contain "password"')
    })
    test('Profile edit should be unsuccessful when not authenticated', async () => {
        // Correct status code
        const response = await request(app).patch(`/data/users/me`).send({username: 'Mike3'}).expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})


// Delete profile
describe('DELETE PROFILE', () => {
    test('Should delete profile when authenticated', async () => {
        // Correct status code
        await request(app).delete(`/data/users/me`).set(...userOneAuth).expect(200)
        // Assert the database was changed correctly
        const user = await User.findById(userOne._id)
        expect(user).toBeNull()
        // Assert that users films have also been deleted
        const filmOneASearch = await Film.find({title: 'film one a'})
        const filmOneBSearch = await Film.find({title: 'film one b'})
        expect(filmOneASearch.length).toBe(0)
        expect(filmOneBSearch.length).toBe(0)
    })
    test('Profile delete should be unsuccessful when not authenticated', async () => {
        // Correct status code
        const response = await request(app).delete(`/data/users/me`).expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

