import React from "react"
import { CurrentFilmContext } from "../contexts/CurrentFilmContext"
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Router } from 'react-router-dom';
import { Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

const renderWithFilmContext = (
    component,
    currentUser = {user : {username: 'user two',_id: 'user2id'}, token: 'user2token'},
    currentFilm = {
        currentFilmIds : {imdbID: 'imdb123', database: 'db123'},
        setCurrentFilmIds : null,
        viewingData : {watched: true, userRating: 3},
        setViewingData : null,
        omdbData : {Title: 'Film 1', Type: 'movie', year: '1996', Director: 'My favourite director', Plot: 'Some really interesting stuff happens'},
        setOmdbData : null,
        updateViewingData : null,
        saveFilm : null,
        updated : null,
        setUpdated : null,
    }) => {
        return (
            render(
                <CurrentUserContext.Provider value={{currentUser}}>
                    <CurrentFilmContext.Provider value={currentFilm} >
                        {component}
                    </CurrentFilmContext.Provider>
                </CurrentUserContext.Provider>

            )
        )
}

export default renderWithFilmContext