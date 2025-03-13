import React, { useEffect, useState } from 'react';
import {Button, Container, Row, Col, Spinner, Image} from 'react-bootstrap'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import FilmPreview from '../../components/FilmPreview';
import Film from './Film'
import Filters from './Filters';
import { useCurrentFilm } from '../../contexts/CurrentFilmContext';
import { useSaveFilmContext } from '../../contexts/SaveFilmContext';
import { FilmPreviewProvider } from '../../contexts/FilmPreviewContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const FilmsPage = () => {
    const { id } = useParams()
    const history = useHistory()
    const { currentUser } = useCurrentUser()
    const { currentFilmIds, setCurrentFilmIds, viewingData, setViewingData, omdbData, setOmdbData, isOwner, setIsOwner, setUsername, username } = useCurrentFilm()
    const {updated} = useSaveFilmContext()
    const [allFilms, setAllFilms] = useState([])
    const [filmStats, setFilmStats] = useState({savedCount: 0, watchedCount: 0})
    const [genreCounts, setGenreCounts] = useState({})
    const [directorCounts, setDirectorCounts] = useState({})
    const [filteredFilms, setFilteredFilms] = useState([])
    const [profile, setProfile] = useState({})
    const [similarity, setSimilarity] = useState('')
    const [sort, setSort] = useState('Last Updated')
    const [filter, setFilter] = useState({
        public: true,
        watched: 'All'
    })
    const [hasLoaded, setHasLoaded] = useState(false)
    const [currentUsersFilmIds, setCurrentUsersFilmIds] = useState([])

    // Helper functions for loading data
    // Check if a film matches current criteria specified by filters
    const checkFilm = (film) => {
        return (
            film.public === filter.public
        ) && (
            filter.watched === 'All'? true: filter.watched === 'Watched'? film.watched: !film.watched
        )
    }
    // Gets the average ratings for a director or genre across users all public and watched films
    const getAverageRatings = (publicWatchedFilms, name, bool) => {
        // If bool is true, top genres are found, otherwise directors.
        const matchingFilms = publicWatchedFilms.filter(film => bool? film.Genre.includes(name) : film.Director.includes(name) )
        const total = matchingFilms.reduce((acc, curr) => {
            acc = acc + curr.userRating
            return acc
        }, 0)
        const avg = total / matchingFilms.length
        return [name, avg]
    }

    // Gets the genres or directors from uers public and watched films and calls getAverageRatings to get the top 3 highest rated
    const getTopThree = (publicWatchedFilms, bool) => {
        // If bool is true, top genres are found, otherwise directors.
        const data = publicWatchedFilms.map(film => bool? film.Genre : film.Director)
        let processedData = data
        if (bool){
            const splitData = data.map(name => name.split(',').map(word => word.trim()))
            processedData = splitData.reduce((acc, curr) => {
                acc = acc.concat(curr)
                return acc
            }, [])
        }
        const uniqueData = [...new Set(processedData)]
        const averageRatings = uniqueData.map((name) => getAverageRatings(publicWatchedFilms, name, bool))
        const topThree = averageRatings.sort(([, countA], [, countB]) => countB - countA).slice(0,3)
        return topThree
    }

    // Functions that retrieve or update film list when film data is changed
    useEffect(() => {
        // Get users films for film list
        const fetchProfileAndFilms = async () => {
            // Get all films
            const response = await axiosReq.get(`/films/${id}/?sort=${sort}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            const fullResponse = response.data.films
            // Filter films based on current filter using checkFilm function
            const filteredResponse = await response.data.films.filter(film => checkFilm(film))
            setAllFilms(fullResponse)
            setFilteredFilms(filteredResponse)
            // Get film stats - watched count and saved count
            setFilmStats({
                savedCount: fullResponse.filter(film => film.public).length,
                watchedCount: fullResponse.filter(film => film.public && film.watched).length
            })
            // Filter to public and watched films to calculate average ratings for directors and genres
            const publicWatchedFilms = fullResponse.filter(film => film.watched && film.public)
            // Call getTopThree function to calculate average ratings
            setGenreCounts(getTopThree(publicWatchedFilms, true))
            setDirectorCounts(getTopThree(publicWatchedFilms, false))
            // Initialise current film ids for main film view
            if (currentFilmIds?.imdbID === '' && filteredResponse.length) {
                setCurrentFilmIds({imdbID: filteredResponse[0].imdbID, database:filteredResponse[0]._id})
            }
            // Get profile data and similarity score
            const profileResponse = await axiosReq.get(`/users/${id}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            setProfile(profileResponse.data.profile)
            setSimilarity(isOwner? '' : profileResponse.data.similarity)
            setHasLoaded(true)
        }
        fetchProfileAndFilms()
    },[filter, sort, viewingData, updated, id])

    // Functions that update data specific to the user
    useEffect(() => {
        // Update film ids when the same film is viewed but owner of watchlist is changed
        const findOwnersVersionOfFilm = async () => {
            try {
                const response = await axiosReq.get(`/films/${id}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                const matchingFilm = response.data.films.filter(film => film.imdbID === currentFilmIds.imdbID)[0]
                setCurrentFilmIds({imdbID: currentFilmIds.imdbID, database: matchingFilm._id}) 
            } catch (err) {
                console.log(err)
            }
        }
        // Get current users films to determine which films have already been saved
        const fetchCurrentUsersFilmIds = async () => {
            try {
                const response = await axiosReq.get(`/films/${currentUser.user._id}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                setCurrentUsersFilmIds(response.data.films.map(film => film.imdbID))
            } catch (err) {
                console.log(err)
            }
        }
        // Get the username associated with the film list
        const fetchUsername = async () => {
            try {
                const response = await axiosReq.get(`/users/${id}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                setUsername(response.data.profile.username)
            } catch (err) {
                console.log(err)
            }
        }
        const checkOwner = currentUser.user._id === id
        if (!checkOwner) {
            fetchUsername()
            fetchCurrentUsersFilmIds()
        }
        setIsOwner(checkOwner)
        if (currentFilmIds.imdbID !== ''){
            findOwnersVersionOfFilm()
        }
    },[id])

    // Functions that only depend on change of current film
    useEffect(() => {   
        // Get individual film data from OMDB API for main view
        const getOMDBandViewingData = async () => {
            try {
                const response = await axiosReq.get(`/filmData/?imdbID=${currentFilmIds.imdbID}&databaseID=${currentFilmIds.database}`)
                setOmdbData(response.data)
                setViewingData({
                    watched: response.data.watched, 
                    userRating: response.data.userRating,
                    public: response.data.public
                })
            } catch (err) {
                console.log(err)
            }
        }
        getOMDBandViewingData()
    }, [currentFilmIds])

    return (
        <>
        {hasLoaded? 
            allFilms.length?
                <Container>
                    <Row>
                    <Col md={3}>
                        <Image src={profile.image} width={100} />
                        {profile.username}
                        {!isOwner? similarity : ''}
                    </Col> 
                    <Col md={3}>
                        <p>Films saved: {filmStats.savedCount}</p>
                        <p>Films watched: {filmStats.watchedCount}</p>
                        
                    </Col>
                    <Col md={3}>
                        Favourite Directors:
                        {directorCounts.map(([director, count], index) => (
                            <p key={index}>
                                {director}, Avg Rating: {count.toFixed(1)}
                            </p>
                        ))}
                    </Col>
                    <Col md={3}>
                    Favourite Genres:
                        {genreCounts.map(([genre, count], index) => (
                            <p key={index}>
                                {genre}, Avg Rating: {count.toFixed(1)}
                            </p>
                        ))}
                    </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Filters
                                filter={filter}
                                setFilter={setFilter}
                                sort={sort}
                                setSort={setSort}
                            />
                                {filteredFilms.length?
                                    filteredFilms.map(film => 
                                        <FilmPreviewProvider key={film._id} film={film} filmsPage>
                                            <FilmPreview />
                                        </FilmPreviewProvider>
                                    )
                                :'No films matching criteria.'}
                        </Col>
                        <Col md={6}>
                            {isOwner?
                                <Film /> 
                            :
                                <FilmPreviewProvider savedToWatchlist={currentUsersFilmIds.includes(omdbData.imdbID)} filmsPage >
                                    <Film /> 
                                </FilmPreviewProvider>               
                            }
                        </Col>
                    </Row>
                </Container>
            :
            <div>
                {
                isOwner? 
                <>
                    You don't have any films saved yet 
                    <Button onClick={() => history.push('/')} variant='link'>Click here to browse films.</Button>
                </>:`${username} doesn't have any films saved yet`}
            </div>
            
        :
            <Spinner />
        }
        </>

    )
}

export default FilmsPage