import React, { useState, useEffect} from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import ResultsPagination from '../../components/ResultsPagination'
import { Button, Container, Image, Spinner, Row, Col } from 'react-bootstrap';
import FilmPreview from '../../components/FilmPreview'
import Film from '../films/Film'
import { FilmPreviewProvider } from '../../contexts/FilmPreviewContext';
import SearchBar from './SearchBar';
import appStyles from '../../App.module.css'
import styles from '../../styles/Home.module.css'
import useWindowDimensions from '../../hooks/useWindowDimensions';
import { useSaveFilmContext } from '../../contexts/SaveFilmContext';
import { useCurrentFilm } from '../../contexts/CurrentFilmContext';

const Home = () => {
    // Contexts
    const { currentUser } = useCurrentUser()
    // Hooks
    const history = useHistory()
    const { width, height, mobile } = useWindowDimensions()
    // Initialize state variables
    const [searchResults, setSearchResults] = useState([])
    const [usersFilmIds, setUsersFilmIds] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [finalPage, setFinalPage] = useState(1)
    const [totalResults, setTotalResults] = useState(0)
    const [error, setError] = useState('')
    const [hasLoaded, setHasLoaded] = useState(false)
    const [showMainFilm, setShowMainFilm] = useState(false)
    const [hasLoadedMainFilm, setHasLoadedMainFilm] = useState(false)
    const id = currentUser?.user._id || null
    const { updated } = useSaveFilmContext()
    const { currentFilmIds, setCurrentFilmIds, viewingData, setViewingData, omdbData, setOmdbData, isOwner, setIsOwner, setUsername } = useCurrentFilm()
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
                console.log(err)
            }
        }
        fetchUsersFilmIds()
    }, [currentUser, id, updated])

    // Functions that only depend on change of current film
    useEffect(() => {   
        // Get individual film data from OMDB API for main view
        const getOMDBandViewingData = async () => {
            try {
                setHasLoadedMainFilm(false)
                const response = await axiosReq.get(`/filmData/?imdbID=${currentFilmIds.imdbID}`)
                setOmdbData(response.data)
                setHasLoadedMainFilm(true)
            } catch (err) {
                // console.log(err)
            }
        }
        getOMDBandViewingData()
    }, [currentFilmIds])

    return (
        <>  
            <div className={styles.wrapper}>
            <div className={styles.searchComponents}>
                {/* SEARCH BAR*/}
                <SearchBar setSearchResults={setSearchResults} setTotalResults={setTotalResults} currentPage={currentPage} setCurrentPage={setCurrentPage} setFinalPage={setFinalPage} setError={setError} setHasLoaded={setHasLoaded} />
                    {searchResults.length && hasLoaded?(
                        <>
                            {!(showMainFilm && mobile)?
                                <>
                                    {/* PAGINATION MESSAGE */}
                                <p>
                                    {currentPage !== finalPage ? (
                                        `Showing results ${10 * (currentPage - 1) + 1} to ${10 * (currentPage - 1) + 10} of ${totalResults}`
                                    ):(
                                        `Showing results ${10 * (currentPage - 1) + 1} to ${totalResults} of ${totalResults}`
                                    )}
                                </p>
                                {/* PAGINATION BUTTONS */}
                                {finalPage > 1 ? 
                                    <ResultsPagination currentPage={currentPage} finalPage={finalPage} setCurrentPage={setCurrentPage}/>                       
                                : '' }                            
                                </>
                            :   <>
                                    <Button variant='link' onClick={() => setShowMainFilm(false)}>Back to search results.</Button>
                                    <Button size='sm' variant='outline-secondary' onClick={() => setShowMainFilm(false)}><i class="fa-solid fa-xmark"></i></Button>                            
                                </>

                                
                            }
                           
                        {/* LOGIN AND SIGNUP BUTTONS IF NOT ALREADY LOGGED IN */}
                        {!currentUser? (
                            <div className={appStyles.bigVerticalMargin}>
                                <Button variant='link' onClick={() => history.push('/signup')}>Sign up</Button>
                                or 
                                <Button variant='link' onClick={() => history.push('/login')}>Login</Button> 
                                    to save and share films
                            </div>):('')
                        } 
                        </>
                    ):''}
            </div>
            </div>
            <div className={currentUser? styles.searchResults: styles.searchResultsLoggedOut}>
                {/* SEARCH RESULTS */}
                {searchResults.length? (hasLoaded? (
                    <> {
                        mobile && showMainFilm? 
                            hasLoadedMainFilm?
                                <FilmPreviewProvider savedToWatchlist={usersFilmIds.includes(omdbData.imdbID)} filmsPage >
                                    <Film />
                                </FilmPreviewProvider>
                            :
                            <Spinner/>
                        :
                            <Container>
                                    <Row>
                                        {/* SEARCH RESULTS */}
                                        {searchResults.map(
                                            film =>
                                                <FilmPreviewProvider 
                                                    key={film.imdbID} 
                                                    film={film} 
                                                    showDropdown 
                                                    savedToWatchlist={usersFilmIds.includes(film.imdbID)} 
                                                    mobile={mobile}
                                                    setShowMainFilm={setShowMainFilm}
                                                >
                                                    <Col lg={4} md={6} sm={12} xs={4}>
                                                        <FilmPreview />
                                                    </Col>
                                                </FilmPreviewProvider>
                                        )}  
                                    </Row>
                            </Container>}
                    </>
                    ):(<Spinner />)):(
                        error !== '' ? 
                        (
                            <p>{error}</p>
                        ):(
                            <Image alt='A close up of film tape' width={400} src='https://res.cloudinary.com/dojzptdbc/image/upload/v1729270408/movie2_h1bnwo.png'/>
                        )
                    )}
            </div>
               
        </>
    )
}
export default Home;