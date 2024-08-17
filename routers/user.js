const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const Film = require('../models/film')

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
router.get('/users/:id', async (req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        const films = await Film.find({owner: _id})
        res.status(200).send({ user, films })
    } catch (e) {
        res.status(400).send(e)
    }
})
// Edit profile

// Delete account


module.exports = router