import React, { createContext, useContext, useState, useEffect } from 'react';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from './CurrentUserContext';
import { useCurrentFilm } from './CurrentFilmContext';

// Defines several functions used in saving and deleting films and deleting reccomendations
const FilmSearchContext = createContext();

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