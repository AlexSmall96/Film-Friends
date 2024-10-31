/* 
The code in this file is based on material from the below Udemy course
https://www.udemy.com/course/the-complete-nodejs-developer-course-2
*/

const mongoose = require('mongoose')

// Define Request model
const requestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    reciever: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    senderUsername: {
        type: String,
        required: true
    },
    recieverUsername: {
        type: String,
        required: true
    },
    senderImage: {
        type: String,
        default: 'https://res.cloudinary.com/dojzptdbc/image/upload/v1687104476/default_profile_k3tfhd.jpg'
    },
    recieverImage: {
        type: String,
        default: 'https://res.cloudinary.com/dojzptdbc/image/upload/v1687104476/default_profile_k3tfhd.jpg'
    },
    accepted: {
        type: Boolean,
        default: false
    },
    declined: {
        type: Boolean,
        default: false
    },
}, {timestamps: true})

// Virtual field for Reccomendation based on request
requestSchema.virtual('reccomendations', {
    ref: 'Reccomendation',
    localField: '_id',
    foreignField: 'request'
})

const Request = mongoose.model('Request', requestSchema)

module.exports = Request