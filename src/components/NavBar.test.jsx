/**
 * @vitest-environment jsdom
 */
import NavBar from '../components/NavBar';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { describe, test, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import renderWithContext from '../test-utils/renderWithContext';

afterEach(() => {
    cleanup();
});

// Test all nav links and form are present
describe('Correct nav links and search bar are rendered', () => {
    test('renders only logged out nav links when no currentUser is provided', () => {
        renderWithContext(<NavBar />, null)
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
        renderWithContext(<NavBar />)
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
})

describe('Nav links take user to correct page',() => {
    test('Clicking logged out nav links changes url', async () => {
        renderWithContext(<NavBar />, null)
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
            // Url shouldn't contain name of link
            expect(global.window.location.href).not.toContain(loggedOutNames[i].replace(' ', '').toLowerCase())
            // Click on link
            await user.click(loggedOutNavlinks[i])
            // Url should have changed to contain link name
            expect(global.window.location.href).toContain(loggedOutNames[i].replace(' ', '').toLowerCase())
        }
    })
    test('Clicking logged in nav links, excluding logout, changes url', async () => {
        renderWithContext(<NavBar />)
        const user = userEvent.setup()
        // Test logged out links
        const loggedInNames = ['My Films', 'Profile', 'Friends', 'Reccomendations']
        const loggedInNavlinks = loggedInNames.map(
            linkName => screen.getByRole('link', {
                name: linkName
            })
        )
        let n = loggedInNames.length
        // Loop through links
        for (let i=0;i<n;i++) {
            // Url shouldn't contain name of link
            expect(global.window.location.href).not.toContain(loggedInNames[i].replace(' ', '').toLowerCase())
            // Click on link
            await user.click(loggedInNavlinks[i])
            // Url should have changed to contain link name
            expect(global.window.location.href).toContain(loggedInNames[i].replace(' ', '').toLowerCase())
        }
    })
})