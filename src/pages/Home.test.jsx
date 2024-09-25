/**
 * @vitest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import {within} from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, afterEach, beforeAll, afterAll, beforeEach } from 'vitest';
import { HttpResponse, http } from "msw";
import { server } from '../mocks/server'
import {handlers} from '../mocks/handlers'
import Home from './Home';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import { BrowserRouter as Router } from 'react-router-dom/cjs/react-router-dom.min';
const url = 'http://localhost:3001'

const renderWithContext = (component, currentUser = {user : {username: 'User One',_id: '123'}, token: '123'}) => {
    return render(
        <Router>
            <CurrentUserContext.Provider value={{currentUser}}>
                    {component}
            </CurrentUserContext.Provider>
        </Router>
    )
}

beforeAll(() => {
    server.listen()
})

beforeEach(() => {
    server.resetHandlers(...handlers)
})

afterEach(() => {
    cleanup()
})
  
afterAll(() => {
    server.close()
})

describe('RENDERING ELEMENTS', () => {
    test('Heading and search bar are rendered', () => {
        renderWithContext(<Home />, null)
        const heading = screen.getByRole('heading')
        expect(heading).toBeInTheDocument()
        const searchBox = screen.getByRole('searchbox')
        expect(searchBox).toBeInTheDocument()
    })
    test('User can input text into search bar', () => {
        renderWithContext(<Home />, null)
        const searchBox = screen.getByRole('searchbox')
        fireEvent.change(searchBox, {target: {value: 'star wars'}})
        expect(searchBox.value).toBe('star wars')
    })
    test('Pagination not rendered yet, no buttons rendered', () => {
        renderWithContext(<Home />, null)
        const pageTabs = screen.queryByRole('list')
        expect(pageTabs).not.toBeInTheDocument()
        const button = screen.queryByRole('button')
        expect(button).not.toBeInTheDocument()
    })
})

describe('FILM SEARCH FUNCTIONALITY', () => {
    test('Correct data is returned with valid query, no save buttons appear if user is not logged in ', async () => {
        renderWithContext(<Home />, null)
        const searchBox = screen.getByRole('searchbox', {name: /Search for a film/i})
        fireEvent.change(searchBox, {target: {value: 'star wars'}})
        await waitFor(() => {
            // Results appear
            const resultsTable = screen.getByRole('table');
            expect(resultsTable).toBeInTheDocument();
            // No buttons present
            const buttons = within(resultsTable).queryByRole('button')
            expect(buttons).not.toBeInTheDocument()
            // Correct data is returned, should only be 2 out of the 3 as games are not included
            const filmOne = screen.getByText(
                'Title: Star Wars: Episode IV - A New Hope, Year: 1977, Type: movie'
            )
            const filmTwo = screen.getByText(
                'Title: Star Wars: Episode V - The Empire Strikes Back, Year: 1980, Type: series'
            )
            const filmThree = screen.queryByText(
                'Title: Star Wars: Episode VI - Return of the Jedi, Year: 1983, Type: game'
            )
            expect(filmOne).toBeInTheDocument()
            expect(filmTwo).toBeInTheDocument()
            expect(filmThree).not.toBeInTheDocument()
            // Image urls are used correctly, N/A is replaced with default image hosted on cloudinary
            const images = screen.getAllByRole('img')
            expect(images).toHaveLength(2)
            expect(images[0].src).toBe('https://res.cloudinary.com/dojzptdbc/image/upload/v1726945998/default-movie_uajvdm.png')
            expect(images[1].src).toBe("https://m.media-amazon.com/images/M/MV5BYmU1NDRjNDgtMzhiMi00NjZmLTg5NGItZDNiZjU5NTU4OTE0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg")
        });
    })

    test('Pagination tab appears when user searches with valid query', async () => {
        renderWithContext(<Home />)
        const searchBox = screen.getByRole('searchbox', {name: /Search for a film/i})
        fireEvent.change(searchBox, {target: {value: 'star wars'}})
        await waitFor(() => {
            // Results appear with pagination component above
            const pageTabs = screen.getByRole('list')
            // Should show 1 tab with text '1'
            expect(pageTabs.children).toHaveLength(1)
            const currentPageTab = within(pageTabs).getByText('1')
            expect(currentPageTab).toBeInTheDocument()
        })
    })
    test('Clicking pagination buttons changes search results', async () => {
        // Create an array of 21 films to test pagination
        const resultsArray = []
        for (let i=0;i<21;i++) {
            let film = {
                Title: `film ${i}`,
                Year: '1996',
                imdbID: `film${i}ID`,
                Type: 'movie',
                Poster: 'N/A'
            }
            resultsArray.push(film)
        }
        // Reset handlers to use page query
        server.resetHandlers(
            http.get(`${url}/filmData/`, ({request}) => {
                const url = new URL(request.url)
                const currentPage = url.searchParams.get('page')
                const startIndex = 10 * (currentPage - 1)
                const endIndex = 10 * (currentPage - 1) + 10
                return HttpResponse.json({
                    Search: resultsArray.slice(startIndex, endIndex),
                    totalResults: 21,
                    Response: true
                }, {status: 200})
            }), ...handlers
        )
        renderWithContext(<Home />)
        const searchBox = screen.getByRole('searchbox', {name: /Search for a film/i})
        fireEvent.change(searchBox, {target: {value: 'film'}})
        await waitFor(() => {
            // Results appear with pagination component above
            const pageTabs = screen.getByRole('list')
            // Should be 5 tabs initially
            expect(pageTabs.children).toHaveLength(5)
            // Correct pagination message should appear
            expect(screen.getByText('Showing results 1 to 10 of 21')).toBeInTheDocument()
            // Only the first 10 films should be present
            for (let i=0;i<21;i++) {
                if (i < 10){
                    expect(screen.getByText(`Title: film ${i}, Year: 1996, Type: movie`)).toBeInTheDocument()
                } else {
                    expect(screen.queryByText(`Title: film ${i}, Year: 1996, Type: movie`)).not.toBeInTheDocument()
                }
            }
        })
        const pageTabs = screen.getByRole('list')
        const user = userEvent.setup()
        await waitFor(() => {
            // Click the next page button
            user.click(pageTabs.children[1].children[0])
            // Correct pagination message should appear
            expect(screen.getByText('Showing results 11 to 20 of 21')).toBeInTheDocument()
            // Only films 10 - 20 should be present
            for (let i=0;i<21;i++) {
                if (10 <= i && i < 20){
                    expect(screen.getByText(`Title: film ${i}, Year: 1996, Type: movie`)).toBeInTheDocument()
                } else {
                    expect(screen.queryByText(`Title: film ${i}, Year: 1996, Type: movie`)).not.toBeInTheDocument()
                }
            }
        })
        await waitFor(() => {
            // Click the next page button
            user.click(pageTabs.children[3].children[0])
            // Correct pagination message should appear
            expect(screen.getByText('Showing results 21 to 21 of 21')).toBeInTheDocument()
            // Final film should appear
            expect(screen.getByText(`Title: film ${20}, Year: 1996, Type: movie`)).toBeInTheDocument()
        })
    })

    test('Sign up and Log in buttons appear if user is not logged in, and redirect user to correct page', async () => {
        renderWithContext(<Home />, null)
        let searchBox = screen.getByRole('searchbox', {name: /Search for a film/i})
        fireEvent.change(searchBox, {target: {value: 'star wars'}})
        const user = userEvent.setup()
        await waitFor(() => {
            // Sign in button appears
            let signUpButton = screen.getByRole('button', {name: /Sign Up/i})
            expect(signUpButton).toBeInTheDocument()
            // Click sign up button
            user.click(signUpButton)
            // URl should have changed
            expect(global.window.location.href).toContain('signup')
        })
        cleanup()
        renderWithContext(<Home />, null)
        searchBox = screen.getByRole('searchbox', {name: /Search for a film/i})
        fireEvent.change(searchBox, {target: {value: 'star wars'}})
        await waitFor(() => {
            // login button appears
            let loginButton = screen.getByRole('button', {name: /Login/i})
            expect(loginButton).toBeInTheDocument()
            // Click login button
            user.click(loginButton)
            // URl should have changed
            expect(global.window.location.href).toContain('login')
        })
    })

    test('Correct buttons appear in search results if user is logged in', async () => {
        renderWithContext(<Home />)
        let searchBox = screen.getByRole('searchbox', {name: /Search for a film/i})
        fireEvent.change(searchBox, {target: {value: 'star wars'}})
        await waitFor(() => {
            const buttons = screen.getAllByRole('button')
            // First button has text go to watchlist
            expect(buttons[0]).toHaveTextContent('Go to watchlist')
            // Second and third buttons are save to watchlist button
            expect(buttons[1]).toHaveTextContent('Save to public watchlist.')
            expect(buttons[2]).toHaveTextContent('Save to private watchlist.')
        })
    })
    test('No data is returned if search has too many matches', async () => {
        renderWithContext(<Home />)
        server.resetHandlers(
            http.get(`${url}/filmData/`, () => {
                return HttpResponse.json({
                    Response: "False",
                    Error: "Too many results."
                }, {status: 200})
            }), ...handlers
        )
        const searchBox = screen.getByRole('searchbox')
        fireEvent.change(searchBox, {target: {value: 'the'}})
        // Expect table of film results not to appear
        const resultsTable = screen.queryByRole('table')
        expect(resultsTable).not.toBeInTheDocument()
        // Customer error message should not have been rendered
        const errorMessage = screen.queryByText('There are no results matching your search.')
        expect(errorMessage).not.toBeInTheDocument()
    })

    test('Error message is displayed if no matches found', async () => {
        renderWithContext(<Home />)
        server.resetHandlers(
            http.get(`${url}/filmData/`, () => {
                return HttpResponse.json({
                    Response: "False",
                    Error: 'Movie not found!'
                }, {status: 200})
            }), ...handlers
        )
        const searchBox = screen.getByRole('searchbox')
        fireEvent.change(searchBox, {target: {value: 'thee'}})
        // Customer error message should have been rendered
        await waitFor(() => {
            const errorMessage = screen.getByText('There are no results matching your search.')
            expect(errorMessage).toBeInTheDocument()
        })
    })
})

describe('BUTTON FUNCTIONALITY', () => {
    test('Go to watchlist button redirects user to profile page', async () => {
        renderWithContext(<Home />)
        const searchBox = screen.getByRole('searchbox', {name: /Search for a film/i})
        fireEvent.change(searchBox, {target: {value: 'star wars'}})
        const user = userEvent.setup()
        // Clicking go to watchlist button takes user to profile page
        await waitFor(() => {
            const buttons = screen.getAllByRole('button')
            user.click(buttons[0])
            expect(global.window.location.href).toContain(`/profile/123`)
        })
    })
    test('Clicking save to watchlist buttons changes button text', async () => {
        // Clicking save to watchlist buttons changes button text to 'Go to watchlist'
        renderWithContext(<Home />)
        const searchBox = screen.getByRole('searchbox', {name: /Search for a film/i})
        fireEvent.change(searchBox, {target: {value: 'star wars'}})
        await waitFor(() => {
            // Should only be 1 button with text 'Go to watchlist'
            expect(screen.getAllByText('Go to watchlist')).toHaveLength(1)
        })
        // Reset user data handler to mock how data would change
        server.resetHandlers(
            http.get(`${url}/users/:id`, () => {
                return HttpResponse.json({
                    profile : {},
                    films: [
                        {imdbID:'tt0076759'},
                        {imdbID: 'tt0080684'}
                    ]
                }, {status: 200})
            }), ...handlers
        )
        // Get buttons that save a film
        const saveButtons = screen.getAllByText('Save to public watchlist.')
        const user = userEvent.setup()
        // Click a save button to save that film
        await user.click(saveButtons[0])
        await waitFor(() => {
            // Should now be 2 buttons with text 'Go to watchlist'
            expect(screen.getAllByText('Go to watchlist')).toHaveLength(2)
            // No buttons should have text 'Save to public/private watchlist.'
            expect(screen.queryAllByText('Save to public watchlist.')).toHaveLength(0)
            expect(screen.queryAllByText('Save to private watchlist.')).toHaveLength(0)
        })
    })
})
