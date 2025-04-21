/* 
The code in this file is based on material from the below Udemy course
https://www.udemy.com/course/the-complete-nodejs-developer-course-2
*/

const express = require('express')
const router = new express.Router()
const Film = require('../models/film')
const auth = require('../middleware/auth')
const Reccomendation = require('../models/reccomendation')
const OMDB_API_KEY = process.env.OMDB_API_KEY

// Create a film (save film to watchlist)
router.post('/data/films', auth, async (req, res) => {
    const owner = req.user._id
    let Poster
    let cleansedData = req.body
    Object.keys(cleansedData).forEach((key, value) => {
        if (key === Poster && value === 'N/A'){
            cleansedData[key] = 'https://res.cloudinary.com/dojzptdbc/image/upload/v1726945998/default-movie_uajvdm.png'
        } else if (value === 'N/A'){
            cleansedData[key] = null
        }
    })
    try {
        const film = new Film({owner, ...cleansedData})
        await film.save()
        res.status(201).send({ film })
    } catch (e) {
        res.status(400).send(e)
    }
})

// Get a users films
router.get('/data/films/:id', auth, async (req, res) => {
    const routerId = req.params.id
    const sortObj = req.query.sort === 'A-Z' ? ({Title: 1, updatedAt: -1}):({updatedAt: -1})
    try {
        let films = await Film.find({owner: routerId})
            .sort(sortObj)
            .limit(req.query.limit)
            .skip(req.query.skip)
        if (req.user.id !== routerId) {
            films = films.filter(film => film.public === true)
        }
        res.status(200).send({ films })
    } catch (e) {
        res.status(400).send(e)
    }
})

// Get all films
router.get('/data/films/', async (req, res) => {
    try {
        const films = await Film.aggregate([
            { $group: { _id: "$imdbID", film: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$film" } },
            { $limit: parseInt(req.query.limit) },
            { $sort: {updatedAt: -1, userRating: 1} }
        ]);
        res.status(200).send(films)
    } catch (err){
        res.status(500).send(err)
    }
})

// Gets film search results from OMDB API
router.get('/data/filmSearch', async (req, res) => {
    const search = req.query.search
    const page = req.query.page
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${search}&page=${page}`)
        const filmResults = await response.json()
        const cleansedSearchList = filmResults.Search.map((film) => {
            if (film.Poster === 'N/A'){
                const Poster = 'https://res.cloudinary.com/dojzptdbc/image/upload/v1726945998/default-movie_uajvdm.png'
                return {...film, Poster}
            }
            return {...film} 
        })
        res.send({...filmResults, Search:cleansedSearchList})
    } catch (e) {
        res.send(e)
    }
})

// Gets data for a single film from OMDB API and users rating / watched data
router.get('/data/filmData', async (req, res) => {
    const imdbID = req.query.imdbID
    const _id = req.query.databaseID
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbID}`)
        const filmData = await response.json()
        const ratings = filmData.Ratings
        const imdb = ratings.filter(rating => rating.Source === 'Internet Movie Database')[0]?.Value || null
        const rt = ratings.filter(rating => rating.Source === 'Rotten Tomatoes')[0]?.Value || null
        const mc = ratings.filter(rating => rating.Source === 'Metacritic')[0]?.Value || null
        if (_id) {
            const savedFilm = await Film.findOne({imdbID, _id})
            const userRating = savedFilm.userRating
            const watched = savedFilm.watched
            const public = savedFilm.public
            return res.send({userRating, watched, public, imdb, rt, mc, ...filmData})
        }
    return res.send({imdb, rt, mc, ...filmData})
    } catch (e) {
        res.send(e)
    }
})

// Update film data
router.patch('/data/films/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const film = await Film.findOneAndUpdate({_id, owner: req.user._id}, req.body, {new: true, runValidators: true})
        if (!film) {
            return res.status(404).send()
        }
        res.send(film)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Delete film
router.delete('/data/films/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const film = await Film.findOneAndDelete({_id:_id, owner: req.user._id})
        if (!film) {
            return res.status(404).send()
        }
        await Reccomendation.deleteMany({film : film._id})
        res.send(film)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router