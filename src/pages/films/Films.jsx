import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { Button, Col, Container, Row, Dropdown, DropdownButton, Spinner } from 'react-bootstrap';
import styles from '../../styles/Films.module.css'
import appStyles from '../../App.module.css'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import Film from '../../components/Film';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import Filters from '../../components/Filters'

const Films = () => {
    // Hooks
    const { id } = useParams()
    const history = useHistory()
    const { height, width } = useWindowDimensions();

    // Contexts
    const { currentUser } = useCurrentUser()
    // Initialize state variables
    const [username, setUsername] = useState('')
    const [allFilms, setAllFilms] = useState([])
    const [filteredFilms, setFilteredFilms] = useState([])
    const [viewingData, setViewingData] = useState({watched: false, userRating: ''})
    const [currentFilmIds, setCurrentFilmIds] = useState({imdbID: '', database: ''})
    const [omdbData, setOmdbData] = useState({})
    const [sort, setSort] = useState('')
    const [filter, setFilter] = useState({
        public: true,
        watched: 'All'
    })
    const [hasLoaded, setHasLoaded] = useState(false)

    // Check if current user is owner of film list
    const isOwner = currentUser.user._id === id

    const handleDelete = async () => {
        try {
            await axiosReq.delete(`/films/${currentFilmIds.database}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}} )
            setCurrentFilmIds({imdbID: '', database: ''})
        } catch (err) {
            console.log(err)
        }
    }

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
            const filteredResponse = response.data.films.filter(film => checkFilm(film))
            setAllFilms(fullResponse)
            setFilteredFilms(filteredResponse)
            if (currentFilmIds.imdbID === '') {
                setCurrentFilmIds({
                    imdbID: filteredResponse[0].imdbID,
                    database: filteredResponse[0]._id
                })
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
        // Only call fetchUsername if current user is not owner of film list
        if (!isOwner) {
            fetchUsername()
        }
        fetchFilms()
    }, [sort, filter, currentUser.token, id, isOwner, viewingData, currentFilmIds.imdbID])

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
        setHasLoaded(true)
    }, [currentFilmIds])

    const updateViewingData = async (event, value, publicFilm) => {
        let reqObj, stateObj
        if (event) {
            reqObj = {watched: event.target.checked}
            stateObj = {watched: event.target.checked, userRating: viewingData.userRating, public: viewingData.public}
        } else if (value) {
            reqObj = {userRating: value}
            stateObj = {watched: viewingData.watched, userRating: value, public: viewingData.public}
        } else {
            reqObj = {public: publicFilm}
            stateObj = {watched: viewingData.watched, userRating: viewingData.userRating, public: publicFilm}
        }
        try {
            await axiosReq.patch(`/films/${currentFilmIds.database}`, reqObj, {headers: {'Authorization': `Bearer ${currentUser.token}`}} )
            setViewingData(stateObj)
        } catch(err) {
            console.log(err)
        }
    }
    
    const handleShare = () => history.push(`/reccomendations/send/${currentFilmIds.database}`)

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
                                sort={setSort} 
                                username={username} 
                                mobile={true} 
                                filteredFilms={filteredFilms} 
                                title={omdbData.Title}
                                setCurrentFilmIds={setCurrentFilmIds}
                                setViewingData={setViewingData}
                            />
                        </Row>):('')}
                    <Row>
                        {width > 599?(
                            <Col md={4} style={{marginTop: '30px', borderStyle:'solid', borderColor:'grey', borderWidth:'0.5px', borderRadius: '1rem', display:'inline'}}>
                                {/* FILTER BUTTONS */}
                                <Filters isOwner={isOwner} filter={filter} setFilter={setFilter} sort={setSort} username={username} mobile={false}/>
                                { /* FILMS LIST */}
                                <div className={styles.filmsListBody}>
                                {filteredFilms.length? (
                                    filteredFilms.map(
                                        film => <Film key={film.imdbID} filmData={film} fullView={false} filmsPage={true} setCurrentFilmIds={setCurrentFilmIds} setViewingData={setViewingData}  />
                                    )
                                ):('No films matching criteria.')}
                                </div>
                            </Col>
                        ):('')}
                        <Col md={8} style={{marginTop: '30px'}}>
                            {/* SELECTED FILM */}
                            <Film
                                filmData={viewingData}
                                omdbData={omdbData}
                                fullView={true}
                                filmsPage={true}
                                isOwner={isOwner}
                                username={username}
                                viewingData={viewingData}
                                updateViewingData={updateViewingData}
                                handleDelete={handleDelete}
                                handleShare={handleShare}
                            />
                        </Col>

                    </Row>
                    </>
                ):(<p>You don't have any films saved yet.</p>)
            ):(<Spinner />)}
        </Container>
    )
}

export default Films