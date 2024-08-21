const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const Film = require('../models/film')
const auth = require('../middleware/auth')

// User Endpoints go here

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

// Logout

// View profile
// Need to add authentication to hide private data (email, password, private films)
router.get('/users/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        const films = await Film.find({owner: _id})
        res.status(200).send({ user, films })
    } catch (e) {
        res.status(400).send(e)
    }
})

// Search for profiles
router.get('/users/', auth, async (req, res) => {
    const username = new RegExp(`^${req.query.username.trim()}`, "i")
    try {
        const users = await User.find( { username: { $regex:username } } )
        res.status(200).send({ users })
    } catch (e) {
        res.status(400).send(e)
    }
})

// Edit profile
router.patch('/users/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Delete account
router.delete('/users/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findOneAndDelete({_id:_id})
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router