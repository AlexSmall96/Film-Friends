/* 
The code in this file is based on material from the below Udemy course
https://www.udemy.com/course/the-complete-nodejs-developer-course-2
*/

const express = require('express')
const router = new express.Router()
const Film = require('../models/film')
const auth = require('../middleware/auth')

// Create a film (save film to watchlist)
router.post('/films', auth, async (req, res) => {
    const owner = req.user._id
    try {
        const film = new Film({owner, ...req.body})
        await film.save()
        res.status(201).send({ film })
    } catch (e) {
        res.status(400).send(e)
    }
})

// View film data for one film (get multiple films is handled by router.get('/users/:id, ...) in routers/user.js)
router.get('/films/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const film = await Film.findById(_id)
        if (!film) {
            return res.status(404).send()
        }
        res.send(film)
    } catch (e) {
        res.status(500).send(e)
    }
})

// Update film data
router.patch('/films/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const film = await Film.findOneAndUpdate({_id, owner: req.user._id}, req.body, {new: true, runValidators: true})
        if (!film) {
            return res.status(404).send()
        }
        res.send(film)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Delete film
router.delete('/films/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const film = await Film.findOneAndDelete({_id:_id, owner: req.user._id})
        if (!film) {
            return res.status(404).send()
        }
        res.send(film)
    } catch (e) {
        res.status(400).send(e)
    }
})
module.exports = router