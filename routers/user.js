/* 
The code in this file is based on material from the below Udemy course
https://www.udemy.com/course/the-complete-nodejs-developer-course-2
*/

const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const Film = require('../models/film')
const auth = require('../middleware/auth')
const Reccomendation = require('../models/reccomendation')
const Request = require('../models/request')
const cloudinary = require("cloudinary").v2

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})


// Sign up
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        res.status(201).send({ user })
    } catch (e) {
        res.status(400).send(e)
    }
})

// Login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

// Logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token )
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Check if token is still valid
router.get('/users/token', auth, async (req, res) => {
    res.send()
})

// View a users profile
router.get('/users/:id', auth, async (req, res) => {
    const routerId = req.params.id
    try {
        let profile = await User.findById(routerId)
        // Check if viewer (current user) is owner of profile
        if (req.user.id !== routerId) { 
            profile = {age:profile.age, username: profile.username, image: profile.image}
            // Calculate similarity score
            // Find current users films
            const viewersFilms = await Film.find({owner: req.user.id, public: true, watched: true})
            const ratings = []
            // Check if curent users and profile owner have film in common
            for (let viewersFilm of viewersFilms) {
                const ownersFilm = await Film.findOne({owner: routerId, imdbID: viewersFilm.imdbID, public: true, watched: true })
                if (ownersFilm) {
                    ratings.push({viewerRating: viewersFilm.userRating, ownerRating: ownersFilm.userRating})
                }
            }
            // Calculate difference in ratings
            // For each film, 20% is taken away from %100 for each point that the two users differ in thier ratings
            // The returned score is the average of this difference across all common films
            const initialValue = 0
            const callBack = (total, rating) => (1 - 0.2 * Math.abs(rating.viewerRating - rating.ownerRating)) + total
            const ratingsSum = ratings.reduce(callBack, initialValue)
            const similarity = ratingsSum / ratings.length
            // Send profile data and similarity score
            return res.status(200).send({ profile, similarity })
        }
        // Send profile data
        res.status(200).send({ profile })
    } catch (e) {
        res.status(400).send(e)
    }
})

// Search for profiles
router.get('/users/', auth, async (req, res) => {
    const username = new RegExp(`^${req.query.username.trim()}`, "i")
    try {
        const allUsers = await User.find( { username: { $regex:username } } )
        .sort({updatedAt: -1})
        .limit(req.query.limit)
        .skip(req.query.skip)
        const users = allUsers.filter(user => user.username !== req.user.username)
        res.status(200).send(users)
    } catch (e) {
        res.status(400).send(e)
    }
})

/* 
The below function recieves an image from the client and uploads it to cloudinary
taken from https://dev.to/njong_emy/how-to-store-images-in-mongodb-using-cloudinary-mern-stack-imo
*/
const uploadToCloudinary = async (path, folder = "my-profile") => {
    try {
      const data = await cloudinary.uploader.upload(path, { folder: folder });
      return { url: data.secure_url, publicId: data.public_id };
    } catch (err) {
      console.log(err);
      throw err;
    }
};

// Edit profile
router.patch('/users/me', auth, async (req, res) => {
    const _id = req.user._id
    let body = {}
    try {
        if (req.body.image) {
            const {imageURL} = uploadToCloudinary(req.body.image)
            body = {image: imageURL, ...req.body}
        } else {
            body = req.body
        }
        const user = await User.findByIdAndUpdate(_id, body, {new: true, runValidators: true})
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Delete account
router.delete('/users/me', auth, async (req, res) => {
    try {
        await User.findOneAndDelete({_id: req.user._id})
        await Film.deleteMany({owner: req.user._id})
        await Reccomendation.deleteMany({sender: req.user._id})
        await Request.deleteMany({$or: [{sender: req.user._id}, {reciever:req.user._id}]})
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router