import React, { useState, useEffect} from 'react';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import ResultsPagination from '../components/ResultsPagination'
import { Button, Container, Col, Form, Image, Row} from 'react-bootstrap';
import Film from '../components/Film'

const Home = () => {
    // Contexts
    const { currentUser } = useCurrentUser()
    // Hooks
    const history = useHistory()
    const [searchResults, setSearchResults] = useState([])
    // Initialize state variables
    const [query, setQuery] = useState('')
    const [search, setSearch] = useState('')
    const [filmIds, setFilmIds] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [finalPage, setFinalPage] = useState(1)
    const [totalResults, setTotalResults] = useState(0)
    const [error, setError] = useState('')
    const [filmSaved, setFilmSaved] = useState('')
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
        // Update search results when search query or current page is changed
        const fetchFilmData = async () => {
            try {
                // Get data from API, either using event.target or query state variable as the search
                const response = await axiosReq.get(`filmSearch/?search=${query}&page=${currentPage}`)
                    if (!response.data.Error){
                        // Set search results
                        setSearchResults(response.data.Search)
                        // Set final page and total results for pagination
                        setFinalPage(
                            Math.ceil(0.1 * response.data.totalResults)
                        )
                        setTotalResults(response.data.totalResults)               
                    } else {
                        // Set custom error message depending on response from API
                        setSearchResults([])
                        setError(
                            response.data.Error === 'Movie not found!' ? ('There are no results matching your search.'):('')
                        )
                    }
            } catch(err){
                setSearchResults([])
            }
        }
        fetchFilmIds()
        fetchFilmData()
    }, [currentPage, query, currentUser, id, filmSaved])

    // Update the search query and current page state
    const handleChange = (event) => {
        setSearch(event.target.value)
        setCurrentPage(1)
        setError('')
    }

    const handleClick = () => {
        setQuery(search)
    }

    // Saves a film to users watchlist, can be called via the buttons for each film result
    const saveFilm = async (Title, imdbID, Poster, Year, Type, publicFilm) => {
        try {
            await axiosReq.post('/films', {Title, imdbID, Poster, Year, Type, public: publicFilm}, {
                headers: {'Authorization': `Bearer ${currentUser.token}`}
            })
            setFilmSaved(imdbID)
        } catch(err){
            console.log(err)
        }
    }

    return (
        <>
            {/* SEARCH BAR*/}
            <Form>
                <Row style={{width:'50%', margin: 'auto'}}>
                    <Col xs={10} sm={10}>
                        <Form.Group className="mb-3" >
                            <Form.Control onChange={handleChange} type='text' placeholder="Search for a film" />
                        </Form.Group>
                    </Col>
                    <Col xs={1} sm={1}>
                        <Button onClick={handleClick} variant='outline-secondary'><i className="fa-solid fa-magnifying-glass"></i></Button>
                    </Col>
                </Row>
            </Form>
            {/* SEARCH RESULTS */}
            {searchResults.length? (
                <>
                {/* PAGINATION BUTTONS */}
                {finalPage > 1 ? <ResultsPagination currentPage={currentPage} setCurrentPage={setCurrentPage} finalPage={finalPage} />: '' }
                {/* PAGINATION MESSAGE */}
                <p>
                    {currentPage !== finalPage ? (
                        `Showing results ${10 * (currentPage - 1) + 1} to ${10 * (currentPage - 1) + 10} of ${totalResults}`
                    ):(
                        `Showing results ${10 * (currentPage - 1) + 1} to ${totalResults} of ${totalResults}`
                    )}
                </p>
                {/* LOGIN AND SIGNUP BUTTONS IF NOT ALREADY LOGGED IN */}
                {!currentUser? (
                    <div>
                        <Button variant='secondary' onClick={() => history.push('/signup')}>Sign up</Button> or <Button variant='secondary' onClick={() => history.push('/login')}>Login</Button> to save and share films
                    </div>):('')
                }   
                    
                    <Container>
                            {/* SEARCH RESULTS */}
                            {searchResults.map(
                                film => 
                                    <Film 
                                        key={film.imdbID} 
                                        film={film}
                                        filmsPage={false}
                                        saveFilm={saveFilm} 
                                        history={history} 
                                        currentUserId={id}
                                        saved={filmIds.includes(film.imdbID)} 
                                        handleFilmChange={null}
                                    />
                            )}  
                    </Container>
                </>
            ):(
                error !== '' ? (
                    <p>{error}</p>
                ):(<Image alt='A close up of film tape' width={400} src='https://res.cloudinary.com/dojzptdbc/image/upload/v1729270408/movie2_h1bnwo.png'/>
                )
            )}
        </>
    )
}
export default Home;