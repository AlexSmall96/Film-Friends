const express = require('express')
const router = new express.Router()
const Request = require('../models/request')
const auth = require('../middleware/auth')

// Create a friend request
router.post('/requests', auth, async (req, res) => {
    const sender = req.user.id
    const reciever = req.body.reciever
    try {
        if (reciever === sender) {
            return res.status(400).send({error: "You can't send a friend request to yourself."})
        }
        const existingRequest = await Request.find({sender, reciever})
        if (existingRequest.length) {
            return res.status(400).send({error: "You've already sent a friend request to this user."})
        }
        const reverseRequest = await Request.find({sender:reciever, reciever: sender}) 
        if (reverseRequest.length) {
            return res.status(400).send({error: "This user has already sent you a friend request."})
        }
        const request = new Request({sender, reciever, ...req.body})
        await request.save()
        res.status(201).send({ request })
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router