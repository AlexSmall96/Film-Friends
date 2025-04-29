/**
 * @vitest-environment jsdom
 */
import NavBar from './NavBar'
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { screen } from '@testing-library/react';
import { test, expect, describe} from 'vitest';
import setupTests from '../test-utils/setupTests';
import renderWithContext from '../test-utils/renderWithContext';
import userEvent from '@testing-library/user-event';

setupTests()

// The below code to remove matchmedia errors was taken from 
//https://stackoverflow.com/questions/39830580/jest-test-fails-typeerror-window-matchmedia-is-not-a-function
window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
};

setupTests()

const user = userEvent.setup()

describe('RENDERING CORRECT ICONS', () => {
    test('When no current user is provided, only logo, login and sign up links should be displayed.', () => {
        // Render component
        renderWithContext(<NavBar />, null, null, '/', null, null, null)
        // Assert login and sign up links are present
        const login = screen.getByRole('link', {name: 'Login'})
        expect(login).toBeInTheDocument()
        const signup = screen.getByRole('link', {name: 'Sign up'})
        expect(signup).toBeInTheDocument()
        // Logo should be present (name should be text combined with image alt text)
        const logo = screen.getByRole('heading', {name: 'FILM A bag of popcorn FRIENDS'})
        expect(logo).toBeInTheDocument()
        // Other links should not be present
        const loggedInNames = ['My Films', 'Friends', 'Reccomendations', 'Profile', 'Account Security', 'Logout', 'Delete Account']
        loggedInNames.map(name => {
            const nullLink = screen.queryByRole('link', {name})
            expect(nullLink).not.toBeInTheDocument()
        })
        // Avatar image should not be present
        const avatar = screen.queryByRole('img', {name: 'avatar'})
        expect(avatar).not.toBeInTheDocument()
    })
    test('When current user is provided, only logo and logged in icons should be displayed.', async () => {
        // Render component
        renderWithContext(<NavBar />, null, null, '/', null, null)    
        // Logo should be present (name should be text combined with image alt text)
        const logo = screen.getByRole('heading', {name: 'FILM A bag of popcorn FRIENDS'})
        expect(logo).toBeInTheDocument() 
        // Logged in icons should be present
        const loggedInNames = ['My Films', 'Friends', 'Reccomendations']
        loggedInNames.map(name => {
            const link = screen.getByRole('link', {name})
            expect(link).toBeInTheDocument()
        })  
        // Assert login and sign up links are not present
        const login = screen.queryByRole('link', {name: 'Login'})
        expect(login).not.toBeInTheDocument()
        const signup = screen.queryByRole('link', {name: 'Sign up'})
        expect(signup).not.toBeInTheDocument()
        // Avatar images should be present (should be 2 - one in normal navbar and one in off canvas body)
        const avatars = screen.getAllByRole('img', {name: 'avatar'})
        expect(avatars).toHaveLength(2)
        // Username and email should be present
        const username = screen.getByText('user1')
        expect(username).toBeInTheDocument()
        const email = screen.getByText('user1@email.com')
        expect(email).toBeInTheDocument()
        // Profile related links should not yet be present
        const profileLinkNames = ['Profile', 'Account Security', 'Logout', 'Delete Account']
        profileLinkNames.map(name => {
            const link = screen.queryByRole('link', {name})
            expect(link).not.toBeInTheDocument()
        })
        // Clicking avatar button should display profile related links
        const avatarButton = screen.getByRole('button', {name: 'avatar'})
        await user.click(avatarButton)
        profileLinkNames.map(name => {
            const link = screen.getByRole('link', {name})
            expect(link).toBeInTheDocument()
        })
    })
})