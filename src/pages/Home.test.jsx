/**
 * @vitest-environment jsdom
 */
import Home from './Home';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { describe, test, expect } from 'vitest';
import {CurrentUserProvider} from '../contexts/CurrentUserContext'
import setupTests from '../test-utils/setupTests'
import renderWithContext from '../test-utils/renderWithContext';
import { server } from '../mocks/server';
import { handlers } from '../mocks/handlers';
import { HttpResponse, http } from "msw";
const url = 'http://localhost:3001'

setupTests()

// Create films array to update get films handler
// Only imdbIDs are required as it is only being used to determine film button text
const user2UpdatedFilms = [
    {
        imdbID: "tt0080684",
    },
    {
		imdbID: "tt0076759",
	}, {
		imdbID: "tt0120915",		
	}, {
		imdbID: "tt0120737",		
	}
]

describe('RENDERING ELEMENTS', () => {
    test('Search box, search button, and hero image are present', async () => {
        renderWithContext(<Home />, null)
        // Find searchbox
        const searchBox = screen.getByRole('textbox')
        expect(searchBox).toBeInTheDocument()
        // Find search button
        const searchButton = screen.getByRole('button')
        expect(searchButton).toBeInTheDocument()
        // Find image
        const image = screen.getByRole('img', {name: /A close up of film tape/i})
        expect(image).toBeInTheDocument()
        expect(image.src).toBe('https://res.cloudinary.com/dojzptdbc/image/upload/v1729270408/movie2_h1bnwo.png')
    })
    test('Results message not yet present', async () => {
        renderWithContext(<Home />, null)
        const message = screen.queryByText('Showing results 1 to 3 of 3')
        expect(message).not.toBeInTheDocument()
    })
})

describe('FILM SEARCH FUNCTIONALITY', () => {
    test('Searching with empty query does nothing', async () => {
        renderWithContext(<Home />, null)
        // Find search button
        const searchButton = screen.getByRole('button')
        const user = userEvent.setup()
        // Click search button with empty query
        await user.click(searchButton)
        // Image should still be present
        const image = screen.getByRole('img', {name: /A close up of film tape/i})
        expect(image).toBeInTheDocument()
    })
    test('Searching with valid query produces correct results', async () => {
        renderWithContext(<Home />, null)
        // Find searchbox and search button
        const searchBox = screen.getByRole('textbox')
        const searchButton = screen.getByRole('button')
        // Input search query
        fireEvent.change(searchBox, {target: {value: 'star wars'}})
        const user = userEvent.setup()
        await user.click(searchButton)
        // Pagination message should be present
        const message = screen.getByText('Showing results 1 to 3 of 3')
        expect(message).toBeInTheDocument()
        // Pagination component should not be present because results are only 1 page
        const pagination = screen.queryByRole('list')
        expect(pagination).not.toBeInTheDocument()
    })
    test('Pagination works as expected when results are long enough', async () => {
        renderWithContext(<Home />, null)
        // Find searchbox and search button
        const searchBox = screen.getByRole('textbox')
        const searchButton = screen.getByRole('button')
        // Input search query
        fireEvent.change(searchBox, {target: {value: 'film'}})
        const user = userEvent.setup()
        await user.click(searchButton)
        // Pagination message should be present
        const pageOneMessage = screen.getByText('Showing results 1 to 10 of 20')
        expect(pageOneMessage).toBeInTheDocument()
        // Pagination component should be present
        const pagination = screen.getByRole('list')
        expect(pagination).toBeInTheDocument()
        // Correct films are displayed
        for (let i=0;i<10;i++) {
            expect(screen.getByText(`film ${i}`)).toBeInTheDocument()
        }
        // Clicking pagination should change film results and message
        await user.click(pagination.children[1].children[0])
        const pageTwoMessage = screen.getByText('Showing results 11 to 20 of 20')
        expect(pageTwoMessage).toBeInTheDocument()
        // Correct films are displayed
        for (let i=10;i<20;i++) {
            expect(screen.getByText(`film ${i}`)).toBeInTheDocument()
        }
    })
    test('Searching with invalid query produces error message', async () => {
        renderWithContext(<Home />, null)
        // Find searchbox and search button
        const searchBox = screen.getByRole('textbox')
        const searchButton = screen.getByRole('button')
        // Input invalid search query
        fireEvent.change(searchBox, {target: {value: 'starwars2'}})
        const user = userEvent.setup()
        await user.click(searchButton)
        const errorMessage = screen.getByText('There are no results matching your search.')
        expect(errorMessage).toBeInTheDocument()
        // No images should be present
        const images = screen.queryByRole('img')
        expect(images).not.toBeInTheDocument()
        // Pagination should not be present
        const pagination = screen.queryByRole('list')
        expect(pagination).not.toBeInTheDocument()
    })
    test('No results are displayed if search is too general, hero image is displayed', async () => {
        renderWithContext(<Home />, null)
        // Find searchbox and search button
        const searchBox = screen.getByRole('textbox')
        const searchButton = screen.getByRole('button')
        // Input too general search query
        fireEvent.change(searchBox, {target: {value: 'the'}})
        const user = userEvent.setup()
        await user.click(searchButton)
        // Hero Image should be present
        const image = screen.getByRole('img', {name: /A close up of film tape/i})
        expect(image).toBeInTheDocument()
    })
})

describe('BUTTON FUNCTIONALITY', () => {
    test('When user is not logged in, login and sign up buttons appear above search results', async () => {
        renderWithContext(<Home />, null)
        // Find searchbox and search button
        const searchBox = screen.getByRole('textbox')
        const searchButton = screen.getByRole('button')
        // Input search query
        fireEvent.change(searchBox, {target: {value: 'star wars'}})
        const user = userEvent.setup()
        await user.click(searchButton)
        // Login and sign up buttons should appear
        const loginButton = screen.getByRole('button', {name: /Login/i})
        const signupButton = screen.getByRole('button', {name: /Sign up/i})
        expect(loginButton).toBeInTheDocument()
        expect(signupButton).toBeInTheDocument()
        // Buttons redirect user to correct page
        await user.click(loginButton)
        expect(global.window.location.href).toContain('/login')
        await user.click(signupButton)
        expect(global.window.location.href).toContain('/signup')
    })
    test('When user is logged in, correct buttons appear in search results and function as expected', async () => {
        renderWithContext(<Home />)
        // Find searchbox and search button
        const searchBox = screen.getByRole('textbox')
        const searchButton = screen.getByRole('button')
        // Input search query
        fireEvent.change(searchBox, {target: {value: 'star wars'}})
        const user = userEvent.setup()
        await user.click(searchButton)
        // Two films should have save button, 1 film should have go to watchlist button
        let goToWatchListButtons = screen.getAllByRole('button', {name: /Go to watchlist/i})
        expect(goToWatchListButtons).toHaveLength(1)
        const saveButtons = screen.getAllByRole('button', {name: /Save/i})
        expect(saveButtons).toHaveLength(2)
        // Clicking go to watchlist button should redirect user to films page
        await user.click(goToWatchListButtons[0])
        expect(global.window.location.href).toContain('/films/user2id')
        // Dropdown options not yet showing
        let saveToPublicWatchlist = screen.queryByRole('button', {name: /Save to Public Watchlist/i})
        let saveToPrivateWatchlist = screen.queryByRole('button', {name: /Save to Private Watchlist/i})
        expect(saveToPublicWatchlist).not.toBeInTheDocument()
        expect(saveToPrivateWatchlist).not.toBeInTheDocument()
        // Clicking save button reveals dropdown options
        await user.click(saveButtons[0])
        saveToPublicWatchlist = screen.getByRole('button', {name: /Save to Public Watchlist/i})
        saveToPrivateWatchlist = screen.getByRole('button', {name: /Save to Private Watchlist/i})
        expect(saveToPublicWatchlist).toBeInTheDocument()
        expect(saveToPrivateWatchlist).toBeInTheDocument()
        // Clicking save to watchlist changes button text
        // Reset handlers to reflect how database would change
        server.resetHandlers(
            http.get(`${url}/films/user2id`, () => {
                    return HttpResponse.json({
                        films: user2UpdatedFilms
                    }, {status: 200})
            }), ...handlers
        )
        // Should still only be 1 go to watchlist button
        goToWatchListButtons = screen.getAllByRole('button', {name: /Go to watchlist/i})
        expect(goToWatchListButtons).toHaveLength(1)
        // Save film
        await user.click(saveToPublicWatchlist)
        goToWatchListButtons = screen.getAllByRole('button', {name: /Go to watchlist/i})
        // Should now be 2 go to watchlist buttons and 1 save button
        const buttons = screen.getAllByRole('button')
        expect(buttons[1]).toHaveTextContent('Go to watchlist')
        expect(buttons[2]).toHaveTextContent('Go to watchlist')
        expect(buttons[3]).toHaveTextContent('Save')
        // Dropdown options should be gone
        saveToPublicWatchlist = screen.queryByRole('button', {name: /Save to Public Watchlist/i})
        saveToPrivateWatchlist = screen.queryByRole('button', {name: /Save to Private Watchlist/i})
        expect(saveToPrivateWatchlist).not.toBeInTheDocument()
        expect(saveToPublicWatchlist).not.toBeInTheDocument()
    })
})