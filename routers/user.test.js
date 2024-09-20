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
    userOneAuth,
    userTwoAuth,
} = require('./testing/setupRouterTests')

// Wipe database before each test and setup test data
beforeEach(wipeDBAndSaveData)

// Close database connection after tests have run
afterAll(closeConnection)

// Sign up Tests
describe('Sign Up:', () => {
    test('Should sign up a new user', async () => {
        // Correct status code
        const response = await request(app).post('/users').send({username: 'Alex', email: 'alex@example.com', password: 'Red123@!'}).expect(201)
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
        await request(app).post('/users').send({username: 'Jane'}).expect(400)
        // Email taken
        await request(app).post('/users').send({email: 'jane@example.com'}).expect(400)
        // Custom error messages
        const response = await request(app).post('/users').send({age: -1, email: 'mike@', password: 'password'}).expect(400)
        const errors = response.body.errors
        // Invalid age
        expect(errors.age.message).toBe('Age must be a positive number.')
        // Invalid email
        expect(errors.email.message).toBe('Email is invalid')
        // Invalid password
        expect(errors.password.message).toBe('Password cannot contain "password"')
    })
})

// Login tests
describe('Login:', () => {
    test('Should be able to login with valid credentials', async () => {
        // Correct status code
        const response = await request(app).post('/users/login')
        .send({email: userOne.email, password: userOne.password})
        .expect(200)
        // Correct token is created
        expect(response.body.token).not.toBeNull()
    })
    test('Login should fail with invalid credentials', async () => {
        // Correct status code
        await request(app).post('/users/login')
        .send({email: userOne.email, password: 'wrongpassword'})
        .expect(400)
    })
})

// Logout tests
describe('Logout:', () => {
    test('Logout should be successful when authenticated', async () => {
        // Correct status code
        await request(app).post('/users/logout').set(...userOneAuth).expect(200)
        // Token has been removed from tokens array
        expect(userOne.tokens.length).toBe(1)
    })
    test('Logout should be unsuccessful when not authenticated', async () => {
        // Correct status code
        const response = await request(app).post('/users/logout').expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

// Check token tests
describe('Check Token:', () => {
    test('Valid token should return a 200 status code', async () => {
        await request(app).get('/users/token').set(...userOneAuth).expect(200)
    })
    test('Invalid or expired token should return a 401 status code', async () => {
        // No token
        await request(app).get('/users/token').expect(401)
        // Invalid token
        await request(app).get('/users/token').set('Authorization', `Bearer 123`).expect(401)
        // Expired token
        // Logout user so token expires
        await request(app).post('/users/logout').set(...userOneAuth)
        await request(app).get('/users/token').set(...userOneAuth).expect(401)
    })
})

// View profile tests
describe('View profile:', () => {
    test('User should be able to view their own profile and all films', async () => {
        // userOne views their own profile
        // Correct status code
        const response = await request(app).get(`/users/${userOne._id}`).set(...userOneAuth).expect(200)
        // Correct data is returned
        expect(response.body.profile.username).toBe('Mike')
        expect(response.body.profile.email).toBe('mike@example.com')
        expect(response.body.films.length).toBe(4)
        // Test pagination
        const paginatedResponse1 = await request(app).get(`/users/${userOne._id}?limit=2&skip=0`).set(...userOneAuth).expect(200)
        const paginatedResponse2 = await request(app).get(`/users/${userOne._id}?limit=2&skip=2`).set(...userOneAuth).expect(200)
        expect(paginatedResponse1.body.films.length).toBe(2)
        expect(paginatedResponse2.body.films.length).toBe(2)
        // Test sorting
        expect(paginatedResponse1.body.films[0].title).toBe('film one d')
        expect(paginatedResponse1.body.films[1].title).toBe('film one c')
        expect(paginatedResponse2.body.films[0].title).toBe('film one b')
        expect(paginatedResponse2.body.films[1].title).toBe('film one a')
    })
    test('User should be able to view another users username, age and public films', async () => {
        // userTwo views userOne's profile
        // Correct status code
        const response = await request(app).get(`/users/${userOne._id}`).set(...userTwoAuth).expect(200)
        // Correct data is returned
        expect(response.body.profile.username).toBe('Mike')
        expect(response.body.profile.age).toBe(0)
        expect(response.body.films.length).toBe(1)
        expect(response.body.films[0].title).toBe('film one a')
        // Private data is not returned
        expect(Object.keys(response.body.profile).includes('email')).toBe(false)
        expect(Object.keys(response.body.profile).includes('password')).toBe(false)
    })
    test('View profile should be unsuccessful when not authenticated', async () => {
        // Correct status code
        const response = await request(app).get(`/users/${userOne._id}`).expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
    test('View profile should fail with invalid id', async () => {
        // Correct status code
        await request(app).get('/users/123').set(...userOneAuth).expect(400)
    })
})

// Search for profiles
describe('Search for profiles', () => {
    test('Should be able to search for user by username', async () => {
        // Search 1: Search for ' USer' - should return user0...user9 with status code 200
        const resultsForUser = await request(app).get('/users/?username= USer').set(...userOneAuth).expect(200)
        expect(resultsForUser.body.length).toBe(10)
        // Test pagination - should return the correct number per page
        const resultsForUserPaginated1 = await request(app).get('/users/?username=User&limit=5&skip=0').set(...userOneAuth).expect(200)
        const resultsForUserPaginated2 = await request(app).get('/users/?username=User&limit=3&skip=3').set(...userOneAuth).expect(200)
        expect(resultsForUserPaginated1.body.length).toBe(5)
        expect(resultsForUserPaginated2.body.length).toBe(3)
        // Test Sorting - last updated should be the first in list
        expect(resultsForUserPaginated1.body[0].username).toBe('user9')
        // Search 2: Search for 'user2 ' - should only return user2 with status code 200
        const resultsForUser2 = await request(app).get('/users/?username=user2 ').set(...userOneAuth).expect(200)
        expect(resultsForUser2.body.length).toBe(1)
        expect(resultsForUser2.body[0].email).toBe('user2@example.com')
        // Search 3: Search for abc - should return no results with status code 200
        const resultsForAbc = await request(app).get('/users/?username=abc').set(...userOneAuth).expect(200)
        expect(resultsForAbc.body.length).toBe(0)
    })
    test('Search for profiles should be unsuccessful when not authenticated', async () => {
        // Correct status code
        const response = await request(app).get('/users/?username= User').expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

// Edit profile
describe('Edit Profile', () => {
    test('Should be able to edit valid fields with valid data', async () => {
        // Correct status code
        await request(app).patch(`/users/me`).send({
            username: 'Mike2',
            email: 'mike2@example.com',
            age: 28,
            password: 'new12345'
        }).set(...userOneAuth).expect(200)
        // Assert that the database was changed correctly
        const user = await User.findById(userOne._id)
        expect(user.username).toBe('Mike2')
        expect(user.email).toBe('mike2@example.com')
        expect(user.age).toBe(28)
    })
    test('Profile edit should fail with invalid data', async () => {
        // Username taken
        await request(app).patch(`/users/me`).send({username: 'user1'}).set(...userOneAuth).expect(400)
        // Email taken
        await request(app).patch(`/users/me`).send({email: 'user1@example.com'}).set(...userOneAuth).expect(400)
        // Custom error messages
        const response = await request(app).patch(`/users/me`).send({age: -1, email: 'mike@', password: 'password'}).set(...userOneAuth).expect(400)
        const errors = response.body.errors
        // Invalid age
        expect(errors.age.message).toBe('Age must be a positive number.')
        // Invalid email
        expect(errors.email.message).toBe('Email is invalid')
        // Invalid password
        expect(errors.password.message).toBe('Password cannot contain "password"')
    })
    test('Profile edit should be unsuccessful when not authenticated', async () => {
        // Correct status code
        const response = await request(app).patch(`/users/me`).send({username: 'Mike3'}).expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})


// Delete profile
describe('Delete Profile', () => {
    test('Should delete profile when authenticated', async () => {
        // Correct status code
        await request(app).delete(`/users/me`).set(...userOneAuth).expect(200)
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
        const response = await request(app).delete(`/users/me`).expect(401)
        // Correct error message
        expect(response.body.error).toBe('Please authenticate.')
    })
})

