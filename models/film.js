/* 
The code in this file is based on material from the below Udemy course
https://www.udemy.com/course/the-complete-nodejs-developer-course-2
*/

const mongoose = require('mongoose')

const filmSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    imdbID: {
        type: String,
        trim: true,
    },
    poster: {
       type:String,
    },
    year: {
        type: String
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
        default: 0,
        validate(value) {
            if (value < 0 || value > 5) {
                throw new Error('Rating must be between 0 and 5.')
            }
        }
    },
    notes: {
        type: String,
        default: ''
    }
}, {timestamps: true})

// Virtual field for Film used in reccomendation
filmSchema.virtual('reccomendations', {
    ref: 'Reccomendation',
    localField: '_id',
    foreignField: 'film'
})

const Film = mongoose.model('Film', filmSchema)

module.exports = Film