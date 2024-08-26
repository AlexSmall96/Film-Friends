const mongoose = require('mongoose')

const recSchema = new mongoose.Schema({
    film: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Film'
    },
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
    liked: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        default: "Hey! Check out this awesome film I've just watched. I think you'll love it!"
    },
    comment: {
        type: String,
    }
}, {timestamps: true})

const Reccomendation = mongoose.model('Reccomendation', recSchema)

module.exports = Reccomendation