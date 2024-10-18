/* 
The code in this file is based on material from the below Udemy course
https://www.udemy.com/course/the-complete-nodejs-developer-course-2
*/

const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../models/user')
const Film = require('../../models/film')
const Request = require('../../models/request')
const Reccomendation = require('../../models/reccomendation')
const JWT_SECRET = process.env.JWT_SECRET

// Define test data
const userOneId = new mongoose.Types.ObjectId()
const userTwoId = new mongoose.Types.ObjectId()
const userThreeId = new mongoose.Types.ObjectId()
const filmOneAId = new mongoose.Types.ObjectId()
const filmTwoId = new mongoose.Types.ObjectId()
const filmThreeId = new mongoose.Types.ObjectId()
const requestOneId = new mongoose.Types.ObjectId()
const recOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId, 
    username: 'Mike', 
    email: 'mike@example.com', 
    password: '56what!!',
    image: 'https://res.cloudinary.com/dojzptdbc/image/upload/v1691658951/media/images/pexels-photo-1043474_mfhznv.jpg',
    tokens: [{
        token: jwt.sign({_id: userOneId}, JWT_SECRET)
    }]
}
const userTwo = {
    _id: userTwoId,
    username: 'Steve',
    email: 'steve@example.com',
    password: '123green@',
    tokens: [{
        token: jwt.sign({_id: userTwoId}, JWT_SECRET)
    }]
}
const userThree = {
    _id: userThreeId, 
    username: 'claire', 
    email: 'claire@example.com', 
    password: '56how!!',
    tokens: [{
        token: jwt.sign({_id: userThreeId}, JWT_SECRET)
    }]
}
const userOneAuth = ['Authorization', `Bearer ${userOne.tokens[0].token}`]
const userTwoAuth = ['Authorization', `Bearer ${userTwo.tokens[0].token}`]
const userThreeAuth = ['Authorization', `Bearer ${userThree.tokens[0].token}`]
const filmOneA = {_id: filmOneAId, Title: 'film one a', imdbID: 't345', owner: userOneId, public: true}
const filmOneB = {Title: 'film one b', imdbID: 's345', owner: userOneId, public: false}
const filmOneC = {Title: 'film one c', imdbID: 'u345', owner: userOneId, public: false}
const filmOneD = {Title: 'film one d', imdbID: 'v345', owner: userOneId, public: false}
const filmTwo = {_id: filmTwoId, Title: 'film two', imdbID: 'e123', owner: userTwoId, public: true}
const filmThree = {_id: filmThreeId, Title: 'film three', imdbID: 'f123', owner: userTwoId, public: false}
const requestOne = {_id: requestOneId, sender: userTwoId, reciever: userThreeId}
const recOne = {_id: recOneId, film: filmOneAId, reciever: userTwoId, sender: userOneId}

// Wipe database before each test and setup test data
const wipeDBAndSaveData = async () => {
    await User.deleteMany()
    await Film.deleteMany()
    await Request.deleteMany()
    await Reccomendation.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new User(userThree).save()
    await new Film(filmOneA).save()
    await new Film(filmOneB).save()
    await new Film(filmOneC).save()
    await new Film(filmOneD).save()
    await new Film(filmTwo).save()
    await new Request(requestOne).save()
    await new Reccomendation(recOne).save()
    // Auto generate 10 users to test request pagination and sorting
    for (let i=0; i<10; i++){
        let id = new mongoose.Types.ObjectId()
        let user = await new User({
            _id: id,
            username: `user${i}`,
            email: `user${i}@example.com`,
            password: `user${i}pd123`
        }).save()
        await new Request({
            sender: i < 5 ? userOneId : user._id, 
            reciever: i < 5 ? user._id : userOneId,
            declined: i == 2,
            accepted: i == 1
        }).save()
        // Create 10 reccomendations to test reccomendation pagination and sorting
        let filmId = new mongoose.Types.ObjectId()
        let film = await new Film({
            _id: filmId,
            Title: `A film reccomended by user${i}`,
            imdbID: `imdbID${i}`,
            owner: user._id
        }).save()
        await new Reccomendation({
            film: film._id,
            reciever: userOneId,
            sender: user._id
        }).save()
    }
}

// Close database connection after tests have run
const closeConnection = () => {mongoose.connection.close()}

module.exports = {
    wipeDBAndSaveData,
    closeConnection,
    userOne,
    userTwo,
    userThree,
    userOneAuth,
    userTwoAuth,
    userThreeAuth,
    filmOneA,
    filmTwo,
    filmThree,
    requestOne,
    recOne
}