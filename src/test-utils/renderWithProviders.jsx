import React from 'react';
import { render } from '@testing-library/react';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import { RecoveryDataContext } from '../contexts/RecoveryDataContext';
import { FriendActionContext } from '../contexts/FriendActionContext';
import { FriendDataProvider } from '../contexts/FriendDataContext';
import { FilmPreviewProvider } from '../contexts/FilmPreviewContext';
import { CurrentFilmProvider } from '../contexts/CurrentFilmContext';
import { SaveFilmProvider } from '../contexts/SaveFilmContext';
import { FilmSearchProvider } from '../contexts/FilmSearchContext';
import { Router } from 'react-router-dom';
import { MemoryRouter, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

// Renders a component with all necessary context providers, and some contexts with custom values
// Used for integration tests
// If an initial path is supplied, also returns a history variable to keep track of url
// The code to render the component with memory router was taken from 
// https://medium.com/@bobjunior542/using-useparams-in-react-router-6-with-jest-testing-a29c53811b9e
const renderWithProviders = (component, {
    filmPreviewData, // data to pass into FilmPreviewProvider
    props, // props to pass into component
    path, // Initial path for history,
    id,
    friendData, // Data to pass into FriendDataProvider
    currentUser={user: {username: 'user3', _id: 'user3id'}, token: 'user3token'}, // default currentUser value
}={}) => {

    // Destructure friendData
    const { request } = friendData || {}
    // Create history variable to track url
    const history = path? createMemoryHistory({ initialEntries: id? [`${path}/${id}`] : [`${path}`] }) : null
    return(
        {component: render(
            <CurrentUserContext.Provider value={{currentUser}}>
                <CurrentFilmProvider>
                    <SaveFilmProvider>
                        <FilmSearchProvider>
                            <RecoveryDataContext.Provider value={{}}>
                                    <FriendActionContext.Provider value={{deleteRequest: () => {}}}>
                                        <FriendDataProvider request={request}>
                                            <FilmPreviewProvider {...filmPreviewData}>
                                                {history?(
                                                    id?(
                                                        <MemoryRouter initialEntries={id? [`${path}/${id}`] : [path]}>
                                                            <Route path={id? `${path}/:id`: path } render={() => React.cloneElement(component, props)} />
                                                        </MemoryRouter>
                                                    ):(
                                                        <Router history={history}>
                                                            <Route path={`${path}`} render={() => React.cloneElement(component, props)} />
                                                        </Router>                                                    
                                                    )
                                                ):(
                                                    React.cloneElement(component, props)
                                                )}
                                            </FilmPreviewProvider>
                                        </FriendDataProvider>
                                    </FriendActionContext.Provider>
                            </RecoveryDataContext.Provider>
                        </FilmSearchProvider>
                    </SaveFilmProvider>
                </CurrentFilmProvider>
            </CurrentUserContext.Provider>
        ), history}
    )
}

export default renderWithProviders