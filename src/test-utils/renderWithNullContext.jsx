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

// Renders a component with all necessary contexts with null values
// Used for individual component test files

const currentUserImage = 'https://res.cloudinary.com/dojzptdbc/image/upload/v1744368051/defaultProfile_hizptb.png'

const renderWithNullContext = (
    component,
    props={}, 
    currentUser={
        user: {username: 'user1', _id: 'user1id', image: currentUserImage}
    }, 
) => {
    return(
        render(
            <CurrentUserContext.Provider value={{currentUser}}>
                <RecoveryDataContext.Provider value={{}}>
                    <CurrentFilmContext.Provider value={{}}>
                        <FriendActionContext.Provider value={{deleteRequest: () => {}}}>
                            <SaveFilmContext.Provider value={{deleteReccomendation: () => {}}}>
                                <FilmSearchContext.Provider value={{}}>
                                    <FriendDataProvider request={{}}>
                                        <FilmPreviewProvider resultId={{}}>
                                            {React.cloneElement(component, props)}
                                        </FilmPreviewProvider>
                                    </FriendDataProvider>
                                </FilmSearchContext.Provider>
                            </SaveFilmContext.Provider>
                        </FriendActionContext.Provider>
                    </CurrentFilmContext.Provider>
                </RecoveryDataContext.Provider>
            </CurrentUserContext.Provider>
        )
    )
}

export default renderWithNullContext