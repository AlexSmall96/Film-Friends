import { http, HttpResponse } from "msw";
const url = 'http://localhost:3001'

const user2Films = [
	{
		Title: "Star Wars: Episode IV - A New Hope",
		Year: "1977",
		imdbID: "tt0076759",
		Type: "movie",
		Poster: 'N/A',
		watched: false,
		public: true,
		owner: 'user2id',
		userRating: 0
	}, {
		Title: "Star Wars: Episode I - The Phantom Menace",
		Year: "1977",
		imdbID: "tt0120915",
		Type: "movie",
		Poster: 'https://m.media-amazon.com/images/M/MV5BNTgxMjY2YzUtZmVmNC00YjAwLWJlODMtNDBhNzllNzIzMjgxXkEyXkFqcGc@._V1_SX300.jpg',
		watched: true,
		public: true,
		owner: 'user2id',
		userRating: 0					
	}, {
		Title: "The Lord of the Rings: The Fellowship of the Ring",
		Year: "2001",
		imdbID: "tt0120737",
		Type: "movie",
		Poster: 'https://m.media-amazon.com/images/M/MV5BNzIxMDQ2YTctNDY4MC00ZTRhLTk4ODQtMTVlOWY4NTdiYmMwXkEyXkFqcGc@._V1_SX300.jpg',
		watched: true,
		public: false,
		owner: 'user2id',
		userRating: 0						
	}
]
const resultsArray = []
for (let i=0;i<21;i++) {
	let film = {
		Title: `film ${i}`,
		Year: '1996',
		imdbID: `film${i}ID`,
		Type: 'movie',
		Poster: 'N/A'
	}
	resultsArray.push(film)
}

export const handlers = [
	// Sign up
    http.post(`${url}/users`, () => {
		return HttpResponse.json(null, {status: 201})
	}),
	// login
	http.post(`${url}/users/login`, () => {
		return HttpResponse.json({
			user: {
				username: 'user one',
				_id: '123'
		  	},
		  	token: 'useronetoken'
		}, {status: 200})
	}),
	// check if token is still valid
	http.get(`${url}/users/token`, () => {
		return HttpResponse.json(null, {status: 200})
	}),
	// Logout
	http.post(`${url}/users/logout`, () => {
		return HttpResponse.json(null, {status: 200})
	}),
	// Get profile data
	http.get(`${url}/users/user2id`, () => {
		return HttpResponse.json({
			profile : {
				username: 'user two',
				age: 0,
				email: 'usertwo@email.com',
				image: 'https://res.cloudinary.com/dojzptdbc/image/upload/v1687104476/default_profile_k3tfhd.jpg'
			}, 
		}, {status: 200})
	}),

	// Get a users films, returns either all films or only private films
	http.get(`${url}/films/user2id`, ({request}) => {
		const ownerToken = 'user2token'
		const currentUserToken = request.headers.get('Authorization').replace('Bearer ', '')
		if (currentUserToken === ownerToken) {
			return HttpResponse.json({
				films: user2Films
			}, {status: 200})
		}
		return HttpResponse.json({
			films: user2Films.filter(film => film.public)
		}, {status: 200})
	}),

	// Film search
	http.get(`${url}/filmSearch/`, ({request}) => {
		const url = new URL(request.url)
		const search = url.searchParams.get('search')
		if (search === 'star wars') {
			return HttpResponse.json({
				Search: [{
					Title: "Star Wars: Episode IV - A New Hope",
					Year: "1977",
					imdbID: "tt0076759",
					Type: "movie",
					Poster: 'N/A'
				}, {
					Title: "Star Wars: Episode V - The Empire Strikes Back",
					Year: "1980",
					imdbID: "tt0080684",
					Type: "series",
					Poster: "https://m.media-amazon.com/images/M/MV5BYmU1NDRjNDgtMzhiMi00NjZmLTg5NGItZDNiZjU5NTU4OTE0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg"
				}, {
					Title: "Star Wars: Episode VI - Return of the Jedi",
					Year: "1983",
					imdbID: "tt0086190",
					Type: "game",
					Poster: "https://m.media-amazon.com/images/M/MV5BOWZlMjFiYzgtMTUzNC00Y2IzLTk1NTMtZmNhMTczNTk0ODk1XkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_SX300.jpg"
			}],
				totalResults: "3",
				Response: "True"
			}, {status: 200})
		} 
		if (search === 'the') {
			return HttpResponse.json({
				Response: "False",
				Error: "Too many results."
			}, {status: 200}) 
		}
		if (search === 'starwars2') {
			return HttpResponse.json({
				Response: "False",
				Error: 'Movie not found!'
			}, {status: 200})
		} 
		if (search === 'film') {
			const currentPage = url.searchParams.get('page')
			const startIndex = 10 * (currentPage - 1)
			const endIndex = 10 * (currentPage - 1) + 10
			return HttpResponse.json({
				Search: resultsArray.slice(startIndex, endIndex),
				totalResults: 20,
				Response: true
			}, {status: 200})
		} else {
			return HttpResponse.json(null, {status: 200})
		}
	}),

	// Save a film
	http.post(`${url}/films`, () => {
		return HttpResponse.json(null, {status: 201})
	})
]