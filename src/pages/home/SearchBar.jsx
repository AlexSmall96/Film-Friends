import React, { useEffect, useState} from 'react'
import { axiosReq } from '../../api/axiosDefaults'
import { Button, Container, Row, Col} from 'react-bootstrap'
import appStyles from '../../App.module.css'
import styles from '../../styles/SearchBar.module.css'
import { useFilmSearchContext } from '../../contexts/FilmSearchContext'
import { useSaveFilmContext } from '../../contexts/SaveFilmContext'

/* 
Used in results page (home page format) to allow users to search for films and display results.
The search suggestions functionality was inspired by the following article
https://www.dhiwise.com/post/how-to-build-react-search-bar-with-suggestions#customizing-the-autocomplete-behavior
*/
const SearchBar = ({setResults, setTotalResults, currentPage, setCurrentPage, setFinalPage, setHasLoaded}) =>{
	
	// Initialize state variables
	const [imdbID, setImdbID] = useState('')
	const [suggestions, setSuggestions] = useState([])
	const [showSuggestions, setShowSuggestions] = useState(false);
	const { search, setSearch, searchedViaCarousel, setSearchedViaCarousel, submitted, setSubmitted } = useFilmSearchContext()
	const { setShowMainFilm } = useSaveFilmContext()
	// Get search results from OMDB API to use as suggestions
  	const handleChange = async (event) => {
		const string = event.target.value
		setSearch(string)
		setSuggestions([])
		if (string.length >= 5){
			const response = await axiosReq.get(`filmSearch/?search=${string.trim()}`)
			if (response?.data?.Search?.length){
				const suggestionsArray = response.data.Search.map(
					(result) => {
						return {id: result.imdbID, Title: result.Title}
					}
				)
				setSearch(string)
				setShowSuggestions(true)
				return setSuggestions(suggestionsArray)
			}
			setShowSuggestions(false)
			setSuggestions([])
			setSearchedViaCarousel(false)
		}
  	}

	// Use effect to make a call to OMDB API to get actual results
	// Triggered by current page or submitted boolean variable changing
	useEffect(() => {
		const fetchData = async () => {
			try {
				// Get data from API, either using event.target or search state variable as the search
				const response = await axiosReq.get(`filmSearch/?search=${search.trim()}&page=${currentPage}`)
					if (response.data.Search){
						// Set search results
						setResults(response.data.Search)
						// Set final page and total results for pagination
						setFinalPage(
							Math.ceil(0.1 * response.data.totalResults)
						)
						setTotalResults(response.data.totalResults) 
						setShowMainFilm(searchedViaCarousel) 
					} else {
						// If no search results found check if a suggestions item has been selected and try to find data from imdbID
						if (imdbID !== '') {
							const response = await axiosReq.get(`filmData/?imdbID=${imdbID}`)
							if (response.data.Title.trim() === search.trim()){
								setResults([response.data])
								setFinalPage(1)
								setTotalResults(1)
							} else {
								setResults([])
							}
						} 
					}
			} catch(err){
				setResults([])
			}
			setHasLoaded(true)
		}
		fetchData()
	}, [submitted, currentPage, imdbID, setFinalPage, setHasLoaded, setResults, setShowMainFilm, setTotalResults])

	// Handle submit to fetch search results
	const handleSubmit = (event) => {
		event?.preventDefault()
		setShowSuggestions(false)
		setCurrentPage(1)
		setSubmitted(!submitted)
	}

	// Handle click - sets search query and hides suggestions
	const handleClick = (event) => {
		// Check if a suggestion has been clicked 
		if (event.target.classList.contains('suggestion')){
			// Set search query with suggestion data
			setSearch(event.target.innerHTML)
			setImdbID(event.target.id)
			// Hide suggestions
			setShowSuggestions(false)
			// Submit form to trigger useEffect
			setSubmitted(!submitted)
		} else {
			// Hide suggestions
			setShowSuggestions(false)
		}
	}

	document.addEventListener('mouseup', handleClick)
  	return (
		<>
			{/* FORM  */}
			<Container className={`${appStyles.bigVerticalMargin}`}>
				<form onSubmit={handleSubmit}>
					<Row >
						<Col xs={10} sm={10} md={11} className={`${appStyles.noPadding}`}>
						{/* SEARCH BAR  */}
							<input 
								type='search' 
								placeholder='Search for a film' 
								className={styles.searchBar}
								value={search}
								onChange={handleChange}
							/>
						</Col>
						{/* SEARCH BUTTON */}
						<Col xs={2} sm={2} md={1} className={appStyles.noPadding} >
							<Button type='submit' variant='secondary' className={styles.searchButton} disabled={search === ''}><i className="fa-solid fa-magnifying-glass"></i></Button>
						</Col>
					</Row>
					<Row>
						<Col xs={10} sm={10} md={11} className={`${appStyles.noPadding} ${styles.suggestions} ${!(suggestions.length >=2 && showSuggestions)? styles.noBorder:''}`}>
							{suggestions.length >= 2 && showSuggestions? 
								suggestions.map(suggestion =>
									<p 
									    id={suggestion.id}
										key={suggestion.id}
										className='suggestion'
									>
										{suggestion.Title}
									</p>
								)
							:''}
						</Col>
					</Row>
				</form>
			</Container>
		</>
  )
}

export default SearchBar