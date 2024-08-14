const mongoose = require('mongoose')

const filmSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    imdbID: {
        type: String,
        unique: true,
        trim: true
    },
    watched: {
        type: Boolean,
        default: false
    },
    public: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    userRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    notes: {
        type: String,
    }
})

const Film = mongoose.model('Film', filmSchema)

module.exports = Film