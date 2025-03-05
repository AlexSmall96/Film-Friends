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

// Helper function used in get reccomendations to enrich reccomendation with extra data
const enrichReccomendation = async (rec, currentUser) => {
    const senderUser = await User.findById(rec.sender)
    const recieverUser = await User.findById(rec.reciever)
    const isSender = senderUser.username === currentUser.username
    const sender = {
        _id: rec.sender,
        username: senderUser.username,
        image: senderUser.image
    }
    const reciever = {
        _id: rec.reciever,
        username: recieverUser.username,
        image: recieverUser.image     
    }
    const enrichedReccomendation = {
        isSender, 
        _id: rec._id, 
        sender, 
        reciever, 
        liked: rec.liked,
        message: rec.message,
        createdAt: rec.createdAt,
        updatedAt: rec.updatedAt
    }
    return enrichedReccomendation
}

// Get all reccomendations
router.get('/data/reccomendations', auth, async (req, res) => {
    const _id = req.user._id
    try {
        // Find all users sent or recieved reccomendations
        const reccomendations = await Reccomendation.find({$or: [{reciever:_id}, {sender:_id}]})
            .sort({updatedAt: -1})
        // Use enrichReccomendation function to add profile data to reccomendation
        const enrichedReccomendations = await Promise.all(reccomendations.map(
            rec => enrichReccomendation(rec, req.user)  
        ))
        res.status(200).send(enrichedReccomendations) 
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