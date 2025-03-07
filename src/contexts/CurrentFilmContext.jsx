import React, { createContext, useState, useContext } from "react";
import { axiosReq } from "../api/axiosDefaults";
import { useCurrentUser } from "./CurrentUserContext";

/* 
Creates a context for film selected in films page 
Stores the value of current Film ids to get and update film data
Used in films page, film component and ellipsis menu
*/
export const CurrentFilmContext = createContext()

export const CurrentFilmProvider = ({ children }) => {
    
    // Ids of current film
    // imdbID is used to get data from OMDB API
    // database is used to get users viewing data from the database
    const [currentFilmIds, setCurrentFilmIds] = useState({
        imdbID: '', database: ''
    })

    // State variables related to film data
    const [viewingData, setViewingData] = useState({watched: false, userRating: ''})
    const [omdbData, setOmdbData] = useState({})

    return (
        <CurrentFilmContext.Provider value={{
            currentFilmIds,
            setCurrentFilmIds,
            viewingData,
            setViewingData,
            omdbData, 
            setOmdbData
        }}>
            {children}
        </CurrentFilmContext.Provider>
    )
}

export const useCurrentFilm = () => useContext(CurrentFilmContext)