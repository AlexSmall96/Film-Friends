import React, { useState, useEffect} from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import ResultsPagination from '../../components/ResultsPagination'
import { Alert, Button, Badge, Stack, Container, Image, Spinner, Row, Col, ButtonGroup, DropdownButton, Dropdown, Toast, ToastContainer } from 'react-bootstrap';
import FilmPreview from '../../components/FilmPreview'
import Film from '../films/Film'
import { FilmPreviewProvider } from '../../contexts/FilmPreviewContext';
import SearchBar from './SearchBar';
import appStyles from '../../App.module.css'
import styles from '../../styles/Results.module.css'
import useWindowDimensions from '../../hooks/useWindowDimensions';
import { useSaveFilmContext } from '../../contexts/SaveFilmContext';
import { useCurrentFilm } from '../../contexts/CurrentFilmContext';
import sortBy from 'array-sort-by'
import FilmPosterCarousel from './FilmPosterCarousel';
import FilmBadges from './FilmBadges';

const Results = ({reccomendationsPage }) => {
    // Contexts
    const { currentUser, accountDeleted } = useCurrentUser()
    // Hooks
    const history = useHistory()
    const { mobile, largeScreen } = useWindowDimensions()
    // Initialize state variables
    const [results, setResults] = useState([])
    const [usersFilmIds, setUsersFilmIds] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [finalPage, setFinalPage] = useState(1)
    const [filter, setFilter] = useState('All')
    const [sort, setSort] = useState('Last Sent')
    const [totalResults, setTotalResults] = useState(0)
    const [error, setError] = useState('')
    const [hasLoaded, setHasLoaded] = useState(!reccomendationsPage)
    const [hasLoadedMainFilm, setHasLoadedMainFilm] = useState(false)
    const [usernames, setUsernames] = useState([])
    const id = currentUser?.user._id || null
    const { updated } = useSaveFilmContext()
    const { currentFilmIds, omdbData, setOmdbData, currentReccomendation } = useCurrentFilm()
    const { deleted, showMainFilm, setShowMainFilm } = useSaveFilmContext()
    const [hasRecs, setHasRecs] = useState(false)
    const [showToast, setShowToast] = useState(accountDeleted)
    const [backgroundFilms, setBackgroundFilms] = useState([])

    useEffect(() => {
        // Gets the imdbIds of the users saved films, to determine which buttons should appear next to film result
        const fetchUsersFilmIds = async () => {
            if (!currentUser) {
                return null
            }
            try {
                const response = await axiosReq.get(`/films/${id}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                setUsersFilmIds(response.data.films.map(film => film.imdbID))
            } catch (err) {
                // console.log(err)
            }
        }
        fetchUsersFilmIds()
    }, [currentUser, id, updated])

    useEffect(() => {   
        // Get individual film data from OMDB API for main view (only used on mobile)
        const getOMDBData = async () => {
            try {
                setHasLoadedMainFilm(false)
                const response = await axiosReq.get(`/filmData/?imdbID=${currentFilmIds.imdbID}`)
                setOmdbData(response.data)
                setHasLoadedMainFilm(true)
            } catch (err) {
                // console.log(err)
            }
        }
        getOMDBData()
    }, [currentFilmIds])

    useEffect(() => {
        // Get users reccomendations if component is being used as reccomendations page
        const fetchReccomendations = async () => {
            const response = await axiosReq.get(`/reccomendations/`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            const allReccomendations = response.data.filter(rec => !rec.isSender)
            setHasRecs(allReccomendations.length)
            const filteredReccomendations = allReccomendations.filter(rec => filter === 'All' ? true : rec.sender.username === filter)
            const sortedReccomendations = sort === 'Film Title' ? sortBy(filteredReccomendations, (rec) => rec.film.Title) : filteredReccomendations
            setResults(sortedReccomendations.slice(9 * (currentPage - 1), 9 * currentPage))
            setFinalPage(
                Math.ceil(0.1 * sortedReccomendations.length)
            ) 
            setTotalResults(sortedReccomendations.length)
            const allUsernames = allReccomendations.map(rec => rec.sender.username)
            setUsernames([...new Set(allUsernames)])
            setHasLoaded(true)
        }
        if (reccomendationsPage){
            fetchReccomendations()
        }
    }, [filter, sort, currentUser?.token, deleted, currentPage])

    useEffect(() => {
        const fetchBackgroundFilms = async () => {
            try {
                const response = await axiosReq.get(`/films/?limit=${largeScreen ? 72 : 54}`)
                setBackgroundFilms(response.data)
            } catch (err){
                console.log(err)
            }
        }
        fetchBackgroundFilms()
    }, [largeScreen])

    return (
        hasLoaded?  
            hasRecs || !reccomendationsPage?
                <> 
                    <div className={
                        results?.length?
                            reccomendationsPage? 
                                finalPage > 1? styles.wrapperRecc : styles.wrapperReccNoPagination  
                            : 
                                !currentUser? styles.wrapperHomeLoggedOut : finalPage > 1 || showMainFilm? styles.wrapperHome: styles.wrapperHomeNoPagination
                            :
                        styles.wrapperNoSearch}
                    >
                        <div className={reccomendationsPage? styles.filterComponents : styles.searchComponentsHome}>
                            {/* SEARCH BAR*/}
                            {!reccomendationsPage? 
                                <>
                                <SearchBar 
                                    setResults={setResults} 
                                    setTotalResults={setTotalResults} 
                                    currentPage={currentPage} 
                                    setCurrentPage={setCurrentPage} 
                                    setFinalPage={setFinalPage} 
                                    setError={setError} 
                                    setHasLoaded={setHasLoaded} 
                                    setShowMainFilm={setShowMainFilm}
                                />
                                {backgroundFilms.length?
                                    <FilmBadges films={backgroundFilms.slice(0,30).map(film => film.Title)} />
                                :''}
                              </>
                            :   
                                <ButtonGroup className={appStyles.bigVerticalMargin}>
                                    <DropdownButton as={ButtonGroup} variant='outline-secondary' title={<><i className="fa-solid fa-filter"></i> {filter}</>}>
                                        <Dropdown.Item onClick={() => setFilter('All')}>All</Dropdown.Item>
                                        {usernames.map(username => 
                                            <Dropdown.Item key={username} onClick={() => setFilter(username)}>{username}</Dropdown.Item>
                                        )}
                                    </DropdownButton> 
                                    <DropdownButton as={ButtonGroup} variant='outline-secondary' title={<><i className="fa-solid fa-sort"></i> {sort}</>}>
                                        <Dropdown.Item onClick={() => setSort('Film Title')}>Film Title</Dropdown.Item>
                                        <Dropdown.Item onClick={() => setSort('Last Sent')}>Last Sent</Dropdown.Item>
                                    </DropdownButton>
                                </ButtonGroup>}
                            {results?.length && hasLoaded?(
                                <>
                                    {!(showMainFilm && mobile)?
                                        <>
                                            {/* PAGINATION MESSAGE */}
                                            <p>
                                                {currentPage !== finalPage ? (
                                                    `Showing ${reccomendationsPage? 'reccomendations' : 'results'} ${10 * (currentPage - 1) + 1} to ${10 * (currentPage - 1) + 10} of ${totalResults}`
                                                ):(
                                                    `Showing ${reccomendationsPage? 'reccomendations' : 'results'} ${10 * (currentPage - 1) + 1} to ${totalResults} of ${totalResults}`
                                                )}
                                            </p>
                                            {/* PAGINATION BUTTONS */}
                                            {finalPage > 1 ? 
                                                <ResultsPagination currentPage={currentPage} finalPage={finalPage} setCurrentPage={setCurrentPage}/>                       
                                            : '' }    
                                            {/* LOGIN AND SIGNUP BUTTONS IF NOT ALREADY LOGGED IN */}
                                            {!currentUser && !reccomendationsPage? (
                                                <div className={appStyles.bigVerticalMargin}>
                                                    <Button variant='link' onClick={() => history.push('/signup')}>Sign up</Button>
                                                    or 
                                                    <Button variant='link' onClick={() => history.push('/login')}>Login</Button> 
                                                        to save and share films
                                                </div>):('')
                                            }                        
                                        </> 
                                    :   
                                        <>
                                            {reccomendationsPage? <br />:''}
                                            <Button variant='link' onClick={() => setShowMainFilm(false)} className={appStyles.bigVerticalMargin}>
                                                {reccomendationsPage? 'Back to reccomendations': 'Back to search results'}
                                            </Button>
                                            {!currentUser && !reccomendationsPage? (
                                                <div className={appStyles.bigVerticalMargin}>
                                                    <Button variant='link' onClick={() => history.push('/signup')}>Sign up</Button>
                                                    or 
                                                    <Button variant='link' onClick={() => history.push('/login')}>Login</Button> 
                                                        to save and share films
                                                </div>):('')
                                            }                             
                                        </>
                                        
                                    }
 
                                </>
                            ):''}
                        </div>
                    </div>
                    <div className={results?.length ? currentUser? finalPage > 1 || showMainFilm ? styles.resultsHome: styles.resultsHomeNoPagination : styles.resultsHomeLoggedOut: styles.resultsNoSearch}>
                        {/* MAIN FILM  */}
                        {results?.length? (
                            hasLoaded? (
                                <Container> 
                                    {mobile && showMainFilm? 
                                        hasLoadedMainFilm?
                                            <FilmPreviewProvider 
                                                savedToWatchlist={usersFilmIds.includes(omdbData.imdbID)} 
                                                filmsPage 
                                                mainFilm
                                                resultId={currentReccomendation._id}  
                                            >
                                                {reccomendationsPage? 
                                                    <Alert variant='light' className={appStyles.smallFont}>
                                                        <strong>{currentReccomendation.sender.username}: </strong>
                                                        {currentReccomendation.message}
                                                    </Alert>:''}
                                                <Film />
                                            </FilmPreviewProvider>
                                        :
                                            <Spinner/>
                                    :
                                        <Row>
                                            {/* SEARCH / RECCOMENDATION RESULTS */}
                                            {results.map(result =>
                                                <FilmPreviewProvider 
                                                    key={result.imdbID || result.film.imdbID} 
                                                    film={result.film || result} 
                                                    showDropdown
                                                    resultId={result._id} 
                                                    savedToWatchlist={usersFilmIds.includes(result.imdbID || result.film.imdbID)} 
                                                    mobile={mobile}
                                                    setShowMainFilm={setShowMainFilm}
                                                    message={result.message || null}
                                                    sender={result.sender || null}
                                                >
                                                    <Col lg={4} md={6} sm={12} xs={4}>
                                                        <FilmPreview />
                                                    </Col>
                                                </FilmPreviewProvider>
                                            )}  
                                        </Row>
                                    }
                                </Container>
                            ):(<Spinner />)
                        ):(
                            error !== '' ? 
                                (
                                    <p>{error}</p>
                                ):(
                                    !reccomendationsPage? 
                                        <>
                                            {/* CAROUSEL USED AS BACKGROUND IMAGE */}
                                            {backgroundFilms.length? 
                                                <FilmPosterCarousel films={backgroundFilms} />
                                            :''}
                                            {accountDeleted? 
                                                /* TOAST MESSAGE IF ACCOUNT HAS JUST BEEN DELETED */
                                                <ToastContainer
                                                    className={`p-3 ${styles.toastContainer}`}
                                                    position="middle-center"
                                                >
                                                    <Toast show={showToast} onClose={() => setShowToast(false)}>
                                                        <Toast.Header>
                                                            <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
                                                            <strong className="me-auto">Film Friends</strong>
                                                        </Toast.Header>
                                                        <Toast.Body>Your account was deleted successfully.</Toast.Body>
                                                    </Toast>
                                                </ToastContainer>
                                            :''}
                                        </>
                                    :''
                                )
                        )}
                    </div>
                </>
            :    
                /* IMAGE FOR WHEN NO RECCOMENDATIONS ARE FOUND */
                <div className={styles.noRecsImage}>
                    <p>{`It looks like you don't have any reccomendations yet.`}</p>
                    <a href='/friends'>Find more friends here!</a>
                    <Image src='https://res.cloudinary.com/dojzptdbc/image/upload/v1744202296/norecs_ci4bj0.png' fluid />
                </div>     
        :(
            <Spinner className={appStyles.bigVerticalMargin} />
        )
    )
}

export default Results;