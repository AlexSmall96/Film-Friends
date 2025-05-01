/**
 * @vitest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { screen, fireEvent } from '@testing-library/react';
import { test, expect, describe } from 'vitest';
import setupTests from '../../test-utils/setupTests';
import userEvent from '@testing-library/user-event'
import renderWithContext from '../../test-utils/renderWithContext'
import EllipsisMenu from './EllipsisMenu';

setupTests()

const user = userEvent.setup()

const showMenu = async (
    publicFilm, 
    showModal, 
    Title="The Lord of the Rings: The Fellowship of the Ring", 
    imdbID= "tt0120737",
    currentUser={
        user: {username: 'user1', _id: 'user1id'}, token: 'user1token'
    }) => {
    const currentFilmData = {
        omdbData: {imdbID, Title},
        viewingData: {public: publicFilm}
    }
    const {component} = renderWithContext(<EllipsisMenu />, {currentFilmData, currentUser})
    const ellipsisIcon = component.container.getElementsByClassName('fa-ellipsis-vertical')[0]
    await user.click(ellipsisIcon) 
    if (showModal){
        const share = screen.getByText('Share')
        await user.click(share) 
    }   
    return component
}

const checkRecipients = (recipients, otherRequests) => {
    recipients.map(recipient => {
        const item = screen.getByText(recipient)
        expect(item).toBeInTheDocument()
    })
    otherRequests.map(name => {
        const item = screen.queryByText(name)
        expect(item).not.toBeInTheDocument()            
    })
}

describe('RENDERING CORRRECT OPTIONS', () => {
    test('Ellipsis Icon should load and when clicked on reveal correct options for public film.', async () => {
        // Render component as public film and click icon
        await showMenu(true, false)
        const optionsTextPublic = ['Share', 'Make Private', 'Remove from Watchlist']
        optionsTextPublic.map((text) => {
            const option = screen.getByText(text)
            expect(option).toBeInTheDocument()
        })
    })
    test('Ellipsis Icon should load and when clicked on reveal correct options for private film.', async() => {
        // Render component as private film and click icon
        await showMenu(false, false)
        const optionsTextPrivate = ['Share', 'Make Public', 'Remove from Watchlist']
        optionsTextPrivate.map((text) => {
            const option = screen.getByText(text)
            expect(option).toBeInTheDocument()
        })
    })
})

describe('MODAL LOADS CORRECTLY', () => {
    test('Clicking share loads modal, with film title, message, buttons and select recipient dropdown.', async () => {
        // Render component as public film and click icon
        await showMenu(true, false)
        const share = screen.getByText('Share')
        // Modal should not be present
        const modalNull = screen.queryByRole('dialog')
        expect(modalNull).not.toBeInTheDocument()
        // Click share
        await user.click(share)       
        // Modal should now be present
        const modal = screen.getByRole('dialog')
        expect(modal).toBeInTheDocument()
        // Select recipient dfropwon should be present
        const dropdown = screen.getByText(/Select recipient/)
        expect(dropdown).toBeInTheDocument()
        // Film Title should be present
        const title = screen.getByText("The Lord of the Rings: The Fellowship of the Ring")
        expect(title).toBeInTheDocument()
        // Input should be present but read only
        const input = screen.getByRole('textbox')
        expect(input).toBeInTheDocument()
        expect(input.readOnly).toBe(true)
        // Buttons should be present, close button should be enabled, send button should be disabled
        const closeBtn = screen.getAllByRole('button', {name: 'Close'})[0]
        expect(closeBtn).toBeInTheDocument()
        expect(closeBtn.disabled).toBe(false)
        const sendBtn = screen.getByRole('button', {name: 'Send'})
        expect(sendBtn).toBeInTheDocument()
        expect(sendBtn.disabled).toBe(true)
        // Close button should hide modal
        await user.click(closeBtn)
        expect(modalNull).not.toBeInTheDocument()
    })
    test('If film has already been shared with 1 user, recipient list should show remaining accepted friend requests.', async () => {
        // Render component as public film and click icon
        await showMenu(true, true)
        // Find and click recipient dropdown
        const dropdown = screen.getByText(/Select recipient/)
        await user.click(dropdown)
        // Should be user3 and user5 in recipient list
        const recipients = ['user3', 'user5']
        const otherRequests = ['user2', 'user4']
        checkRecipients(recipients, otherRequests )
    })
    test('If film has been shared with no users, recipient list should show all accepted friend requests.' , async () => {
        // Render component as public film and click icon
        await showMenu(true, true, 'Love Actually', 'tt0314331')     
        // Find and click recipient dropdown
        const dropdown = screen.getByText(/Select recipient/)
        await user.click(dropdown)
        // Should be user3, user4 and user5 in recipient list
        const recipients = ['user3', 'user4', 'user5']
        const otherRequests = ['user2']
        checkRecipients(recipients, otherRequests)
    })
    test('If film has been shared with all users, share button should not show modal.' , async () => {
        // Render component as public film and click icon
        const currentUser = {
            user: {
                username: 'user2',
                _id: 'user2id'
            },
            token: 'user2token'
        }
        await showMenu(true, false, 'Love Actually', 'tt0314331', currentUser)     
        const share = screen.getByText('Share')
        await user.click(share)
        // Modal should not be present
        const modal = screen.queryByRole('dialog')
        expect(modal).not.toBeInTheDocument()
    })
})

describe('SELECTING A USER AND SENDING RECCOMENDATION', () => {
    test('Recipient last can be filtered via search bar.', async () => {
        // Render component as public film and click icon
        await showMenu(true, true, 'Love Actually', 'tt0314331') 
        // Find and click recipient dropdown
        const dropdown = screen.getByText(/Select recipient/)
        await user.click(dropdown)
        // Type user4 into search bar
        const input = screen.getAllByRole('textbox')[0] 
        fireEvent.change(input, {target: {value: 'user4'}}) 
        // Only user4 should be present in recipient list
        const recipients = ['user4']
        const otherRequests = ['user2', 'user3', 'user5']
        checkRecipients(recipients, otherRequests)
    })
    test('When recipient is selected, username appears in modal header, text input and send button are enabled.', async () => {
        // Render component as public film and click icon
        await showMenu(true, true, 'Love Actually', 'tt0314331')
        // Find and click recipient dropdown
        const dropdown = screen.getByText(/Select recipient/)
        await user.click(dropdown)   
        // Select user4
        const user4 = screen.getByText('user4') 
        await user.click(user4)   
        // Dropdown should now have text user4
        expect(dropdown).toHaveTextContent('user4')  
        // Text input is enabled
        const input = screen.getAllByRole('textbox')[1]
        expect(input.readOnly).toBe(false)
        // Change value
        fireEvent.change(input, {target: {value: 'Love Actually is the best film ever. You should watch it.'}})
        expect(input).toHaveTextContent('Love Actually is the best film ever. You should watch it.')
        // Send button is enabled
        const sendBtn = screen.getByRole('button', {name: 'Send'})
        expect(sendBtn.disabled).toBe(false)
    })
})