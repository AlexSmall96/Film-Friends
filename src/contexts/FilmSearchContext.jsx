import React, { createContext, useContext, useState } from 'react';

// Defines several functions used in saving and deleting films and deleting reccomendations
export const FilmSearchContext = createContext();

export const FilmSearchProvider = ({ children }) => {
    
    const [search, setSearch] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [searchedViaCarousel, setSearchedViaCarousel] = useState(false)

    return (
        <FilmSearchContext.Provider value={{search, setSearch, submitted, setSubmitted, searchedViaCarousel, setSearchedViaCarousel}}>
            {children}
        </FilmSearchContext.Provider>
    );
}

export const useFilmSearchContext = () => useContext(FilmSearchContext);