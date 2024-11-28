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

    // Current user value, used for the token in updatedViewingData function below
    const {currentUser} = useCurrentUser()
    
    // Updated boolean variable, to re-trigger useEffect in films page
    const [updated, setUpdated] = useState(false)

    // Updates a users rating, watched value, or public / private marking
    const updateViewingData = async (event, value, publicFilm) => {
        let reqObj, stateObj
        if (event) {
            reqObj = {watched: event.target.checked}
            stateObj = {watched: event.target.checked, userRating: viewingData.userRating, public: viewingData.public}
        } else if (value) {
            reqObj = {userRating: value}
            stateObj = {watched: viewingData.watched, userRating: value, public: viewingData.public}
        } else {
            reqObj = {public: publicFilm}
            stateObj = {watched: viewingData.watched, userRating: viewingData.userRating, public: publicFilm}
        }
        try {
            await axiosReq.patch(`/films/${currentFilmIds.database}`, reqObj, {headers: {'Authorization': `Bearer ${currentUser.token}`}} )
            setViewingData(stateObj)
        } catch(err) {
            console.log(err)
        }
    }

    // Saves a film to users watchlist, can be called via the buttons for each film result
    const saveFilm = async (Title, imdbID, Poster, Year, Type, publicFilm) => {
        try {
            await axiosReq.post('/films', {Title, imdbID, Poster, Year, Type, public: publicFilm}, {
                headers: {'Authorization': `Bearer ${currentUser.token}`}
            })
            setUpdated(!updated)
        } catch(err){
            console.log(err)
        }
    }

    return (
        <CurrentFilmContext.Provider value={{
            currentFilmIds,
            setCurrentFilmIds, 
            viewingData, 
            setViewingData,
            omdbData, 
            setOmdbData,
            updateViewingData,
            saveFilm,
            updated,
            setUpdated
        }}>
            {children}
        </CurrentFilmContext.Provider>
    )
}

export const useCurrentFilm = () => useContext(CurrentFilmContext)