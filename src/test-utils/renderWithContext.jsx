import React from 'react';
import { render } from '@testing-library/react';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import { RecoveryDataContext } from '../contexts/RecoveryDataContext';
import { CurrentFilmContext } from '../contexts/CurrentFilmContext';
import { FriendActionContext } from '../contexts/FriendActionContext';
import { FriendDataProvider } from '../contexts/FriendDataContext';
import { FilmSearchContext } from '../contexts/FilmSearchContext';
import { SaveFilmContext } from '../contexts/SaveFilmContext'
import { FilmPreviewProvider } from '../contexts/FilmPreviewContext';
import { Router } from 'react-router-dom';
import { Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

// Renders a component with all necessary contexts
// Used for individual component test files
// If an initial path is supplied, also returns a history variable to keep track of url
const currentUserImage = 'https://res.cloudinary.com/dojzptdbc/image/upload/v1744368051/defaultProfile_hizptb.png'

const renderWithContext = (component, {
    filmPreviewData, // data to pass into FilmPreviewProvider
    props, // props to pass into component
    path, // Initial path for history,
    currentFilmData, // Data to pass into currentFilm context
    friendData, // Data to pass into FriendDataProvider
    currentUser={user: {username: 'user1', _id: 'user1id', image: currentUserImage, email: 'user1@email.com'}, token: 'user1token'}, // default currentUser value
}={}) => {

    // Desctructure film preview data
    const { message, film, savedToWatchlist } = filmPreviewData || {}
    
    // Destructure currentFilm data
    const { isOwner, username } = currentFilmData || {}

    // Destructure friendData
    const { request } = friendData || {}
    // Create history variable to track url
    const history = path? createMemoryHistory({ initialEntries: [`${path}`] }) : null

    return(
        {component: render(
            <CurrentUserContext.Provider value={{currentUser}}>
                <RecoveryDataContext.Provider value={{}}>
                    <CurrentFilmContext.Provider value={{setCurrentFilmIds: () => {}, isOwner, username}}>
                        <FriendActionContext.Provider value={{deleteRequest: () => {}}}>
                            <SaveFilmContext.Provider value={{deleteReccomendation: () => {}}}>
                                <FilmSearchContext.Provider value={{}}>
                                    <FriendDataProvider request={request}>
                                        <FilmPreviewProvider resultId={{}} message={message} film={film} savedToWatchlist={savedToWatchlist}>
                                            {history?(
                                                <Router history={history}>
                                                    <Route path={`${path}`} render={() => React.cloneElement(component, props)} />
                                                </Router>
                                            ):(
                                                React.cloneElement(component, props)
                                            )}
                                        </FilmPreviewProvider>
                                    </FriendDataProvider>
                                </FilmSearchContext.Provider>
                            </SaveFilmContext.Provider>
                        </FriendActionContext.Provider>
                    </CurrentFilmContext.Provider>
                </RecoveryDataContext.Provider>
            </CurrentUserContext.Provider>
        ), history}
    )
}

export default renderWithContext