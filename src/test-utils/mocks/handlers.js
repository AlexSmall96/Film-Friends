import { http, HttpResponse } from "msw";
const url = 'https://film-friends.onrender.com/data'

const posters = {
    StarWars4: 'https://m.media-amazon.com/images/M/MV5BOGUwMDk0Y2MtNjBlNi00NmRiLTk2MWYtMGMyMDlhYmI4ZDBjXkEyXkFqcGc@._V1_SX300.jpg',
    StarWars1: 'https://m.media-amazon.com/images/M/MV5BNTgxMjY2YzUtZmVmNC00YjAwLWJlODMtNDBhNzllNzIzMjgxXkEyXkFqcGc@._V1_SX300.jpg',
    LOTR1:  'https://m.media-amazon.com/images/M/MV5BNzIxMDQ2YTctNDY4MC00ZTRhLTk4ODQtMTVlOWY4NTdiYmMwXkEyXkFqcGc@._V1_SX300.jpg',
	LoveActually: 'https://m.media-amazon.com/images/M/MV5BZDFlOWUxMGUtYmZmOC00ZGRlLTk4OWUtYzJhMmEwM2VjZjU5XkEyXkFqcGc@._V1_SX300.jpg',
	SpiderMan: "https://m.media-amazon.com/images/M/MV5BZWM0OWVmNTEtNWVkOS00MzgyLTkyMzgtMmE2ZTZiNjY4MmFiXkEyXkFqcGc@._V1_SX300.jpg"
}

const imdbIDs = {
	StarWars4: "tt0076759",
    StarWars1: "tt0120915",
    LOTR1: "tt0120737",
	LoveActually: 'tt0314331',
	SpiderMan: 'tt0145487'
}

const user1Films = [
	{
		Title: "The Lord of the Rings: The Fellowship of the Ring",
		Year: "2001",
		imdbID: imdbIDs.LOTR1,
		Type: "movie",
		Poster: posters.LOTR1,
		watched: true,
		public: true,
		owner: 'user1id',
		userRating: 0,
		_id: 'lotr1'				
	}, {
		Title: "Star Wars: Episode IV - A New Hope",
		Year: "1977",
		imdbID: imdbIDs.StarWars4,
		Type: "movie",
		Poster: posters.StarWars4,
		watched: false,
		public: true,
		owner: 'user1id',
		userRating: 0,
		_id: 'starwars4'
	}, {
		Title: "Star Wars: Episode I - The Phantom Menace",
		Year: "1977",
		imdbID: imdbIDs.StarWars1,
		Type: "movie",
		Poster: posters.StarWars1,
		watched: true,
		public: true,
		owner: 'user1id',
		userRating: 0,
		_id: 'starwars1'				
	}, {
		Title: "Love Actually",
		Year: "2003",
		imdbID: imdbIDs.LoveActually,
		Type: "movie",
		Poster: posters.LoveActually,
		watched: true,
		public: false,
		owner: 'user1id',
		userRating: 0,
		_id: 'loveact'				
	}
]

const user2Films = [
	{
		Title: "Love Actually",
		Year: "2003",
		imdbID: imdbIDs.LoveActually,
		Type: "movie",
		Poster: posters.LoveActually,
		watched: true,
		public: false,
		owner: 'user2id',
		userRating: 0,
		_id: 'loveact1'				
	}
]

const user3films = [
	{
		Title: "Spider-Man 1",
		Year: "2002",
		imdbID: 'spiderman1ID',
		Type: "movie",
		Poster: posters.SpiderMan,
		watched: true,
		public: false,
		owner: 'user3id',
		userRating: 0,
		_id: 'spiderman1'				
	}	
]

const user1Reqs = [
	{
		// Not accepted yet
		accepted: false,
		isSender: true,
		reciever: {
			username: 'user2'
		}
	} , {
		// No Reccomendations sent to user 3
		accepted: true,
		isSender: true,
		reciever: {
			username: 'user3'
		}
	} , {
		// All of user 1 films sent to user 4
		accepted: true,
		isSender: true,
		reciever: {
			username: 'user4'
		}
	} , {
		// No Reccomendations sent to user 5
		accepted: true,
		isSender: true,
		reciever: {
			username: 'user5'
		}
	}
]

const user2Reqs = [
	{
		accepted: true,
		isSender: true,
		reciever: {
			username: 'user3'
		}
	}
]

const user2reccs = [
	{
		film : user2Films[0],
		isSender: true,
		reciever: {
			username: 'user3'
		}
	}
]

// current users reccomendations
const user1reccs = [
	// Sent reccomendations for share modal
	// None sent to user3
	// Star Wars 4 sent to user2
	{
		film : user1Films[1],
		isSender: true,
		reciever: {
			username: 'user2'
		}
	// All user1s films sent to user4
	}, {
		film : user1Films[0],
		isSender: true,
		reciever: {
			username: 'user4'
		}
	}, {
		film : user1Films[1],
		isSender: true,
		reciever: {
			username: 'user4'
		}
	}, {
		film : user1Films[2],
		isSender: true,
		reciever: {
			username: 'user4'
		}
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

const carouselFilms = [
	{
		Title: "Star Wars: Episode IV - A New Hope",
		Year: "1977",
		imdbID: imdbIDs.StarWars4,
		Type: "movie",
		Poster: posters.StarWars4,
		watched: false,
		public: true,
		owner: 'user1id',
		userRating: 0,
		_id: 'starwars4'
	},
	{
		Title: "Spider-Man",
		Year: "1977",
		imdbID: imdbIDs.SpiderMan,
		Type: "movie",
		Poster: posters.SpiderMan,
		watched: false,
		public: true,
		owner: 'user1id',
		userRating: 0,
		_id: 'spiderman'		
	}
]

const spiderManFilms = []
for (let i=0;i<21;i++){
	const film = {
		Title: i === 0? 'Spider-Man': `Spider-Man ${i}`,
		Year: '2002',
		imdbID: i === 0? imdbIDs.SpiderMan : `spiderman${i}ID`,
		Type: 'movie',
		Poster: posters.SpiderMan		
	}
	spiderManFilms.push(film)
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

	// Get user1's films, returns either all films or only private films
	// The code to sort the user1Films array was taken from 
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
	http.get(`${url}/films/user1id`, ({request}) => {
		const ownerToken = 'user1token'
		const currentUserToken = request.headers.get('Authorization').replace('Bearer ', '')
		const url = new URL(request.url)
		const sort = url.searchParams.get('sort')
		let user1FilmsSorted = []
		if (sort === 'A-Z'){
			user1FilmsSorted = user1Films.toSorted((a, b) => {
				const titleA = a.Title.toUpperCase(); // ignore upper and lowercase
				const titleB = b.Title.toUpperCase(); // ignore upper and lowercase
				if (titleA < titleB) {
				  return -1;
				}
				if (titleA > titleB) {
				  return 1;
				}
				// names must be equal
				return 0;
			  });
		} else {
			user1FilmsSorted = user1Films
		}
		if (currentUserToken === ownerToken) {
			return HttpResponse.json({
				films: user1FilmsSorted
			}, {status: 200})
		}
		return HttpResponse.json({
			films: user1Films.filter(film => film.public)
		}, {status: 200})
	}),

	http.get(`${url}/films/user3id`, () => {
		return HttpResponse.json({films: user3films}, {status: 200})		
	}),
	// Get user2's films, returns either all films or only private films
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

	// Get all films for home page carousel and badges
	http.get(`${url}/films/`, () => {
		return HttpResponse.json(carouselFilms, {status: 200})	
	}),

	// Get current users reccomendations
	http.get(`${url}/reccomendations`, ({request}) => {
		const currentUserToken = request.headers.get('Authorization').replace('Bearer ', '')
		const user1token = 'user1token'
		const user2token = 'user2token'
		if (currentUserToken === user1token){
			return HttpResponse.json(user1reccs, {status: 200})		
		} 
		if (currentUserToken === user2token){
			return HttpResponse.json(user2reccs, {status: 200})		
		}
	}),

	// Get current users friend requests
	http.get(`${url}/requests`, ({request}) => {
		const currentUserToken = request.headers.get('Authorization').replace('Bearer ', '')
		const user1token = 'user1token'
		const user2token = 'user2token'
		if (currentUserToken === user1token){
			return HttpResponse.json(user1Reqs, {status: 200})	
		}
		if (currentUserToken === user2token){
			return HttpResponse.json(user2Reqs, {status: 200})	
		}
	}),


	// Send a reccomendation
	http.post(`${url}/reccomendations`, () => {
		return HttpResponse.json(null, {status: 200})
	}),

	http.get(`${url}/filmData/`, ({request}) => {
		const url = new URL(request.url)
		const imdbID = url.searchParams.get('imdbID')
		if (imdbID === 'tt0076759'){
			return HttpResponse.json({
				imdbID: 'tt6723592',
				Plot: "Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids..."
			}, {status: 200})
		} if (imdbID === 'tt0145487') {
			return HttpResponse.json({
				Title: 'Spider-Man',
				imdbID: 'tt0145487',
				Plot: "After being bitten by a genetically-modified spider, a shy teenager gains spider-like abilities...",
				Director: 'Sami Raimi',
				Year: '2002',
				Runtime: '121 min',
				Genre: 'Action, Adventure, Sci-Fi',
				imdb: '7.4/10',
				rt: '90%',
				mc: '73/100'
			}, {status: 200})			
		}
		else {
			return HttpResponse.json(null, {status: 200})
		}
	}),
	// Film search
	http.get(`${url}/filmSearch/`, ({request}) => {
		const url = new URL(request.url)
		const search = url.searchParams.get('search')
		const currentPage = url.searchParams.get('page')
		const startIndex = 10 * (currentPage - 1)
		const endIndex = 10 * (currentPage - 1) + 10
		if (search === "Star Wars: Episode IV - A New Hope"){
			return HttpResponse.json({
				Search: [{
					Title: "Star Wars: Episode IV - A New Hope",
					Year: "1977",
					imdbID: "tt0076759",
					Type: "movie",
					Poster: 'N/A'
				}],
				totalResults: "1",
				Response: "True"
			}, {status: 200})		
		}
		if (search === 'Spider-Man'){
			return HttpResponse.json({
				Search: currentPage? spiderManFilms.slice(startIndex, endIndex): spiderManFilms.slice(0, 10) ,
				totalResults: spiderManFilms.length,
				Response: "True"
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