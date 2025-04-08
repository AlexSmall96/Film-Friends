import React, { useEffect, useState } from 'react';
import { Button, Container, Row, Col, Spinner } from 'react-bootstrap'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import FilmPreview from '../../components/FilmPreview';
import Film from './Film'
import Filters from './Filters';
import { useCurrentFilm } from '../../contexts/CurrentFilmContext';
import { useSaveFilmContext } from '../../contexts/SaveFilmContext';
import { FilmPreviewProvider, useFilmPreview } from '../../contexts/FilmPreviewContext';
import { useFriendAction } from '../../contexts/FriendActionContext';
import { useRedirect } from '../../hooks/useRedirect';
import appStyles from '../../App.module.css'
import styles from '../../styles/Films.module.css'
import PublicProfie from './PublicProfile';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const FilmsPage = () => {
    useRedirect()
    const { id } = useParams()
    const { currentUser } = useCurrentUser()
    const { width } = useWindowDimensions()
    const  smallScreen = width <= 767
    const { currentFilmIds, setCurrentFilmIds, setViewingData, omdbData, setOmdbData, isOwner, setIsOwner, setUsername } = useCurrentFilm()
    const { updated } = useSaveFilmContext()
    const { updatedFriends } = useFriendAction()
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
    const [requestIds, setRequestIds] = useState([])
    const [requests, setRequests] = useState([])
    const [showMainFilm, setShowMainFilm] = useState(false)
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
        const filteredData = data.filter(value => !bool? value !== 'N/A': true)
        let processedData = filteredData
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
            try {
                // Get all films
                const response = await axiosReq.get(`/films/${id}/?sort=${sort}`, {headers: {'Authorization': `Bearer ${currentUser?.token}`}})
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
                const publicWatchedFilms = fullResponse.filter(film => film.watched && film.public && film.userRating !== 0)
                // Call getTopThree function to calculate average ratings
                setGenreCounts(getTopThree(publicWatchedFilms, true))
                setDirectorCounts(getTopThree(publicWatchedFilms, false))
                // Initialise current film ids for main film view
                if (currentFilmIds?.imdbID === '' && filteredResponse.length) {
                    setCurrentFilmIds({imdbID: filteredResponse[0].imdbID, database:filteredResponse[0]._id})
                }
                // Get profile data and similarity score
                const profileResponse = await axiosReq.get(`/users/${id}`, {headers: {'Authorization': `Bearer ${currentUser?.token}`}})
                setProfile(profileResponse.data.profile)
                setUsername(profileResponse.data.profile.username)
                setSimilarity(isOwner? '' : profileResponse.data.similarity)
                setHasLoaded(true)
            } catch (err) {
                // console.log(err)
            }
        }
        fetchProfileAndFilms()
    },[filter, sort, updated, id])

    // Functions that update data specific to the user
    useEffect(() => {
        // Update film ids when the same film is viewed but owner of watchlist is changed
        const findOwnersVersionOfFilm = async () => {
            try {
                const matchingFilm = allFilms.filter(film => film.imdbID === currentFilmIds.imdbID)[0]
                setCurrentFilmIds({imdbID: currentFilmIds.imdbID, database: matchingFilm._id}) 
            } catch (err) {
                // console.log(err)
            }
        }
        // Get current users films to determine which films have already been saved
        const fetchCurrentUsersFilmIds = async () => {
            try {
                const response = await axiosReq.get(`/films/${currentUser?.user._id}`, {headers: {'Authorization': `Bearer ${currentUser?.token}`}})
                setCurrentUsersFilmIds(response.data.films.map(film => film.imdbID))
            } catch (err) {
                // console.log(err)
            }
        }
        const checkOwner = currentUser?.user._id === id
        if (!checkOwner) {
            fetchCurrentUsersFilmIds()
        }
        setIsOwner(checkOwner)
        if (currentFilmIds.imdbID !== '' && allFilms.length){
            findOwnersVersionOfFilm()
        }
    },[id, updated, allFilms])

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
                // console.log(err)
            }
        }
        getOMDBandViewingData()
    }, [currentFilmIds])

    useEffect(() => {
        const getRequestData = async () => {
            try {
                const response = await axiosReq.get(`/requests/`, {headers: {'Authorization': `Bearer ${currentUser?.token}`}})
                setRequestIds(  
                    response.data.map(request => request.reciever._id).concat(response.data.map(request => request.sender._id))
                )
                setRequests(response.data)
            } catch (err) {
                // console.log(err)
            }
        }
        getRequestData()
    }, [updatedFriends])

    return (
        <>
            {hasLoaded?
                <Container>
                    <PublicProfie 
                        profile={profile} 
                        requestIds={requestIds} 
                        requests={requests} 
                        filmStats={filmStats}
                        showStats={allFilms.length !== 0}
                        similarity={similarity}
                        directorCounts={directorCounts} 
                        genreCounts={genreCounts}
                        id={id}
                    />
                    {allFilms.length?
                        <Row>
                            {smallScreen && !showMainFilm || !smallScreen? 
                            <Col lg={{span:5, order: 1}} md={{span:4, order:1}} sm={{span: 12, order: 2}} className={`${appStyles.greyBorder}`}>
                                <Filters
                                    filter={filter}
                                    setFilter={setFilter}
                                    sort={sort}
                                    setSort={setSort}
                                />
                            
                            <div className={`${appStyles.list} ${styles.filmList} ${appStyles.verticalMargin}`}>
                                <div className={`${styles.filmListParent}`}>
                                    {filteredFilms.length?
                                    <Row>
                                        {filteredFilms.map(film => 
                                            <FilmPreviewProvider key={film._id} film={film} setShowMainFilm={setShowMainFilm} smallScreen={smallScreen} filmsPage>
                                                <Col lg={4} md={6} sm={4} xs={4}>
                                                    <FilmPreview />
                                                </Col>
                                            </FilmPreviewProvider>                                            
                                        )}
                                    </Row>
                                    :'No films matching criteria.'}
                                </div>
                            </div>
                            </Col>:''}
                            <Col lg={7} md={8} sm={{span:12, order:1}}>
                                {smallScreen && showMainFilm?
                                    <Button variant='link' onClick={() => setShowMainFilm(false)} className={appStyles.bigVerticalMargin}>Back to all films</Button>
                                :''}
                                {smallScreen && showMainFilm || !smallScreen?
                                    isOwner?
                                        <Film /> 
                                    :
                                        <FilmPreviewProvider savedToWatchlist={currentUsersFilmIds.includes(omdbData.imdbID)} filmsPage >
                                            <Film /> 
                                        </FilmPreviewProvider>               
                                :''}
                            </Col>
                        </Row>
                    : ''
                    }
                </Container>
            :  
                <Spinner className={appStyles.bigVerticalMargin} />
            }
        </>
    )
}

export default FilmsPage