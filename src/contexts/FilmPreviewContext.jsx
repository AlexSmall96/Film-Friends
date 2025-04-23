import React, { createContext, useContext } from "react";

/* 
Provides film data for a sinlge film preview component.
Used to wrap round each film preview component in a films.map method
*/ 
export const FilmPreviewContext = createContext()

export const FilmPreviewProvider = ({ 
    film, 
    savedToWatchlist, 
    showDropdown, 
    filmsPage, 
    mobile, 
    setShowMainFilm, 
    smallScreen, 
    message, 
    sender, 
    resultId,
    mainFilm, 
    children, 
    faded, 
    shareModal
}) => {

    return (
        <FilmPreviewContext.Provider value={{
            film, 
            savedToWatchlist, 
            showDropdown, 
            filmsPage, 
            mobile, 
            setShowMainFilm, 
            smallScreen, 
            message, 
            sender, 
            resultId, 
            mainFilm, 
            faded, 
            shareModal
        }}>
            {children}
        </FilmPreviewContext.Provider>
    )
}

export const useFilmPreview = () => useContext(FilmPreviewContext)