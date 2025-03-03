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
router.post('/data/requests', auth, async (req, res) => {
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

// Helper function used in get requests to enrich request with extra data
const enrichRequest = async (request, currentUser) => {
    const senderUser = await User.findById(request.sender)
    const recieverUser = await User.findById(request.reciever)
    const isSender = senderUser.username === currentUser.username
    const sender = {
        _id: request.sender,
        username: senderUser.username,
        image: senderUser.image
    }
    const reciever = {
        _id: request.reciever,
        username: recieverUser.username,
        image: recieverUser.image     
    }
    const enrichedRequest = {
        isSender, 
        _id: request._id, 
        sender, 
        reciever, 
        accepted: request.accepted,
        declined: request.declined,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt
    }
    return enrichedRequest
}

// Get friend requests and friends
// Returns all accepted or pending requests user has sent or has recieved
// Excludes declined requests
router.get('/data/requests', auth, async (req, res) => {
    const _id = req.user._id
    try {
        // Find all users pending and accepted friend requests
        const requests = await Request.find({$or: [{sender: _id}, {reciever: _id, declined: false}]})        
            .sort({accepted: 1, updatedAt: -1})
            .limit(req.query.limit)
            .skip(req.query.skip)
        // Use enrichRequest function to add profile data to request
        const enrichedRequests = await Promise.all(requests.map(
            request => enrichRequest(request, req.user)  
        ))
        // Filter by username if specified
        if (req.query.username){
            const username = new RegExp(`^${req.query.username.trim()}`, "i")
            const filteredByUsername = enrichedRequests.filter(
                request => request.isSender? username.test(request.reciever.username) : username.test(request.sender.username)
            )
            return res.status(200).send(filteredByUsername)
        }
        res.status(200).send(enrichedRequests)
    } catch (e) {
        res.status(400).send(e)
    }
})            

// Update request data (accept or decline)
router.patch('/data/requests/:id', auth, async (req, res) => {
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
router.delete('/data/requests/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const request = await Request.findOneAndDelete({_id:_id})
        if (!request) {
            return res.status(404).send()
        }
        res.send(request)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router