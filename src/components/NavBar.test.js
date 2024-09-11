/**
 * @jest-environment jsdom
 */
import App from '../App'
import { render, screen} from '@testing-library/react';
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

// Test all nav links and form are present
test('When no currentUser is provided, should render only logged out nav links', () => {
    render(<App currentUser={null} />)
    const loggedOutNames = [/Sign up/i, /Login/i]
    const loggedInNames = [/My Films/i, /Profile/i, 'Friends', /Reccomendations/i]
    // Logged out links should be present
    loggedOutNames.map(
        linkName => expect(screen.getByRole('link', {
            name: linkName
        })).toBeInTheDocument()
    )
    // Logged in links should not be present
    loggedInNames.map(
        linkName => expect(screen.queryByRole('link', {
            name: linkName
        })).not.toBeInTheDocument()
    )
    // Logout list item should not be present
    const logout = screen.queryByText('Logout')
    expect(logout).not.toBeInTheDocument()
    // Logo should be present
    const logo = screen.getByRole('heading', {
        name: 'Film Friends'
    })
    expect(logo).toBeInTheDocument()
})

test('When currentUser is provided, should render only logged in nav links', () => {
    const currentUser = {
        user: {_id: '123'}
    }
    render(<App currentUser={currentUser}/>)
    const loggedOutNames = [/Sign up/i, /Login/i]
    const loggedInNames = [/My Films/i, /Profile/i, 'Friends', /Reccomendations/i]
    // Logged out links should not be present
    loggedOutNames.map(
        linkName => expect(screen.queryByRole('link', {
            name: linkName
        })).not.toBeInTheDocument()
    )
    // Logged in links should be present
    loggedInNames.map(
        linkName => expect(screen.getByRole('link', {
            name: linkName
        })).toBeInTheDocument()
    )
    // Logout list item should  be present
    const logout = screen.getByText('Logout')
    expect(logout).toBeInTheDocument()
    // Logo should be present
    const logo = screen.getByRole('heading', {
        name: 'Film Friends'
    })
    expect(logo).toBeInTheDocument()
})

test('Clicking logged out nav links changes text on home page and changes url', async () => {
    render(<App currentUser={null} />)
    const user = userEvent.setup()
    // Test logged out links
    const loggedOutNames = ['Sign up', 'Login']
    const loggedOutNavlinks = loggedOutNames.map(
        linkName => screen.getByRole('link', {
            name: linkName
        })
    )
    let n = loggedOutNames.length
    // Loop through links
    for (let i=0;i<n;i++) {
        // Corresponding heading should not be present before clicking on link
        let heading = screen.queryByRole('heading', {
            name: loggedOutNames[i]
        })
        expect(heading).not.toBeInTheDocument()
        // Url shouldn't contain name of link
        expect(global.window.location.href).not.toContain(loggedOutNames[i].replace(' ', '').toLowerCase())
        // Click on link
        await user.click(loggedOutNavlinks[i])
        // Heading now should now be present
        heading = screen.getByRole('heading', {
            name: loggedOutNames[i]
        })
        expect(heading).toBeInTheDocument()
        // Url should have changed to contain link name
        expect(global.window.location.href).toContain(loggedOutNames[i].replace(' ', '').toLowerCase())
    }
})

test('Clicking logged in nav links changes text on home page and changes url', async () => {
    const currentUser = {
        user: {_id: '123'}
    }
    render(<App currentUser={currentUser} />)
    const user = userEvent.setup()
    // Test logged in links
    const loggedInNames = ['My Films', 'Profile', 'Friends', 'Reccomendations']
    const loggedInNavlinks = loggedInNames.map(
        linkName => screen.getByRole('link', {
            name: linkName
        })
    )
    let n = loggedInNames.length
    // Loop through links
    for (let i=0;i<n;i++) {
        // Corresponding heading should not be present before clicking on link
        let heading = screen.queryByRole('heading', {
            name: loggedInNames[i]
        })
        expect(heading).not.toBeInTheDocument()
        // Url shouldn't contain name of link
        expect(global.window.location.href).not.toContain(loggedInNames[i].replace(' ', '').toLowerCase())
        // Click on link
        await user.click(loggedInNavlinks[i])
        // Heading now should now be present
        heading = screen.getByRole('heading', {
            name: loggedInNames[i]
        })
        expect(heading).toBeInTheDocument()
        // Url should have changed to contain link name
        expect(global.window.location.href).toContain(loggedInNames[i].replace(' ', '').toLowerCase())
    }
    // Test clicking on logo takes user back to home page
    const logo = screen.getByRole('heading', {
        name:'Film Friends'
    })
    let homePageHeading = screen.queryByRole('heading', {
        name: 'Home Page'
    })
    expect(homePageHeading).not.toBeInTheDocument()
    await user.click(logo)
    homePageHeading = screen.getByRole('heading', {
        name: 'Home Page'
    })
    expect(homePageHeading).toBeInTheDocument()
})
