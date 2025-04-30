/**
 * @vitest-environment jsdom
 */
import FilmPosterCarousel from './FilmPosterCarousel'
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { act, waitFor } from '@testing-library/react';
import { test, expect, describe } from 'vitest';
import setupTests from '../../test-utils/setupTests';
import renderWithContext from '../../test-utils/renderWithContext';

setupTests()

// Define sample data to pass into component
const poster1 = 'https://m.media-amazon.com/images/M/MV5BNzIxMDQ2YTctNDY4MC00ZTRhLTk4ODQtMTVlOWY4NTdiYmMwXkEyXkFqcGc@._V1_SX300.jpg' 
const poster2 = 'https://m.media-amazon.com/images/M/MV5BOGUwMDk0Y2MtNjBlNi00NmRiLTk2MWYtMGMyMDlhYmI4ZDBjXkEyXkFqcGc@._V1_SX300.jpg'
const poster3 = 'https://m.media-amazon.com/images/M/MV5BYmQ3MjliNjAtNWFiZS00YWI1LTlmZTktMzBiNDE1NjRhZjU0XkEyXkFqcGc@._V1_SX300.jpg'

const posters = [poster1, poster2, poster3]

let films = []
for (let i=0; i<72; i++){
    const film = {
        Poster: i < 24? poster1 : i < 48? poster2: poster3
    }
    films.push(film)
}
const props = {films}

describe('CORRECT ITEM IS ACTIVE', () => {
    test('The 1st carousel item should be active, and the 2nd and 3rd should not be active.', async () => {
        // Render component
        const { component } = renderWithContext(<FilmPosterCarousel />, {props})
        const container = component.container
        // Should be 3 carousel items
        const items = container.getElementsByClassName('carousel-item')
        expect(items).toHaveLength(3)
        // 1st item should have class active
        expect(items[0]).toHaveClass('active')
        // Assert the remaining carousel items dont have class active
        expect(items[1]).not.toHaveClass('active')
        expect(items[2]).not.toHaveClass('active')
    })
})

describe('FILMS ARE DISTRIBUTED CORRECTLY', () => {
    test('For large screens, films are distributed correctly across the three carousel items.', () => {
        // Render component
        const { component } = renderWithContext(<FilmPosterCarousel />, {props})
        const container = component.container
        // Ensure width is set for large screen: 1000
        act(() => {
            global.innerWidth = 1000;
            global.dispatchEvent(new Event('resize'));
        });
        const items = container.getElementsByClassName('carousel-item')
        // Each item should contain 24 films, all with correct posters
        const itemsArray = Array.from(items)
        // Loop through all 3 items
        itemsArray.forEach((item, index) => {
            // Get film previews in current item
            const filmPreviews = item.children[0].children
            expect(filmPreviews).toHaveLength(24)
            const filmPreviewsArray = Array.from(filmPreviews)
            // Check each film preview has the correct poster
            filmPreviewsArray.forEach((filmPreview) => {
                expect(
                    filmPreview.children[0].children[0].children[0].src
                ).toBe(
                    posters[index]
                )
            })
        })
    })
    
    test('For small screens, films are distributed correctly across the three carousel items.', () => {
        // Render component
        const { component } = renderWithContext(<FilmPosterCarousel />, {props})
        const container = component.container
        // Ensure width is set for small screen: 500
        act(() => {
            global.innerWidth = 500;
            global.dispatchEvent(new Event('resize'));
        });
        const items = container.getElementsByClassName('carousel-item')
        // Each item should contain 24 films, all with correct posters
        const itemsArray = Array.from(items)
        // Loop through all 3 items
        itemsArray.forEach((item, itemIndex) => {
            // Get film previews in current item
            const filmPreviews = item.children[0].children
            expect(filmPreviews).toHaveLength(18)
            const filmPreviewsArray = Array.from(filmPreviews)
            // Check each film preview has the correct poster
            filmPreviewsArray.forEach((filmPreview, filmIndex) => {
                // Calculate position of film in films list to determine poster
                const combinedIndex = itemIndex * 18 + filmIndex
                // Assert film has the correct poster
                expect(
                    filmPreview.children[0].children[0].children[0].src
                ).toBe(
                    combinedIndex < 24? poster1: combinedIndex < 48? poster2: poster3
                )
            })
        })
    })
})
