/**
 * @vitest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { screen } from '@testing-library/react';
import { test, expect, describe} from 'vitest';
import setupTests from '../test-utils/setupTests';
import renderWithContext from '../test-utils/renderWithContext';
import SaveDropown from './SaveDropdown';
import userEvent from '@testing-library/user-event';

setupTests()

const user = userEvent.setup()

describe('USING COMPONENT AS SEARCH RESULTS OR ANOTHER USERS FILM LIST', () => {
    test('When film is not saved to watchlist, save dropdown appears with correct options.', async () => {
        // Render component with no message and not yet saved to watchlist
        const filmPreviewData = {film: {Title: 'film 1'}}
        renderWithContext(<SaveDropown />, filmPreviewData)
        // Find button
        const saveButton = screen.getByRole('button', {name: 'Save'})
        expect(saveButton).toBeInTheDocument()
        // Remove button should not be present
        const removeButton = screen.queryByRole('button', {name: 'Remove'})
        expect(removeButton).not.toBeInTheDocument()
        // Dropdown options should not be present
        const saveToPublicBtnNull = screen.queryByRole('button', {name: 'Save to Public Watchlist'})
        expect(saveToPublicBtnNull).not.toBeInTheDocument()        
        const saveToPrivateBtnNull = screen.queryByRole('button', {name: 'Save to Private Watchlist'})
        expect(saveToPrivateBtnNull).not.toBeInTheDocument()
        // Saved text should not be present
        const savedText = screen.queryByText('Saved')
        expect(savedText).not.toBeInTheDocument()
        // Go to watchlist link should not be present
        const goToWatchlist = screen.queryByRole('button', {name: 'Go to your watchlist'})
        expect(goToWatchlist).not.toBeInTheDocument()
        // Click button, should make dropdown appear
        await user.click(saveButton)
        // Save to public and private watchlist buttons should appear
        const saveToPublicBtn = screen.getByRole('button', {name: 'Save to Public Watchlist'})
        expect(saveToPublicBtn).toBeInTheDocument()
        const saveToPrivateBtn = screen.getByRole('button', {name: 'Save to Private Watchlist'})
        expect(saveToPrivateBtn).toBeInTheDocument()
    })
    test('When film is saved to watchlist, text saying "save" should be displayed along with link to watchlist.', async () => {
        // Render component with no message and saved to watchlist
        const filmPreviewData = {
            savedToWatchlist: true, 
            film: {imdbID: 'im123', _id: 'id123'}
        }
        const homePagePath = '/'
        const props = null
        const { history } = renderWithContext(<SaveDropown />, filmPreviewData, props, homePagePath)
        // Remove button should not be present
        const removeButton = screen.queryByRole('button', {name: 'Remove'})
        expect(removeButton).not.toBeInTheDocument()
        // Save button should not be present
        const saveButton = screen.queryByRole('button', {name: 'Save'})
        expect(saveButton).not.toBeInTheDocument()
        // Dropdown options should not be present
        const saveToPublicBtnNull = screen.queryByRole('button', {name: 'Save to Public Watchlist'})
        expect(saveToPublicBtnNull).not.toBeInTheDocument()        
        const saveToPrivateBtnNull = screen.queryByRole('button', {name: 'Save to Private Watchlist'})
        expect(saveToPrivateBtnNull).not.toBeInTheDocument()
        // Saved text should be present
        const savedText = screen.getByText('Saved')
        expect(savedText).toBeInTheDocument()
        // Go to watchlist link should be present
        const goToWatchlist = screen.getByRole('button', {name: 'Go to your watchlist'})
        expect(goToWatchlist).toBeInTheDocument()
        // Clicking go to watchlist should change url
        await user.click(goToWatchlist)
        expect(history.location.pathname).toBe('/films/user1id')
    })
})

describe('USING COMPONENT IN A RECCOMENDATION', () => {
    test('Remove button should be present when used as a reccomendation', async () => {
        // Render component with a message
        const filmPreviewData = {
            film: {Title: 'film 1'},
            message: "Hey! Check out this awesome film I've just watched. I think you'll love it!"
        }
        renderWithContext(<SaveDropown />, filmPreviewData)
        // Remove button should be present
        const removeButton = screen.getByRole('button', {name: 'Remove'})
        expect(removeButton).toBeInTheDocument()
    })
})