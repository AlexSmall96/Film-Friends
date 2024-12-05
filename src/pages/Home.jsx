import React, { useState, useEffect} from 'react';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import ResultsPagination from '../components/ResultsPagination'
import { Button, Container, Image, Spinner, Row, Col, Pagination, ButtonGroup} from 'react-bootstrap';
import Film from '../components/Film'
import { useCurrentFilm } from '../contexts/CurrentFilmContext';
import SearchBar from './SearchBar';
import appStyles from '../App.module.css'
import styles from '../styles/Home.module.css'

const Home = () => {
    // Contexts
    const { currentUser } = useCurrentUser()
    const { updated } = useCurrentFilm()
    // Hooks
    const history = useHistory()
    const [searchResults, setSearchResults] = useState([])
    // Initialize state variables
    const [filmIds, setFilmIds] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [finalPage, setFinalPage] = useState(1)
    const [totalResults, setTotalResults] = useState(0)
    const [error, setError] = useState('')
    const [hasLoaded, setHasLoaded] = useState(false)
    const id = currentUser?.user._id || null

    useEffect(() => {
        // Gets the imdbIds of the users saved films, to determine which buttons should appear next to film result
        const fetchFilmIds = async () => {
            if (!currentUser) {
                return null
            }
            try {
                const response = await axiosReq.get(`/films/${id}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                setFilmIds(response.data.films.map(film => film.imdbID))
            } catch (err) {
                console.log(err)
            }
        }
        fetchFilmIds()
    }, [currentUser, id, updated])
    return (
        <>
            <div className={styles.searchComponents}>
            {/* SEARCH BAR*/}
            <SearchBar setSearchResults={setSearchResults} setTotalResults={setTotalResults} currentPage={currentPage} setCurrentPage={setCurrentPage} setFinalPage={setFinalPage} setError={setError} setHasLoaded={setHasLoaded} />
                {searchResults.length && hasLoaded?(
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
                ):''}
            </div>
            <div className={styles.searchResults}>
            {/* SEARCH RESULTS */}
            {searchResults.length? (hasLoaded? (
                <>
                        {/* LOGIN AND SIGNUP BUTTONS IF NOT ALREADY LOGGED IN */}
                        {!currentUser? (
                            <div>
                                <Button variant='secondary' onClick={() => history.push('/signup')}>Sign up</Button> or <Button variant='secondary' onClick={() => history.push('/login')}>Login</Button> to save and share films
                            </div>):('')
                        }   
                            <Container>
                                    <Row>
                                    {/* SEARCH RESULTS */}
                                    {searchResults.map(
                                        film => 
                                            <Col key={film.imdbID} md={6} sm={12}>
                                            <Film 
                                                filmData={film}
                                                fullView={false}
                                                filmsPage={false}
                                                saved={filmIds.includes(film.imdbID)} 
                                            />
                                            </Col>
                                    )}  
                                    </Row>

                            </Container>
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