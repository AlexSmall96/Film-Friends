import { http, HttpResponse } from "msw";
const url = 'http://localhost:3001'

export const handlers = [
    // sign up - mock valid sign up data
    http.post(`${url}/users`, () => {
      return HttpResponse.json(null, {status: 201})
    }),
    // login - mock valid sign up data
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
    // logout
    http.post(`${url}/users/logout`, () => {
      return HttpResponse.json(null, {status: 200})
    }),
    // get film data from OMDB API
    http.get(`${url}/filmData/`, () => {
      return HttpResponse.json({
        Search: [
                  {
                  Title: "Star Wars: Episode IV - A New Hope",
                  Year: "1977",
                  imdbID: "tt0076759",
                  Type: "movie",
                  Poster: 'N/A'
                  },
                  {
                  Title: "Star Wars: Episode V - The Empire Strikes Back",
                  Year: "1980",
                  imdbID: "tt0080684",
                  Type: "series",
                  Poster: "https://m.media-amazon.com/images/M/MV5BYmU1NDRjNDgtMzhiMi00NjZmLTg5NGItZDNiZjU5NTU4OTE0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg"
                  },
                  {
                  Title: "Star Wars: Episode VI - Return of the Jedi",
                  Year: "1983",
                  imdbID: "tt0086190",
                  Type: "game",
                  Poster: "https://m.media-amazon.com/images/M/MV5BOWZlMjFiYzgtMTUzNC00Y2IzLTk1NTMtZmNhMTczNTk0ODk1XkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_SX300.jpg"
                  },
                  ],
                  totalResults: "3",
                  Response: "True"
        }, {status: 200})
    }),
    // get user data
    http.get(`${url}/users/:id`, () => {
      return HttpResponse.json({
        profile : {

        },
        films: [
          {imdbID:'tt0076759'}
        ]
      }, {status: 200})
    }),
    
    // save a film
    http.post(`${url}/films`, ({request}) => {
      return HttpResponse.json(null, {status: 201})
    })
] 