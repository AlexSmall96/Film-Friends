/* 
The code in this file is based on material from the below Udemy course
https://www.udemy.com/course/the-complete-nodejs-developer-course-2
*/

const express = require('express')
const router = new express.Router()
const Film = require('../models/film')
const auth = require('../middleware/auth')
const OMDB_API_KEY = process.env.OMDB_API_KEY

// Create a film (save film to watchlist)
router.post('/films', auth, async (req, res) => {
    const owner = req.user._id
    if (req.body.poster == 'N/A') {
        req.body.poster = 'https://res.cloudinary.com/dojzptdbc/image/upload/v1726945998/default-movie_uajvdm.png'
    }
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

// Gets film data from OMDB API
router.get('/filmData', async (req, res) => {
    const search = req.query.search
    const page = req.query.page
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${search}&page=${page}`)
        const filmResults = await response.json()
        res.send(filmResults)
    } catch (e) {
        res.send(e)
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