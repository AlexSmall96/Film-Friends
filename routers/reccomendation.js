/* 
The code in this file is based on material from the below Udemy course
https://www.udemy.com/course/the-complete-nodejs-developer-course-2
*/

const express = require('express')
const router = new express.Router()
const Reccomendation = require('../models/reccomendation')
const Film = require('../models/film')
const Request = require('../models/request')
const auth = require('../middleware/auth')
const User = require('../models/user')

// Create a reccomendation (send reccomendation to friend)
router.post('/data/reccomendations', auth, async (req, res) => {
    try {
        const filmId = req.body.film
        const film = await Film.findById(filmId) 
        if (film.owner.toString()!== req.user.id){
            return res.status(400).send({error: "You can't reccomend a film you haven't saved."})
        }
        if (!film.public) {
            return res.status(400).send({error: "Please mark this film as public before you reccomend it to others."})
        }
        const reciever = req.body.reciever
        const friendRequest = await Request.findOne({$or:[{sender: req.user._id, reciever, accepted: true}, {sender: reciever, reciever: req.user._id, accepted: true}]})
        if (!friendRequest){
            return res.status(400).send({error: "You can't send a reccomendation to this user because you are not friends."})
        }
        const reccomendation = new Reccomendation({sender: req.user._id, ...req.body})
        await reccomendation.save()
        res.status(201).send({ reccomendation })
    } catch (e) {
        res.status(400).send(e)
    }
})

// Get all reccomendations
router.get('/data/reccomendations', auth, async (req, res) => {
    const _id = req.user._id
    try {
        const reccomendations = await Reccomendation.find({$or: [{reciever:_id}, {sender:_id}]})
            .sort({updatedAt: -1})
            let fullReccomendations = []
            for (let rec of reccomendations) {
                const senderUser = await User.findById(rec.sender)
                const recieverUser = await User.findById(rec.reciever)
                const film = await Film.findById(rec.film)
                fullReccomendations.push({
                    film,
                    isSender: senderUser.username === req.user.username,
                    _id: rec._id,
                    sender: {
                        _id: rec.sender,
                        username: senderUser.username,
                        image: senderUser.image
                    },
                    reciever: {
                        _id: rec.reciever,
                        username: recieverUser.username,
                        image: recieverUser.image
                    },
                    liked: rec.liked,
                    message: rec.message,
                    createdAt: rec.createdAt,
                    updatedAt: rec.updatedAt
                    })
            }
        res.status(200).send({fullReccomendations}) 
    } catch (e) {
        res.status(400).send(e)
    }
})

// Update a reccomendation (comment or like)
router.patch('/data/reccomendations/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const reccomendation = await Reccomendation.findOneAndUpdate({_id, reciever: req.user._id}, req.body, {new: true, runValidators: true})
        if (!reccomendation) {
            return res.status(404).send()
        }
        res.send(reccomendation)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Delete a reccomendation
router.delete('/data/reccomendations/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const reccomendation = await Reccomendation.findById(_id)
        if (!reccomendation) {
            return res.status(404).send()
        }
        if (reccomendation.reciever.toString() !== req.user.id) {
            return res.status(404).send()
        }
        await Reccomendation.findOneAndDelete({_id:_id})
        res.send(reccomendation)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router