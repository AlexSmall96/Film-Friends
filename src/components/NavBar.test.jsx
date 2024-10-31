/**
 * @vitest-environment jsdom
 */
import NavBar from './NavBar'
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { screen } from '@testing-library/react';
import { describe, test, expect} from 'vitest';
import renderWithContext from '../test-utils/renderWithContext'
import setupTests from '../test-utils/setupTests';

setupTests()

describe('RENDERING CORRECT NAV LINKS', () => {
    test('When no current user is provided, only logged out links are rendered', async () => {
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
        const logo = screen.getByRole('link', {
            name: 'Film Friends'
        })
        expect(logo).toBeInTheDocument()
    })
    test('When current user is provided, only logged in links are rendered', async () => {
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
        const logo = screen.getByRole('link', {
            name: 'Film Friends'
        })
        expect(logo).toBeInTheDocument()
    })
})