import React from 'react';
import { render } from '@testing-library/react';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import { RecoveryDataContext } from '../contexts/RecoveryDataContext';
import { CurrentFilmContext } from '../contexts/CurrentFilmContext';
import { FriendActionContext } from '../contexts/FriendActionContext';
import { FilmSearchContext } from '../contexts/FilmSearchContext';
import { SaveFilmContext } from '../contexts/SaveFilmContext'

// Renders a component with all necessary contexts with null values
// Used for individual component test files
const renderWithNullContext = (component, props={}) => {
    return(
        render(
            <CurrentUserContext.Provider value={{}}>
                <RecoveryDataContext.Provider value={{}}>
                    <CurrentFilmContext.Provider value={{}}>
                        <FriendActionContext.Provider value={{}}>
                            <SaveFilmContext.Provider value={{}}>
                                <FilmSearchContext.Provider value={{}}>
                                    {React.cloneElement(component, props)}
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