import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import {Col, Container, Row, Spinner } from 'react-bootstrap';
import styles from '../../styles/Films.module.css'
import appStyles from '../../App.module.css'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import Film from '../../components/Film';
import FilmPreview from '../../components/FilmPreview';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import Filters from '../films/Filters'
import { useCurrentFilm } from '../../contexts/CurrentFilmContext';

const Films = () => {
    // Hooks
    const { id } = useParams()
    const { width } = useWindowDimensions();

    // Contexts
    const { currentUser } = useCurrentUser()
    const {currentFilmIds, setCurrentFilmIds, viewingData, setViewingData, omdbData, setOmdbData, updated, setUpdated} = useCurrentFilm()
    // Initialize state variables
    const [username, setUsername] = useState('')
    const [currentUsersFilmIds, setCurrentUsersFilmIds, ] = useState([])
    const [allFilms, setAllFilms] = useState([])
    const [filteredFilms, setFilteredFilms] = useState([])
    const [sort, setSort] = useState('Last Updated')
    const [filter, setFilter] = useState({
        public: true,
        watched: 'All'
    })
    const [hasLoaded, setHasLoaded] = useState(false)
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
            if (currentFilmIds.imdbID === '' && filteredResponse.length) {
                setCurrentFilmIds({
                    imdbID: filteredResponse[0].imdbID,
                    database: filteredResponse[0]._id
                })
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
                
            }
        }
        // Only call fetchUsername and fetchCurrentUsersFilmIds  if current user is not owner of film list
        if (!isOwner) {
            fetchUsername()
            fetchCurrentUsersFilmIds()
        }
        fetchFilms()
    }, [sort, filter, currentUser.token, id, isOwner, viewingData, currentFilmIds.imdbID, updated])
    
    useEffect(() => {   
        // Get individual film data from OMDB API for main view
        const getOMDBData = async () => {
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
        getOMDBData()
    }, [currentFilmIds])

    return (
        <Container>
            {hasLoaded ? (
                allFilms.length ? (
                    <>
                    {width <= 599? (
                        <Row>
                            <Filters 
                                isOwner={isOwner} 
                                filter={filter} 
                                setFilter={setFilter} 
                                sort={sort} 
                                setSort={setSort}
                                username={username} 
                                mobile={true} 
                                filteredFilms={filteredFilms} 
                            />
                        </Row>):('')}
                    <Row>
                        {width > 599?(
                            <Col sm={{span: 12, order: 2}} md={{span:4, order: 1}} className={`${styles.filmsList} ${appStyles.bigVerticalMargin}`}>
                                {/* FILTER BUTTONS */}
                                <Filters isOwner={isOwner} filter={filter} setFilter={setFilter} sort={sort} username={username} setSort={setSort} mobile={false}/>
                                { /* FILMS LIST */}
                                <div className={`${styles.filmsListBody} ${appStyles.verticalMargin}`}>
                                {filteredFilms.length? (
                                    filteredFilms.map(film => 
                                        <FilmPreview 
                                            key={film.imdbID} 
                                            film={film} 
                                            filmsPage={true}  
                                        />
                                    )
                                ):('No films matching criteria.')}
                                </div>
                            </Col>
                        ):('')}
                        <Col sm={{span: 12, order: 1}} md={{span:8, order:2}} className={`${appStyles.bigVerticalMargin}`}>
                            {/* SELECTED FILM */}
                            {currentFilmIds.imdbID?
                                <Film
                                    fullView={true}
                                    filmsPage={true}
                                    isOwner={isOwner}
                                    saved={currentUsersFilmIds.includes(omdbData.imdbID)}
                                    username={username}
                                />:''
                            }
                        </Col>

                    </Row>
                    </>
                ):(<p>You don't have any films saved yet.</p>)
            ):(<Spinner />)}
        </Container>
    )
}

export default Films