import React, { useEffect, useState } from 'react';
import {Container, Row, Col, Image} from 'react-bootstrap'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import FilmPreview from '../../components/FilmPreview';
import Film from './Film'
import Filters from './Filters';

const FilmsPage = () => {
    const { id } = useParams()
    const { currentUser } = useCurrentUser()
    const [allFilms, setAllFilms] = useState([])
    const [filteredFilms, setFilteredFilms] = useState([])
    const [sort, setSort] = useState('Last Updated')
    const [filter, setFilter] = useState({
        public: true,
        watched: 'All'
    })
    const [hasLoaded, setHasLoaded] = useState(false)
    const [currentFilmIds, setCurrentFilmIds] = useState({
        imdbID: '', database: ''
    })
    const [viewingData, setViewingData] = useState({watched: false, userRating: ''})
    const [omdbData, setOmdbData] = useState({})
    const [username, setUsername] = useState('')
    const [currentUsersFilmIds, setCurrentUsersFilmIds, ] = useState([])
    const [updated, setUpdated] = useState(false)
    // Check if current user is owner of film list
    const isOwner = currentUser.user._id === id

    useEffect(() => {
        // Check if a film matches current criteria specified by filters
        const checkFilm = (film) => {
            return (
                film.public === filter.public
            ) && (
                filter.watched === 'All'? true: filter.watched === 'Watched'? film.watched: !film.watched
            )
        }
        // Get users films for film list
        const fetchFilms = async () => {
            const response = await axiosReq.get(`/films/${id}/?sort=${sort}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            const fullResponse = response.data.films
            const filteredResponse = await response.data.films.filter(film => checkFilm(film))
            setAllFilms(fullResponse)
            setFilteredFilms(filteredResponse)
            if (currentFilmIds?.imdbID === '' && filteredResponse.length) {
                setCurrentFilmIds({imdbID: filteredResponse[0].imdbID, database:filteredResponse[0]._id})
            }
            setHasLoaded(true)
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
        // Get current users films to determine which films have already been saved
        const fetchCurrentUsersFilmIds = async () => {
            try {
                const response = await axiosReq.get(`/films/${currentUser.user._id}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                setCurrentUsersFilmIds(response.data.films.map(film => film.imdbID))
            } catch (err) {
                console.log(err)
            }
        }
        fetchFilms()
        if (!isOwner) {
            fetchUsername()
            fetchCurrentUsersFilmIds()
        }
    },[filter, sort, viewingData, updated])

    useEffect(() => {
        const findCurrentUsersVersionOfFilm = async () => {
            try {
                const response = await axiosReq.get(`/films/${currentUser.user._id}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                const matchingFilm = response.data.films.filter(film => film.imdbID === currentFilmIds.imdbID)[0]
                setCurrentFilmIds({imdbID: currentFilmIds.imdbID, database: matchingFilm._id}) 
            } catch (err) {
                console.log(err)
            }
        }
        if (currentFilmIds.imdbID !== '' && isOwner){
            findCurrentUsersVersionOfFilm()
        }
        if (!isOwner){
            setCurrentFilmIds({imdbID:'', database:''}) 
        }
    },[id])

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
        <Container>
            <Row>
                <Col md={6}>
                    <Filters
                        isOwner={isOwner}
                        filter={filter}
                        setFilter={setFilter}
                        sort={sort}
                        setSort={setSort}
                        username={username}
                    />
                    {filteredFilms.length?
                        filteredFilms.map(film => 
                            <FilmPreview handleClick={() => setCurrentFilmIds({imdbID:film.imdbID, database:film._id})} key={film._id} film={film} />
                        )
                    :'No films matching criteria.'}
                </Col>
                <Col md={6}>
                    <Film 
                        omdbData={omdbData} 
                        viewingData={viewingData} 
                        setViewingData={setViewingData} 
                        isOwner={isOwner}
                        currentFilmIds={currentFilmIds} 
                        setCurrentFilmIds={setCurrentFilmIds}
                        username={username}
                        saved={currentUsersFilmIds.includes(omdbData.imdbID)}
                        updated={updated}
                        setUpdated={setUpdated}
                    />
                </Col>
            </Row>
        </Container>
    )
}

export default FilmsPage