/**
 * @vitest-environment jsdom
 */
import IconRating from './IconRating'
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { screen, render, waitFor, cleanup } from '@testing-library/react';
import { test, expect} from 'vitest';
import setupTests from '../../test-utils/setupTests';
import userEvent from '@testing-library/user-event'

setupTests()

// Define data to be passed as props - each object represents a rating
const data = [
    {src: 'https://res.cloudinary.com/dojzptdbc/image/upload/v1728577496/43153_imdb_icon_vvpjnz.png', name: 'IMDB', value: '8.4/10'},
    {src: 'https://res.cloudinary.com/dojzptdbc/image/upload/v1728577835/Rotten_Tomatoes_tqvchw.svg', name: 'Rotten Tomatoes', value: '94%'},
    {src:'https://res.cloudinary.com/dojzptdbc/image/upload/v1728577923/Metacritic_uduhqj.svg', name: 'Metacritic', value: '83/100'}
]

test('For each index, the image should have the correct source and have width 25, and the correct rating value should be displayed.', () => {
    // Map through data and render component for each object
    for (const obj of data) {
        render(
            <IconRating index={data.indexOf(obj)} value={obj.value} />
        )
        // Find image
        const image = screen.getByRole('img', {name: obj.name})
        expect(image).toBeInTheDocument()
        // Should have corrrect width and source
        expect(image.src).toBe(obj.src)
        expect(image.width).toBe(25)
        // Find rating value
        const value = screen.getByText(obj.value)
        expect(value).toBeInTheDocument()
        // Should have smallFont class
        expect(value).toHaveClass('_smallFont_6dc87e')
        cleanup()
    }
})

const user = userEvent.setup()

test('For each index, when hovered over the image, the tooltop should display correct message.', async () => {
    // Map through data and render component for each object
    for (const obj of data){
        render(<IconRating index={data.indexOf(obj)} value={obj.value} />);
        // Find image
        const image = screen.getByRole('img', {name: obj.name})
        expect(image).toBeInTheDocument()
        // Tooltip should not be present
        const tooltip = screen.queryByRole('tooltip')
        expect(tooltip).not.toBeInTheDocument()
        const message = screen.queryByText(`${obj.name} gave this film a rating of ${obj.value}`)
        expect(message).not.toBeInTheDocument()
        // Hover over image
        await user.hover(image)
        // Tooltip and message should now be present
        await waitFor(() => {
            const tooltip = screen.getByRole('tooltip')
            expect(tooltip).toBeInTheDocument()
            const message = screen.getByText(`${obj.name} gave this film a rating of ${obj.value}`)
            expect(message).toBeInTheDocument()
        })
        // Unhover over image
        await user.unhover(image)
        // Tooltip and message should no longer be present
        await waitFor(() => {
            const tooltip = screen.queryByRole('tooltip')
            expect(tooltip).not.toBeInTheDocument()
            const message = screen.queryByText(`${obj.name} gave this film a rating of ${obj.value}`)
            expect(message).not.toBeInTheDocument()
        })
        cleanup()
    }
})    

