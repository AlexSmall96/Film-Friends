import { http, HttpResponse } from "msw";
const url = 'https://film-friends.onrender.com/data'

// Import film data
import { 
	user1Films, 
	user2Films, 
	user3films, 
	carouselFilms, 
	spiderManFilms, 
	starWarsPreview, 
	omdbData, 
	user1Reqs, 
	user2Reqs, 
	user1Reccs, 
	user2Reccs, 
	user2Profile,
    user3Profile,
	matchingUsers,
	paginatedReqs
} from './data'


export const handlers = [
    // /users
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
		return HttpResponse.json(user2Profile, {status: 200})
	}),
	// Get profile data
	http.get(`${url}/users/user3id`, () => {
		return HttpResponse.json(user3Profile, {status: 200})
	}),
    // /films
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
    // Get user3s films
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
	http.get(`${url}/filmData/`, ({request}) => {
		const url = new URL(request.url)
		const imdbID = url.searchParams.get('imdbID')
		if (imdbID === 'tt0076759'){
			return HttpResponse.json({
				imdbID: 'tt6723592',
				Plot: "Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids..."
			}, {status: 200})
        
		} if (imdbID === 'spiderman1ID') {
			return HttpResponse.json(omdbData.spiderman1, {status: 200})			
		} if (imdbID === 'tt1457767') {
            return HttpResponse.json(omdbData.conjuring, {status: 200})	
        } if (imdbID === 'tt6723592'){
            return HttpResponse.json(omdbData.tenet, {status: 200})	
        } if (imdbID === 'tt0314331'){
            return HttpResponse.json(omdbData.LoveActually, {status: 200})	
        } if (imdbID === 'tt0145487'){
            return HttpResponse.json(omdbData.spiderman, {status: 200})	
        } else {
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
				Search: [starWarsPreview],
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
	}),

    // /reccomendations
	// Get current users reccomendations
	http.get(`${url}/reccomendations`, ({request}) => {
		const currentUserToken = request.headers.get('Authorization').replace('Bearer ', '')
		const user1token = 'user1token'
		const user2token = 'user2token'
		if (currentUserToken === user1token){
			return HttpResponse.json(user1Reccs, {status: 200})		
		} 
		if (currentUserToken === user2token){
			return HttpResponse.json(user2Reccs, {status: 200})		
		}
	}),

	// Send a reccomendation
	http.post(`${url}/reccomendations`, () => {
		return HttpResponse.json(null, {status: 200})
	}),

    // /requests
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
		} if (currentUserToken === 'alextoken'){
			return HttpResponse.json(paginatedReqs, {status: 200})	
		} else {
            return HttpResponse.json([], {status: 200})
        }
	}),

	// search for users
	http.get(`${url}/users`, ({request}) => {
		const url = new URL(request.url)
		const search = url.searchParams.get('username')
		if (search === 'user'){
			return HttpResponse.json(matchingUsers, {status: 200})	
		}
	})
]