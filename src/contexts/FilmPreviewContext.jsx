import React, { createContext, useContext } from "react";

/* 
Provides film data for film preview component
*/ 
export const FilmPreviewContext = createContext()

export const FilmPreviewProvider = ({ film, savedToWatchlist, showDropdown, filmsPage, mobile, setShowMainFilm, children }) => {

    return (
        <FilmPreviewContext.Provider value={{film, savedToWatchlist, showDropdown, filmsPage, mobile, setShowMainFilm}}>
            {children}
        </FilmPreviewContext.Provider>
    )
}

export const useFilmPreview = () => useContext(FilmPreviewContext)