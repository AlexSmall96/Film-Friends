const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const Film = require('../models/film')
const auth = require('../middleware/auth')

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

// View a users profile
router.get('/users/:id', auth, async (req, res) => {
    const routerId = req.params.id
    try {
        let profile = await User.findById(routerId)
        let films = await Film.find({owner: routerId})
            .sort({createdAt: -1})
            .limit(req.query.limit)
            .skip(req.query.skip)
        if (req.user.id !== routerId) {
            profile = {age:profile.age, username: profile.username}
            films = films.filter(film => film.public === true)
        }
        res.status(200).send({ profile, films })
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})


// Search for profiles
router.get('/users/', auth, async (req, res) => {
    const username = new RegExp(`^${req.query.username.trim()}`, "i")
    try {
        const users = await User.find( { username: { $regex:username } } )
        .sort({updatedAt: -1})
        .limit(req.query.limit)
        .skip(req.query.skip)
        res.status(200).send(users)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Edit profile
router.patch('/users/me', auth, async (req, res) => {
    const _id = req.user._id
    try {
        const user = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Delete account
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.deleteOne()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router