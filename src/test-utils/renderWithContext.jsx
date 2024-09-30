import React from "react"
import { CurrentUserContext } from "../contexts/CurrentUserContext"
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom/cjs/react-router-dom.min';
import { Router } from 'react-router-dom';
import { Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

// Helper function used to render a variety of components that rely on user context
// Supplies a default user
const renderWithContext = (component, currentUser = {user : {username: 'user two',_id: 'user2id'}, token: 'user2token'}, path = null, id = null) => {
    
    // If component requires a route then call createMemoryHistory to track url
    const history = path? createMemoryHistory({ initialEntries: [`/${path}/${id}`] }) : null
    
    // Return an object with the rendered component and the history variable
    return (
        {
            component: render(
            /* Any component gets wrapped in user context*/
            <CurrentUserContext.Provider value={{currentUser}}>
                {/* If history variable is not null, wrap the component in a path and a router*/}
                {history? (
                    <Router history={history}>
                        <Route path={`/${path}/:id`} render={() => component} />
                    </Router>
                ):(
                    /* If history variable is null, wrap the component in a browser router*/
                    <BrowserRouter>
                        {component}
                    </BrowserRouter>
                )}
            </CurrentUserContext.Provider>
            /* Also return history variable to keep track of url */
            ), history
        }
    )
}


export default renderWithContext