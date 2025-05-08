import React from "react";
import NavBar from '../components/NavBar'
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render } from "@testing-library/react";
import { CurrentUserProvider } from "../contexts/CurrentUserContext";

// Renders component with CurrentUserProvider and a NavBar, along with Router to track url
// Used for LoginLogout tests and Sign up tests
const renderWithUserProvider = (component, path) => {

    const history = createMemoryHistory({ initialEntries: [path]})
    // The below code to remove matchmedia errors was taken from 
    //https://stackoverflow.com/questions/39830580/jest-test-fails-typeerror-window-matchmedia-is-not-a-function
    window.matchMedia = window.matchMedia || function() {
        return {
            matches: false,
            addListener: function() {},
            removeListener: function() {}
        };
    }
    
    render(
        <CurrentUserProvider>
            <Router history={history}>
                <NavBar />
                    <Route path={path} render={() => component} />
                </Router>
        </CurrentUserProvider>
    )

    return history
}

export default renderWithUserProvider

