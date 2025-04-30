/**
 * @vitest-environment jsdom
 */
import ShareModal from './ShareModal'
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { screen, fireEvent } from '@testing-library/react';
import { test, expect, describe} from 'vitest';
import setupTests from '../../test-utils/setupTests';
import renderWithContext from '../../test-utils/renderWithContext';
import userEvent from '@testing-library/user-event';

setupTests()

const user = userEvent.setup()

const posters = {
    StarWars4: 'https://m.media-amazon.com/images/M/MV5BOGUwMDk0Y2MtNjBlNi00NmRiLTk2MWYtMGMyMDlhYmI4ZDBjXkEyXkFqcGc@._V1_SX300.jpg',
    StarWars1: 'https://m.media-amazon.com/images/M/MV5BNTgxMjY2YzUtZmVmNC00YjAwLWJlODMtNDBhNzllNzIzMjgxXkEyXkFqcGc@._V1_SX300.jpg',
    LOTR1:  'https://m.media-amazon.com/images/M/MV5BNzIxMDQ2YTctNDY4MC00ZTRhLTk4ODQtMTVlOWY4NTdiYmMwXkEyXkFqcGc@._V1_SX300.jpg',
	LoveActually: 'https://m.media-amazon.com/images/M/MV5BZDFlOWUxMGUtYmZmOC00ZGRlLTk4OWUtYzJhMmEwM2VjZjU5XkEyXkFqcGc@._V1_SX300.jpg'
}

// Renders the component with supplied data and clicks button to show modal
const showModal = async (request, path, currentUser) => {
    // Setup data
    const friendData = { request }
    // Render component
    const { history } = renderWithContext(<ShareModal />, {path, friendData, currentUser})
    // Find and click share button
    const shareButton = screen.getByRole('button', {name: 'Share'})
    await user.click(shareButton)
    return history
}


describe('RENDERING CORRECT FILM LIST', () => {
    test('IF a film has already been shared with reciever, films list should show current users remaining public films.', async () => {
        // Render component with request to user2
        const request = {
            isSender: true,
            reciever: {
                _id: 'user2id',
                username: 'user2',
            },
            sender: {
                _id: 'user1id',
                username: 'user1`',
            }
        }
        await showModal(request)
        // Modal should now be visible
        const modal = screen.getByRole('dialog')
        expect(modal).toBeInTheDocument()
        // Should show two films since Star Wars 1 has already been shared with user2
        const images = screen.getAllByRole('img')
        expect(images).toHaveLength(2)
        // Film posters should be LOTR 1 and Star Wars 4 
        expect(images[0].src).toBe(posters.LOTR1)
        expect(images[1].src).toBe(posters.StarWars1)
    })
    test('If no films have been sent to reciever yet, films list should show all current users public films.', async () => {
        // Render component with request to user3
        const request = {
            isSender: true,
            reciever: {
                _id: 'user3id',
                username: 'user3',
            },
            sender: {
                _id: 'user1id',
                username: 'user1`',
            }
        }
        await showModal(request)
        // Should show all films since no reccomendations have been sent to user4
        const images = screen.getAllByRole('img')
        expect(images).toHaveLength(3)
        // Film posters should be LOTR 1 Star Wars 4 and Star Wars 1, in default order.
        expect(images[0].src).toBe(posters.LOTR1)
        expect(images[1].src).toBe(posters.StarWars4)
        expect(images[2].src).toBe(posters.StarWars1)
    })
    test('If user has already shared all public films with reciever, feedback and links should be displayed.', async () => {
        // Render component with request to user4
        const request = {
            isSender: true,
            reciever: {
                _id: 'user4id',
                username: 'user4',
            },
            sender: {
                _id: 'user1id',
                username: 'user1`',
            }
        }
        const history = await showModal(request, '/friends')
        // Feedback message should be present
        const feedback = screen.getByText(/You've shared all your public films with user4./)
        expect(feedback).toBeInTheDocument()
        // Links to home page and watchlist should be present
        const watchlistLink = screen.getByRole('button', {name: 'Update your films list'})
        expect(watchlistLink).toBeInTheDocument()
        // Watchlist link changes url
        await user.click(watchlistLink)
        expect(history.location.pathname).toBe('/films/user1id')
    })
    test('If user has no public films, feedback and link to films page should be displayed.', async () => {
        // Render component with any request
        const request = {
            isSender: true,
            reciever: {
                _id: 'user4id',
                username: 'user4',
            },
            sender: {
                _id: 'user1id',
                username: 'user1`',
            }
        } 
        const currentUser = {user: {username: 'user2', _id: 'user2id'}, token: 'user2token'}
        const history = await showModal(request, '/friends', currentUser)
        // Feedback message should be present
        const feedback = screen.getByText(/You don't have any public films./)
        expect(feedback).toBeInTheDocument() 
        const watchlistLink = screen.getByRole('button', {name: 'Go to your watchlist'})
        expect(watchlistLink).toBeInTheDocument()
        // Watchlist link changes url
        await user.click(watchlistLink)
        expect(history.location.pathname).toBe('/films/user2id')
    })
})

describe('SORTING AND SELECTING FILMS, SENDING RECCOMENDATION', () => {
    test('When films are available to share, sort button is displayed and sorts the films correctly.', async () => {
        // Render component with request to user3
        const request = {
            isSender: true,
            reciever: {
                _id: 'user3id',
                username: 'user3',
            },
            sender: {
                _id: 'user1id',
                username: 'user1`',
            }
        }
        await showModal(request, '/friends')
        // Sort dropdown should be present
        const sortButton = screen.getByRole('button', {name: 'Last Updated'})
        expect(sortButton).toBeInTheDocument()     
        // Cick sort button
        await user.click(sortButton)
        // Find and click sort A-Z
        const sortAZ = screen.getByRole('button', {name: 'A-Z'})
        await user.click(sortAZ)
        // Find images, should be 3, sorted A-Z
        const images = screen.getAllByRole('img')
        expect(images).toHaveLength(3)
        expect(images[0].src).toBe(posters.StarWars1)
        expect(images[1].src).toBe(posters.StarWars4)
        expect(images[2].src).toBe(posters.LOTR1)
    })
    test('Clicking on a film displays film title underneath username and enables form input and send button.', async () => {
        // Render component with request to user3
        const request = {
            isSender: true,
            reciever: {
                _id: 'user3id',
                username: 'user3',
            },
            sender: {
                _id: 'user1id',
                username: 'user1`',
            }
        }
        await showModal(request, '/friends')
        // Only username should be present in modal header
        const username = screen.getByText('user3')
        expect(username).toBeInTheDocument()
        // LOTR title should not yet be present
        const filmTitleNull = screen.queryByText("The Lord of the Rings: The Fellowship of the Ring")
        expect(filmTitleNull).not.toBeInTheDocument()
        // Send button should be disabled
        const sendButton = screen.getByRole('button', {name: 'Send'})
        expect(sendButton).toBeInTheDocument()
        expect(sendButton.disabled).toBe(true)
        // Input should be read only
        const input = screen.getByRole('textbox')
        expect(input).toBeInTheDocument()
        expect(input.readOnly).toBe(true)
        // Find images
        const images = screen.getAllByRole('img')
        await user.click(images[0])
        // LOTR title should now be present
        const filmTitle = screen.getByText("The Lord of the Rings: The Fellowship of the Ring") 
        expect(filmTitle).toBeInTheDocument()
        // Form input should have default text
        expect(input).toHaveTextContent("Hey! Check out this awesome film I've just watched. I think you'll love it!")
        // Text can be changed
        fireEvent.change(input, {target: {value: 'LOTR is the best film ever. You should watch it.'}})    
        expect(input).toHaveTextContent('LOTR is the best film ever. You should watch it.')
        // Send button can now be clicked
        expect(sendButton.disabled).toBe(false)
        // Text saying sent should not yet be present
        const sentTextNull = screen.queryByText('Sent')
        expect(sentTextNull).not.toBeInTheDocument()
        // Click send
        await user.click(sendButton)
        // Text saying sent should be present
        const sentText = screen.getByText('Sent')
        expect(sentText).toBeInTheDocument()
        // Send button should be disabled
        expect(sendButton.disabled).toBe(true)
        // Input should be read only
        expect(input.readOnly).toBe(true)
        // Clicking close button hides modal
        const closeButton = screen.getByRole('button', {name: 'Close'})
        expect(closeButton).toBeInTheDocument()
        await user.click(closeButton)
        const modal = screen.queryByRole('dialog')
        expect(modal).not.toBeInTheDocument()
    })
})