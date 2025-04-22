import React, { createContext, useState, useContext } from "react";

/* 
Creates a context for film selected in films page 
Stores the value of current Film ids to get and update film data
*/
export const CurrentFilmContext = createContext()

export const CurrentFilmProvider = ({ children }) => {
    
    // Ids of current film
    // imdbID is used to get data from OMDB API
    // database is used to get users viewing data from the database
    const [currentFilmIds, setCurrentFilmIds] = useState({
        imdbID: '', database: ''
    })

    // Keep track of currently viewed reccomendation for reccomendations page mobile view
    const [currentReccomendation, setCurrentReccomendation] = useState({_id: '', message: '', sender: ''})

    // State variables related to film data
    const [viewingData, setViewingData] = useState({watched: false, userRating: ''})
    const [omdbData, setOmdbData] = useState({})
    
    // isOwner boolean variable to determine if current user is owner of films list
    const [isOwner, setIsOwner] = useState(false)
    // Username associated with owner of film list
    const [username, setUsername] = useState('')

    // hasDeleted bool variable to show spinner when film is being deleted
    const [hasDeleted, setHasDeleted] = useState(true)

    return (
        <CurrentFilmContext.Provider value={{
            currentFilmIds,
            setCurrentFilmIds,
            viewingData,
            setViewingData,
            omdbData, 
            setOmdbData,
            isOwner,
            setIsOwner,
            username,
            setUsername,
            currentReccomendation, 
            setCurrentReccomendation,
            hasDeleted, 
            setHasDeleted
        }}>
            {children}
        </CurrentFilmContext.Provider>
    )
}

export const useCurrentFilm = () => useContext(CurrentFilmContext)