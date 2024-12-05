import React, { useEffect, useState} from 'react'
import { axiosReq } from '../api/axiosDefaults'
import { Button, Container, Row, Col, Form,} from 'react-bootstrap'
import appStyles from '../App.module.css'
import styles from '../styles/Home.module.css'
import './CustomSearchBar.module.css'

/* 
The search suggestions functionality was inspired by the following article
https://www.dhiwise.com/post/how-to-build-react-search-bar-with-suggestions#customizing-the-autocomplete-behavior
*/

const SearchBar = ({setSearchResults, setTotalResults, currentPage, setFinalPage, setError}) =>{
	
	// Initialize state variables
	const [search, setSearch] = useState('')
	const [imdbID, setImdbID] = useState('')
	const [suggestions, setSuggestions] = useState([])
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [submitted, setSubmitted] = useState(false)

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
		}
  	}

	// Use effect to make a call to OMDB API to get actual results
	// Triggered by current page or submitted boolean variable changing
	useEffect(() => {
		const fetchData = async () => {
			try {
				// Get data from API, either using event.target or query state variable as the search
				const response = await axiosReq.get(`filmSearch/?search=${search.trim()}&page=${currentPage}`)
					if (!response.data.Error){
						// Set search results
						setSearchResults(response.data.Search)
						// Set final page and total results for pagination
						setFinalPage(
							Math.ceil(0.1 * response.data.totalResults)
						)
						setTotalResults(response.data.totalResults)             
					} else {
						// If no search results found check if a suggestions item has been selected and try to find data from imdbID
						if (imdbID !== '') {
							const response = await axiosReq.get(`filmData/?imdbID=${imdbID}`)
							if (response.data.Title.trim() === search.trim()){
								setSearchResults([response.data])
								setFinalPage(1)
								setTotalResults(1)
							} else {
								// If both searches fail but an error message has been sent, set a custom error message to display
								setSearchResults([])
								setError(
									'There are no results matching your search.'
								)
							}
						} 
					}
			} catch(err){
				setError('There are no results matching your search.')
				setSearchResults([])
			}
		}
		fetchData()
	}, [submitted, currentPage])

	// Handle submit to fetch search results
	const handleSubmit = (event) => {
		event?.preventDefault()
		setShowSuggestions(false)
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
			<Form onSubmit={handleSubmit}>
				<Container className={`${appStyles.bigVerticalMargin}`}>
					<Row>
						<Col xs={10} sm={10} md={11} className={appStyles.noPadding}>
						{/* SEARCH BAR  */}
						<Form.Control 
							type='text' 
							placeholder='Search for a film' 
							style={{height: '50px', borderRadius: '1rem 0 0 1rem'}} 
							value={search}
							onChange={handleChange}
						/>
						</Col>
						{/* SEARCH BUTTON */}
						<Col xs={2} sm={2} md={1} className={appStyles.noPadding} >
							<Button type='submit' variant='outline-secondary' className={styles.searchButton}><i className="fa-solid fa-magnifying-glass"></i></Button>
						</Col>
					</Row>
					<Row>
						<Col xs={10} sm={10} md={11} className={`${appStyles.noPadding} ${styles.suggestions}`}>
							{suggestions.length && showSuggestions? 
								suggestions.map(suggestion =>
									<p 
									    id={suggestion.id}
										key={suggestion.id}
										className='suggestion'
										// onClick={() => handleClick(suggestion.Title, suggestion.id)}
									>
										{suggestion.Title}
									</p>
								)
							:''}
						</Col>
					</Row>
				</Container>
			</Form>
		</>
  )
}

export default SearchBar