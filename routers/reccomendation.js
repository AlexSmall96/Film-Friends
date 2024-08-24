const express = require('express')
const router = new express.Router()
const Reccomendation = require('../models/reccomendation')
const Film = require('../models/film')
const Request = require('../models/request')
const auth = require('../middleware/auth')

// Create a reccomendation (send reccomendation to friend)
router.post('/reccomendations', auth, async (req, res) => {
    try {
        const filmId = req.body.film
        const film = await Film.findById(filmId)
        if (film.owner.toString()!== req.user.id){
            return res.status(400).send({error: "You can't reccomend a film you haven't saved."})
        }
        const reciever = req.body.reciever
        const friendRequest = await Request.findOne({sender: req.user._id, reciever, accepted: true})
        if (!friendRequest){
            return res.status(400).send({error: "You can't send a reccomendation to this user because you are not friends."})
        }
        const reccomendation = new Reccomendation(req.body)
        await reccomendation.save()
        res.status(201).send({ reccomendation })
    } catch (e) {
        res.status(400).send(e)
    }
})

// Get all reccomendations
router.get('/reccomendations', auth, async (req, res) => {
    const _id = req.user._id
    try {
        const reccomendations = await Reccomendation.find({reciever:_id})
            .sort({updatedAt: -1})
            .limit(req.query.limit)
            .skip(req.query.skip)
        res.status(200).send({reccomendations}) 
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router