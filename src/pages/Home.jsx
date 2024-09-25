import React, { useState, useEffect} from 'react';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import ResultsPagination from '../components/ResultsPagination'

const Home = () => {
    // Contexts
    const { currentUser } = useCurrentUser()
    // Hooks
    const history = useHistory()
    const [searchResults, setSearchResults] = useState([])
    // Initialize state variables
    const [query, setQuery] = useState('')
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
                const response = await axiosReq.get(`/users/${id}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                setFilmIds(response.data.films.map(film => film.imdbID))
            } catch (err) {
                console.log(err)
            }
        }
        // Update search results when search query or current page is changed
        const fetchFilmData = async () => {
            try {
                // Get data from API, either using event.target or query state variable as the search
                const response = await axiosReq.get(`filmData/?search=${query}&page=${currentPage}`)
                    if (!response.data.Error){
                        // Set search results
                        const allResults = response.data.Search
                        setSearchResults(
                            allResults.filter(result => result.Type === 'movie' || result.Type === 'series')
                        )
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
        setQuery(event.target.value)
        setCurrentPage(1)
        setError('')
    }

    // Saves a film to users watchlist, can be called via the buttons for each film result
    const saveFilm = async (title, imdbID, poster, year, publicFilm) => {
        try {
            await axiosReq.post('/films', {title, imdbID, poster, year, public: publicFilm}, {
                headers: {'Authorization': `Bearer ${currentUser.token}`}
            })
            setFilmSaved(imdbID)
        } catch(err){
            console.log(err)
        }
    }

    return (
        <>
            {/* HEADER AND SEARCH BAR*/}
            <h1>Home Page</h1>
            <form>
                <label htmlFor='film-search' id='film-lbl'>Search for a film</label>
                <input name='film-search' aria-labelledby='film-lbl' type='search' onChange={handleChange}></input>
            </form>
            {/* SEARCH RESULTS */}
            {searchResults.length? (
                <>
                {/* PAGINATION BUTTONS */}
                <ResultsPagination currentPage={currentPage} setCurrentPage={setCurrentPage} finalPage={finalPage} />
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
                        <button onClick={() => history.push('/signup')}>Sign up</button> or <button onClick={() => history.push('/login')}>Login</button> to save and share films
                    </div>):('')
                }
                <table>
                    <tbody>
                    {/* SEARCH RESULTS */}
                    {searchResults.map(result =>
                        <tr key={result.imdbID}>
                            <td>{`Title: ${result.Title}, Year: ${result.Year}, Type: ${result.Type}`}</td>
                            <td><img src={result.Poster !== 'N/A' ? (result.Poster):('https://res.cloudinary.com/dojzptdbc/image/upload/v1726945998/default-movie_uajvdm.png')} alt={`Poster for ${result.Title}`} /></td>
                            <td>
                                {currentUser?(
                                        filmIds.includes(result.imdbID) ? (
                                            <>
                                                <p>Film saved</p>
                                                <button onClick={() => history.push(`/profile/${id}`)}>Go to watchlist</button>
                                            </>
                                        ):(
                                            <>
                                                <button 
                                                    type='submit' 
                                                    onClick={
                                                        () => saveFilm(result.Title, result.imdbID, result.Poster, result.Year, true)
                                                    }>{`Save to public watchlist.`}
                                                </button>
                                                <button 
                                                    type='submit' 
                                                    onClick={
                                                        () => saveFilm(result.Title, result.imdbID, result.Poster, result.Year, true)
                                                    }>{`Save to private watchlist.`}
                                                </button>
                                            </>
                                        )
                                    ):('')
                                }
                            </td>
                        </tr>
                    )}
                    </tbody>                    
                </table>
                </>
            ):(<p>{error}</p>)}
        </>
    )
}
export default Home;