import React from "react"
import { CurrentUserContext } from "../contexts/CurrentUserContext"
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom/cjs/react-router-dom.min';

const renderWithContext = (component, currentUser = {user : {username: 'User One',_id: '123'}, token: '123'}) => {
    return render(
        <CurrentUserContext.Provider value={{currentUser}}>
            <Router>
                {component}
            </Router>
        </CurrentUserContext.Provider>
    )
}

export default renderWithContext