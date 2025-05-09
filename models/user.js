/* 
The code in this file is based on material from the below Udemy course
https://www.udemy.com/course/the-complete-nodejs-developer-course-2
*/

const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET
const Film = require('./film')

// Define User model
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number.')
            }
        }
    },
    image:{
        type: String,
        default: 'https://res.cloudinary.com/dojzptdbc/image/upload/v1744633674/defaultProfile_fjp9f4.png'
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {timestamps: true})

// Virtual field for Film owned by User
userSchema.virtual('films', {
    ref: 'Film',
    localField: '_id',
    foreignField: 'owner'
})

// Virtual field for requests sent to/from User
userSchema.virtual('requests', {
    ref: 'Request',
    localField: '_id',
    foreignField: ['sender', 'reciever']
})

// Virtual field for reccomenations
userSchema.virtual('reccomendations', {
    ref: 'Reccomendation',
    localField: '_id',
    foreignField: 'reciever'
})

// Filters the user data to hide private data from response
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}

// Genereate authentication token when logging in or signing up
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

// Method to find user by email and password
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email: email})
    if (!user) {
        throw new Error('Unable to login.')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to login.')
    }
    return user
}

// Method to hash passwords when user is created or password is changed
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User