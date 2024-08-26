/* 
The code in this file is based on material from the below Udemy course
https://www.udemy.com/course/the-complete-nodejs-developer-course-2
*/

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

// Get friend requests and friends
// Returns all accepted or pending requests user has sent or has recieved
// Excludes declined requests
router.get('/requests', auth, async (req, res) => {
    const _id = req.user._id
    try {
        const requests = await Request.find({$or: [{sender: _id, declined: false}, {reciever: _id, declined: false}]})        
            .sort({accepted: 1, updatedAt: -1})
            .limit(req.query.limit)
            .skip(req.query.skip)
        res.status(200).send({requests})
    } catch (e) {
        res.status(400).send(e)
    }
})

// Update request data (accept or decline)
router.patch('/requests/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const request = await Request.findOneAndUpdate({_id, reciever: req.user._id}, req.body, {new: true, runValidators: true})
        if (!request) {
            return res.status(404).send()
        }
        res.send(request)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Delete request
router.delete('/requests/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const request = await Request.findOneAndDelete({_id:_id, sender: req.user._id})
        if (!request) {
            return res.status(404).send()
        }
        res.send(request)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router