import React, { useEffect, useState } from 'react'
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import { axiosReq } from '../api/axiosDefaults'
import { Button, Container, Row, Col, Form } from 'react-bootstrap'
import appStyles from '../App.module.css'

/* 
The search suggestions functionality was inspired by the following article
https://www.dhiwise.com/post/how-to-build-react-search-bar-with-suggestions#customizing-the-autocomplete-behavior
*/

const SearchBar = ({setSearchResults, setTotalResults, currentPage, setFinalPage, setError}) =>{

	// Initialize state variables
	const [search, setSearch] = useState('')
	const [imdbID, setImdbID] = useState('')
	const [suggestions, setSuggestions] = useState([])
	const [submitted, setSubmitted] = useState(false)

	// Get search results from OMDB API to use as suggestions
  	const handleOnSearch = async (string) => {
		const response = await axiosReq.get(`filmSearch/?search=${string.trim()}`)
			if (response?.data?.Search?.length){
				const suggestionsArray = response.data.Search.map(
					(result) => {
						return {id: result.imdbID, name: result.Title}
					}
				)
				setSearch(string)
				return setSuggestions(suggestionsArray)
			}
			setSuggestions([])
			setSearch(string)
  	}

	// If a suggestion is selected, set name and imdb as search values
	const handleOnSelect = async (item) => {
		setSearch(item.name)
		setImdbID(item.id)
	}

	// Formatting for suggestions
  	const formatResult = (item) => {
		return (
			<>
				<span style={{textAlign: 'left' }}>{item.name}</span>
			</>
		);
  	};

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


	const handleSubmit = (event) => {
		event?.preventDefault()
		setSubmitted(!submitted)
	}

  	return (
		<>
			{/* FORM  */}
			<Form onSubmit={handleSubmit}>
				<Container className={appStyles.bigVerticalMargin}>
					<Row>
						<Col xs={10} sm={10} md={11} className={appStyles.noPadding}>
						{/* SEARCH BAR  */}
						<ReactSearchAutocomplete
							items={suggestions}
							onSearch={handleOnSearch}
							onSelect={handleOnSelect}
							autoFocus
							fuseOptions={{minMatchCharLength: 3}}
							showNoResults={false}
							styling={{borderRadius: '1rem 0 0 1rem', marginRight: '0px', height: '50px', boxShadow: '0 0 0 0'}}
							formatResult={formatResult}
							placeholder="Search for a film"
						/>				
						</Col>
						{/* SEARCH BUTTON */}
						<Col xs={2} sm={2} md={1} className={appStyles.noPadding} >
							<Button type='submit' variant='outline-secondary' style={{borderRadius: '0 1rem 1rem 0', height: '52px', width: '100%'}}><i className="fa-solid fa-magnifying-glass"></i></Button>
						</Col>
					</Row>
				</Container>
			</Form>
		</>
  )
}

export default SearchBar