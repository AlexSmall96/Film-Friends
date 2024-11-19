/* 
The code in this file is based on material from the below Udemy course
https://www.udemy.com/course/the-complete-nodejs-developer-course-2
*/

const express = require('express')
const router = new express.Router()
const Request = require('../models/request')
const auth = require('../middleware/auth')
const User = require('../models/user')

// Create a friend request 
router.post('/requests', auth, async (req, res) => {
    // Get sender and reciever
    const sender = req.user.id
    const reciever = req.body.reciever
    // Check if it is possible to send a friend request
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
        const request = new Request({
            sender, 
            reciever
        })
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
        const requests = await Request.find({$or: [{sender: _id}, {reciever: _id, declined: false}]})        
            .sort({accepted: 1, updatedAt: -1})
            .limit(req.query.limit)
            .skip(req.query.skip)
        let fullRequests = []
        for (let request of requests) {
            const senderUser = await User.findById(request.sender)
            const recieverUser = await User.findById(request.reciever)
            fullRequests.push({
                isSender: senderUser.username === req.user.username,
                _id: request._id,
                sender: {
                    _id: request.sender,
                    username: senderUser.username,
                    image: senderUser.image
                },
                reciever: {
                    _id: request.reciever,
                    username: recieverUser.username,
                    image: recieverUser.image
                },
                accepted: request.accepted,
                declined: request.declined,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt
                })
        }
        res.status(200).send(fullRequests)
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