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
const nodemailer = require("nodemailer");
const bcrypt = require('bcryptjs')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})


// Sign up
router.post('/data/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        res.status(201).send({ user })
    } catch (e) {
        res.status(400).send(e)
    }
})

// Login
router.post('/data/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

// Logout
router.post('/data/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token )
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Check if token is still valid
router.get('/data/users/token', auth, async (req, res) => {
    res.send()
})

// View a users profile
router.get('/data/users/:id', auth, async (req, res) => {
    const routerId = req.params.id
    try {
        let profile = await User.findById(routerId)
        // Check if viewer (current user) is not owner of profile
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
            // For each film, 20% is taken away from 100% for each point that the two users differ in thier ratings
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

/* 
The code to validate and send to an email address was taken from the following article
https://medium.com/@elijahechekwu/sending-emails-in-node-express-js-with-nodemailer-gmail-part-1-67b7da4ae04b
*/

// Check email address
router.post('/data/users/sendEmail', async (req, res) => {
    try {
        const email = req.body.email
        const account = await User.findOne({email})
        if (!account) {
            if (req.body.resetPassword) {
                return res.status(404).send({ error: 'No account was found associated with the given email address.' });
            }
        } else {
            if (!req.body.resetPassword) {
                return res.status(400).send({ error: 'Email address taken. Please choose a different email address.' });
            }
        }
        const transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE,
            auth: {
                user: process.env.SMTP_MAIL,
                pass: process.env.SMTP_PASS
            }
        });
        const OTP = req.body.OTP
        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to: email,
            subject: `Your Film Friends OTP for ${req.body.resetPassword? 'password reset' : 'email address verification'}.`,
            text: `Your one time passcode (OTP) is ${OTP}. This will expire in 10 minutes.`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).send({error: "Couldn't send email due to system issues. Please try again later."})
            }
            res.status(200).send({
                message: `A one time passcode (OTP) has been sent to your email address. Please enter it below to ${req.body.resetPassword? 'recover your account' : 'verify your email address.'}`
            })
        });
    } catch (err) {
        console.log(err)
        res.status(500).send({error: "Couldn't send email due to system issues. Please try again later."})
    }
})


// Search for profiles
router.get('/data/users/', auth, async (req, res) => {
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
      return data.secure_url
    } catch (err) {
      console.log(err);
      throw err;
    }
};

// Edit profile
router.patch('/data/users/me', auth, async (req, res) => {
    if (req.body.currPassword){
        try {
            const user = await User.findById(req.user._id)
            const isMatch = await bcrypt.compare(req.body.currPassword, req.user.password)
            if (!isMatch) {
                return res.status(400).send({errors: {password: {message: 'Current password incorrect.'}}})
            }
            user.password = req.body.newPassword
            await user.save()
            res.status(200).send()
        } catch (err) {
            res.status(400).send(err)
        }        
    } else {
        let update = {}
        if (req.body.image){
            const url = await uploadToCloudinary(req.body.image)
            update = {image: url, username: req.body.username, email:req.body.email}
        } else {
            update = {username: req.body.username, email:req.body.email}
        }
        try {
            const user = await User.findByIdAndUpdate(req.user._id, update)
            res.send({ user, token: req.token })
        } catch(err) {
            res.status(400).send(err)
        }
    }
})

// Reset password
router.patch('/data/users/resetPassword', async (req, res) => {
    try {
        console.log(req.body)
        const email = req.body.email
        const password = req.body.password
        const user = await User.findOne({email})
        user.password = password    
        await user.save()
        res.status(200).send(user)
    } catch (err) {
        res.status(400).send()
    }
})

// Delete account
router.delete('/data/users/me', auth, async (req, res) => {
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