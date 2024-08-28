/**
 * @jest-environment jsdom
 */
import App from '../App'
import { render, screen} from '@testing-library/react';
import '@testing-library/jest-dom'
import user from '@testing-library/user-event';

// Test all nav links and form are present
test('Should render navigation links and friend search', () => {
    render(<App />)
    const logo = screen.getByTestId('logo');
    // Assert that logo and all nav links are rendered
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveTextContent('Film Friends');
    const navLinksText = [
        /My Films/, /Profile/, /^Friends$/, /Reccomendations/, /Sign up/, /Login/, /Logout/
    ]
    const navLinks = navLinksText.map(
        text => screen.getByText(text)
    )
    navLinks.map(
        link => expect(link).toBeInTheDocument()
    )
    // Assert that the friend search bar is rendered
    const friendSearchLabel = screen.getByText(/Find your friends/)
    const friendSearchBar = screen.getByTestId('friend-search');
    expect(friendSearchLabel).toBeInTheDocument()
    expect(friendSearchBar).toBeInTheDocument()
})

// Clicking each nav link changes text on home page and changes url
test('Clicking nav links should navigate to the correct page', async () => {
    user.setup()
    render(<App />)
    // Define data used to map over nav links
    const navLinksText = [
        /Film Friends/, /My Films/, /Profile/, /^Friends$/, /Reccomendations/, /Sign up/, /Login/
    ]
    const navLinks = navLinksText.map(
        text => screen.getByText(text)
    )
    const headerIds = [
       'header-home', 'header-films','header-profile', 'header-friends','header-rec', 'header-signup', 'header-login', 
    ]
    // Assert appropriate heading changes when nav link is clicked
    for (let i=0;i<7;i++){
        await user.click(navLinks[i])
        let header = screen.getByTestId(headerIds[i]);
        expect(header).toBeInTheDocument()
        // If logo is clicked assert that the film search bar also appears
        if (i===0){
            const filmSearchLabel = screen.getByText(/Search for a film/)
            const filmSearchBar = screen.getByTestId('film-search');
            expect(filmSearchLabel).toBeInTheDocument()
            expect(filmSearchBar).toBeInTheDocument()
        }
        // Assert navbar is still present when navigating to a new page
        let navBar = screen.getByTestId('nav-bar')
        expect(navBar).toBeInTheDocument()
        // Assert url changes when nav link is clicked
        if (i !== 0){
            expect(global.window.location.href).toContain(headerIds[i].slice(7))
        } else {
            expect(global.window.location.href).toContain('/')
        }
    }
})