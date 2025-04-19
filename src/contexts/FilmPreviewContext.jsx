import React, { createContext, useContext } from "react";

/* 
Provides film data for film preview component
*/ 
export const FilmPreviewContext = createContext()

export const FilmPreviewProvider = ({ film, savedToWatchlist, showDropdown, filmsPage, mobile, setShowMainFilm, smallScreen, message, sender, resultId, mainFilm, children, faded}) => {

    return (
        <FilmPreviewContext.Provider value={{film, savedToWatchlist, showDropdown, filmsPage, mobile, setShowMainFilm, smallScreen, message, sender, resultId, mainFilm, faded}}>
            {children}
        </FilmPreviewContext.Provider>
    )
}

export const useFilmPreview = () => useContext(FilmPreviewContext)