// Film data
const posters = {
    StarWars4: 'https://m.media-amazon.com/images/M/MV5BOGUwMDk0Y2MtNjBlNi00NmRiLTk2MWYtMGMyMDlhYmI4ZDBjXkEyXkFqcGc@._V1_SX300.jpg',
    StarWars1: 'https://m.media-amazon.com/images/M/MV5BNTgxMjY2YzUtZmVmNC00YjAwLWJlODMtNDBhNzllNzIzMjgxXkEyXkFqcGc@._V1_SX300.jpg',
    LOTR1:  'https://m.media-amazon.com/images/M/MV5BNzIxMDQ2YTctNDY4MC00ZTRhLTk4ODQtMTVlOWY4NTdiYmMwXkEyXkFqcGc@._V1_SX300.jpg',
	LoveActually: 'https://m.media-amazon.com/images/M/MV5BZDFlOWUxMGUtYmZmOC00ZGRlLTk4OWUtYzJhMmEwM2VjZjU5XkEyXkFqcGc@._V1_SX300.jpg',
	SpiderMan: "https://m.media-amazon.com/images/M/MV5BZWM0OWVmNTEtNWVkOS00MzgyLTkyMzgtMmE2ZTZiNjY4MmFiXkEyXkFqcGc@._V1_SX300.jpg",
	Conjuring:  "https://m.media-amazon.com/images/M/MV5BMTM3NjA1NDMyMV5BMl5BanBnXkFtZTcwMDQzNDMzOQ@@._V1_SX300.jpg",
	Tenet: "https://m.media-amazon.com/images/M/MV5BMTU0ZjZlYTUtYzIwMC00ZmQzLWEwZTAtZWFhMWIwYjMxY2I3XkEyXkFqcGc@._V1_SX300.jpg"
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
		public: true,
		owner: 'user3id',
		userRating: 0,
		_id: 'spiderman1'				
	}, {
		Title: 'The Conjuring',
		Year: '2013',
		imdbID: 'tt1457767',
		Type: 'movie',
		Poster: posters.Conjuring,
		watched: true,
		public: true,
		owner: 'user3id',
		userRating: 0,
		_id: 'conjuring'		
	}, {
		Title: 'Tenet',
		Year: '2020',
		imdbID: 'tt6723592',
		Type: 'movie',
		Poster: posters.Tenet,
		watched: true,
		public: false,
		owner: 'user3id',
		userRating: 0,
		_id: 'tenet'		
	}, {
		Title: 'Love Actually',
		Year: '2003',
		imdbID: 'tt0314331',
		Type: 'Movie',
		Poster: posters.LoveActually,
		watched: false,
		publiic: false,
		owner: 'user3id',
		userRating: 0,
		_id: 'loveactually3'		
	}
]

const omdbData = {
    spiderman: {
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
    },
	spiderman1: {
		Title: "Spider-Man 1",
		Year: "2002",
		imdbID: 'spiderman1ID',
		Type: "movie",
		Poster: posters.SpiderMan,
		Plot: 'After being bitten by a genetically-modified spider, a shy teenager gains spider-like abilities...',
		Director: 'Sam Raimi',
		Runtime: '121 min',
		Genre: "Action, Adventure, Sci-Fi",	
		watched: false,
		public: true,
		userRating: 0
	}, 
	conjuring: {
		Title: 'The Conjuring',
		Year: '2013',
		imdbID: 'tt1457767',
		Type: 'movie',
		Poster: posters.Conjuring,	
		Plot: 'Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse.',
		Director: 'James Wan',
		Runtime: "112 min",
		Genre: 'Horror, Mystery, Thriller'
	}, 
	tenet: {
		Title: 'Tenet',
		Year: '2020',
		imdbID: 'tt6723592',
		Type: 'movie',
		Poster: posters.Tenet,
		Plot: 'Armed with only the word Tenet, and fighting for the survival of the entire world...',
		Director: 'Christopher Nolan',
		Runtime: '150 min',
		Genre: "Action, Sci-Fi, Thriller" 		
	}, 
	LoveActually: {
		Title: 'Love Actually',
		Year: '2003',
		imdbID: 'tt0314331',
		Type: 'Movie',
		Poster: posters.LoveActually,	
		Plot: 'Follows the lives of eight very different couples in dealing with their love lives...',
		Director: 'Richard Curtis',
		Runtime: '135 min',
		Genre: "Comedy, Drama, Romance" 	
	}	
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

const starWarsPreview = {
    Title: "Star Wars: Episode IV - A New Hope",
    Year: "1977",
    imdbID: "tt0076759",
    Type: "movie",
    Poster: posters.StarWars4
}

// Reccomendation data
const user1Reccs = [
	{film : user1Films[1], isSender: true, reciever: {username: 'user2'}}, 
    {film : user1Films[0], isSender: true, reciever: {username: 'user4'}}, 
    {film : user1Films[1], isSender: true, reciever: {username: 'user4'}}, 
    {film : user1Films[2], isSender: true, reciever: {username: 'user4'}}
]

// User data
const defaultProfileImage = 'https://res.cloudinary.com/dojzptdbc/image/upload/v1687104476/default_profile_k3tfhd.jpg'
const changedImage = 'https://res.cloudinary.com/dojzptdbc/image/upload/v1744801354/my-profile/trebppi1l7ssjmypwsk0.png'

const user2Profile = {
    profile : {username: 'user two', age: 0, email: 'usertwo@email.com', image: defaultProfileImage} 
}

const user3Profile = {
    profile : {username: 'user3', age: 0, email: 'user3@email.com', image: defaultProfileImage} 
}

const matchingUsers = [
	{username: 'user2', image:defaultProfileImage, _id: 'user2id'},
	{username: 'user3', image:defaultProfileImage, _id: 'user3id'},
	{username: 'user4', image:defaultProfileImage, _id: 'user4id'},
	{username: 'user5', image:defaultProfileImage, _id: 'user5id'},
	{username: 'user6', image:changedImage, _id: 'user6id'}
]

// Request data
const user1Reqs = [
	{accepted: false, isSender: true, reciever: {username: 'user2', _id: 'user2id', image:defaultProfileImage}, updatedAt: "2025-04-25T10:18:51.976Z"}, 
    {accepted: true, isSender: true, reciever: {username: 'user3', _id: 'user3id', image:defaultProfileImage}, updatedAt: "2024-04-25T10:18:51.976Z"}, 
    {accepted: true, isSender: true, reciever: {username: 'user4', _id: 'user4id', image:defaultProfileImage}, updatedAt: "2023-04-25T10:18:51.976Z"}, 
    {accepted: true, isSender: true, reciever: {username: 'user5', _id: 'user5id', image:defaultProfileImage}, updatedAt: "2022-04-25T10:18:51.976Z"},
	{accepted: false, isSender: false, sender: {username: 'sender1', _id: 'sender1id', image:changedImage}, updatedAt: "2021-04-25T10:18:51.976Z"}
]

const user2Reqs = [
    {accepted: true, isSender: true, reciever: {username: 'user3'}}
]

const paginatedReqs = []
for (let i = 0; i < 20; i++){
	const request = {
		accepted: true, 
		isSender: true, 
		reciever: {username: `friend ${String.fromCharCode(97 + i)}`, _id: `friend${i}id`, image:defaultProfileImage}
	}
	paginatedReqs.push(request)
} 

const user2Reccs = [
	{film : user2Films[0], isSender: true, reciever: {username: 'user3'}}
]

export { 
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
}