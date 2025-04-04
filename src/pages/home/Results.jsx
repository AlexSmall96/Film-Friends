import React, { useState, useEffect} from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import ResultsPagination from '../../components/ResultsPagination'
import { Button, Container, Image, Spinner, Row, Col, ButtonGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import FilmPreview from '../../components/FilmPreview'
import Film from '../films/Film'
import { FilmPreviewProvider } from '../../contexts/FilmPreviewContext';
import SearchBar from './SearchBar';
import appStyles from '../../App.module.css'
import homeStyles from '../../styles/Home.module.css'
import reccStyles from '../../styles/Reccomendations.module.css'
import useWindowDimensions from '../../hooks/useWindowDimensions';
import { useSaveFilmContext } from '../../contexts/SaveFilmContext';
import { useCurrentFilm } from '../../contexts/CurrentFilmContext';
import sortBy from 'array-sort-by'

const Results = ({reccomendationsPage}) => {
    // Contexts
    const { currentUser } = useCurrentUser()
    // Hooks
    const history = useHistory()
    const { mobile } = useWindowDimensions()
    // Initialize state variables
    const [results, setResults] = useState([])
    const [usersFilmIds, setUsersFilmIds] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [finalPage, setFinalPage] = useState(1)
    const [filter, setFilter] = useState('All')
    const [sort, setSort] = useState('Last Sent')
    const [totalResults, setTotalResults] = useState(0)
    const [error, setError] = useState('')
    const [hasLoaded, setHasLoaded] = useState(false)
    const [showMainFilm, setShowMainFilm] = useState(false)
    const [hasLoadedMainFilm, setHasLoadedMainFilm] = useState(false)
    const [usernames, setUsernames] = useState([])
    const [hasUpdated, setHasUpdated] = useState(true)
    const id = currentUser?.user._id || null
    const { updated } = useSaveFilmContext()
    const { currentFilmIds, omdbData, setOmdbData } = useCurrentFilm()

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
        const fetchReccomendations = async () => {
            const response = await axiosReq.get(`/reccomendations/`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            const allReccomendations = response.data.filter(rec => !rec.isSender)
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
            setHasUpdated(true)
        }
        if (reccomendationsPage){
            fetchReccomendations()
        }
    }, [filter, sort, currentUser.token, currentPage])


    return (
        <>  
            <div className={reccomendationsPage? reccStyles.wrapper : homeStyles.wrapper}>
            <div className={reccomendationsPage? reccStyles.filterComponents : homeStyles.searchComponents}>
                {/* SEARCH BAR*/}
                {!reccomendationsPage? 
                    <SearchBar 
                        setResults={setResults} 
                        setTotalResults={setTotalResults} 
                        currentPage={currentPage} 
                        setCurrentPage={setCurrentPage} 
                        setFinalPage={setFinalPage} 
                        setError={setError} 
                        setHasLoaded={setHasLoaded} 
                    />
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
                            :   
                                <>
                                    {reccomendationsPage? <br />:''}
                                    <Button variant='link' onClick={() => setShowMainFilm(false)} className={appStyles.bigVerticalMargin}>Back to search results</Button>                            
                                </>
                                
                            }
                           
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
                    ):''}
            </div>
            </div>
            <div className={currentUser? homeStyles.results: homeStyles.resultsLoggedOut}>
                {/* SEARCH RESULTS */}
                {results?.length? (hasLoaded? (
                    <Container> {
                        mobile && showMainFilm? 
                            hasLoadedMainFilm?
                                <FilmPreviewProvider savedToWatchlist={usersFilmIds.includes(omdbData.imdbID)} filmsPage >
                                    <Film />
                                </FilmPreviewProvider>
                            :
                            <Spinner/>
                        :
                            <Row>
                                {/* SEARCH RESULTS */}
                                {results.map(
                                    result =>
                                        <FilmPreviewProvider 
                                            key={result.imdbID || result.film.imdbID} 
                                            film={result.film || result} 
                                            showDropdown 
                                            savedToWatchlist={usersFilmIds.includes(result.imdbID || result.film.imdbID)} 
                                            mobile={mobile}
                                            setShowMainFilm={setShowMainFilm}
                                        >
                                            <Col lg={4} md={6} sm={12} xs={4}>
                                                <FilmPreview />
                                            </Col>
                                        </FilmPreviewProvider>
                                )}  
                            </Row>
                            }
                    </Container>
                    ):(<Spinner />)):(
                        error !== '' ? 
                        (
                            <p>{error}</p>
                        ):(
                            !reccomendationsPage? 
                                <Image alt='A close up of film tape' width={400} src='https://res.cloudinary.com/dojzptdbc/image/upload/v1729270408/movie2_h1bnwo.png'/>
                            :''
                        )
                    )}
            </div>
               
        </>
    )
}

export default Results;