import React, { createContext, useContext, useState, useEffect } from 'react';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from './CurrentUserContext';
import { useCurrentFilm } from './CurrentFilmContext';

// Defines several functions used in saving and deleting films and deleting reccomendations
export const SaveFilmContext = createContext();

export const SaveFilmProvider = ({ children }) => {

    const [updated, setUpdated] = useState(false)
    const {currentUser} = useCurrentUser()
    const {setOmdbData} = useCurrentFilm()
    const [hasLoadedPlot, setHasLoadedPlot] = useState(false)
    const [hoveredOverImdbID, setHoveredOverImdbID] = useState('')
    const [deleted, setDeleted] = useState(false)
    const [showMainFilm, setShowMainFilm] = useState(false)

    // Save film to users watchlist
    const saveFilm = async (Title, imdbID, Poster, Year, Type, publicFilm) => {
        try {
            const response = await axiosReq.get(`filmData/?imdbID=${imdbID}`)
            const Director = response.data.Director
            const Genre = response.data.Genre
            await axiosReq.post('/films', {Title, imdbID, Poster, Year, Type, Director, Genre, public: publicFilm}, {
                headers: {'Authorization': `Bearer ${currentUser.token}`}
            })
            setUpdated(!updated)
        } catch(err){
            console.log(err)
        }
    }

    // Delete reccomendation (remove from users reccomondation list)
    const deleteReccomendation = async (id) => {
        try {
            await axiosReq.delete(`/reccomendations/${id}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            setShowMainFilm(false)
            setDeleted(!deleted)
        } catch (err) {
            console.log(err)
        }
    }

    // Get individual film data from OMDB API for main view
    useEffect(() => {   
        const getOMDBData = async () => {
            try {
                setHasLoadedPlot(false)
                const response = await axiosReq.get(`/filmData/?imdbID=${hoveredOverImdbID}`)
                setOmdbData(response.data)
                setHasLoadedPlot(true)
            } catch (err) {
                console.log(err)
            }
        }
        getOMDBData()
    }, [hoveredOverImdbID, setOmdbData])
           
    return (
        <SaveFilmContext.Provider value={{saveFilm, updated, setUpdated, hasLoadedPlot, setHoveredOverImdbID, deleteReccomendation, deleted, showMainFilm, setShowMainFilm}}>
            {children}
        </SaveFilmContext.Provider>
    );
};

export const useSaveFilmContext = () => useContext(SaveFilmContext);