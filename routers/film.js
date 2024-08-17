const express = require('express')
const router = new express.Router()
const Film = require('../models/film')

// Create a film (save film to watchlist)
router.post('/films', async (req, res) => {
    const film = new Film(req.body)
    try {
        await film.save()
        res.status(201).send({ film })
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router