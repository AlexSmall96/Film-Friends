const express = require('express')
const router = new express.Router()
const Film = require('../models/film')
const auth = require('../middleware/auth')

// Create a film (save film to watchlist)
router.post('/films', auth, async (req, res) => {
    const film = new Film(req.body)
    try {
        await film.save()
        res.status(201).send({ film })
    } catch (e) {
        res.status(400).send(e)
    }
})

// View film data for one film (get multiple films is handled by router.get('/users/:id, ...) in routers/user.js)
// Need to add to authentication to ensure user is owner of film
router.get('/films/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const film = await Film.findById(_id)
        res.status(200).send({ film })
    } catch (e) {
        res.status(400).send(e)
    }
})

// Update film data
router.patch('/films/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const film = await Film.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})
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
        const film = await Film.findOneAndDelete({_id:_id})
        if (!film) {
            return res.status(404).send()
        }
        res.send(film)
    } catch (e) {
        res.status(400).send(e)
    }
})
module.exports = router