/**
 * @vitest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { screen } from '@testing-library/react';
import { test, expect, describe} from 'vitest';
import setupTests from '../test-utils/setupTests';
import DeleteModal from './DeleteModal';
import userEvent from '@testing-library/user-event';
import renderWithContext from '../test-utils/renderWithContext';

setupTests()

const user = userEvent.setup()

const confirmMessage = 'Are you sure you want to remove film 1 from your reccomendations?'
const props = { confirmMessage }

describe('RENDERING CORRECT BUTTONS AND TEXT', () => {
    test('Only one button with text remove should be present', async () => {
        // Render component
        renderWithContext(<DeleteModal />, {props})
        // Only 1 button should be present
        const buttons = screen.getAllByRole('button')
        expect(buttons).toHaveLength(1)
        expect(buttons[0]).toHaveTextContent('Remove')
        // Modal and message should not be present
        const modal = screen.queryByRole('dialog')
        expect(modal).not.toBeInTheDocument()
        const modalMessage = screen.queryByText(confirmMessage)
        expect(modalMessage).not.toBeInTheDocument()
    })
    test('Clicking remove button should display modal text with yes and no buttons', async () => {
        // Render component
        renderWithContext(<DeleteModal />, {props})
        // Find and click button
        const button = screen.getAllByRole('button')[0]
        await user.click(button)
        // Modal and message should now be present
        const modal = screen.getByRole('dialog')
        expect(modal).toBeInTheDocument()
        const modalMessage = screen.getByText(confirmMessage)
        expect(modalMessage).toBeInTheDocument()
        // Yes and no buttons should be present
        const yesButton = screen.getByRole('button', {name: 'Yes'})
        const noButton = screen.getByRole('button', {name: 'No'})
        expect(yesButton).toBeInTheDocument()
        expect(noButton).toBeInTheDocument()
    })
})

describe('CLICKING MODAL BUTTONS', () => {
    test('Clicking no button hides modal', async () => {
        // Render component
        renderWithContext(<DeleteModal />, {props})
        // Find and click show button
        const button = screen.getAllByRole('button')[0]
        await user.click(button) 
        // Find and click no button
        const noButton = screen.getByRole('button', {name: 'No'})
        await user.click(noButton)
        // Modal and message should not be present
        const modal = screen.queryByRole('dialog')
        expect(modal).not.toBeInTheDocument()
        const modalMessage = screen.queryByText(confirmMessage)
        expect(modalMessage).not.toBeInTheDocument()
    })
    test('Clicking yes button changes button text to "deleting..."', async () => {
        // Render component
        const filmPreviewData = {resultId: {}}
        renderWithContext(<DeleteModal />, {props, filmPreviewData})
        // Find and click show button
        const button = screen.getAllByRole('button')[0]
        await user.click(button) 
        // Find and click yes button
        const yesButton = screen.getByRole('button', {name: 'Yes'})
        await user.click(yesButton)
        // Button text should have changed to deleting...
        expect(yesButton).toHaveTextContent('Deleting...')
        // No button should not be present
        const noButton = screen.queryByRole('button', {name: 'No'})
        expect(noButton).not.toBeInTheDocument()     
    })
})