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