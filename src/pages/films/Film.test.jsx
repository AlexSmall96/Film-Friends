/**
 * @vitest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { screen } from '@testing-library/react';
import { test, expect, describe } from 'vitest';
import setupTests from '../../test-utils/setupTests';
import renderWithContext from '../../test-utils/renderWithContext'
import Film from './Film';

setupTests()

const Poster =  'https://m.media-amazon.com/images/M/MV5BNzIxMDQ2YTctNDY4MC00ZTRhLTk4ODQtMTVlOWY4NTdiYmMwXkEyXkFqcGc@._V1_SX300.jpg'
const Plot = 'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.'

const renderWithData = (isOwner, viewingData = {watched: true, public: true, userRating: 3}) => {
    const currentFilmData = {
        omdbData: {
            Title: "The Lord of the Rings: The Fellowship of the Ring",
            Year: "2001",
            imdbID: "tt0120737",
            Type: "movie",
            Poster,
            Plot,
            Director: "Peter Jackson",
            Year: "2001",
            Runtime: "178 min",
            Genre: "Adventure, Drama, Fantasy",
            imdb: '7.5/10',
            rt: '93%',
            mc: '83/100'
        },
        viewingData,
        isOwner,
        username: 'user2'
    }
    const { component } = renderWithContext(<Film />, {currentFilmData})
    return component
}

describe('RENDERING CORRECT FILM DATA', () => {
    test('Corect data should be rendered: poster, title, plot, director, year, runtime, genre.', () => {
        // Render component
        renderWithData(true)
        // Poster should have correct source
        const poster = screen.getByRole('img', {name: 'Poster for The Lord of the Rings: The Fellowship of the Ring'})
        expect(poster).toBeInTheDocument()
        expect(poster.src).toBe(Poster)
        // Heading should be correct
        const heading = screen.getByRole('heading', {name: "The Lord of the Rings: The Fellowship of the Ring"})
        expect(heading).toBeInTheDocument()
        // Plot should be correct
        const plot = screen.getByText(Plot)
        expect(plot).toBeInTheDocument()
        // Director year and runtime should be present
        const data = screen.getByText(/Peter Jackson, 2001, 178 min/)
        expect(data).toBeInTheDocument()
        // Genre should be present
        const genre = screen.getByText(/Adventure, Drama, Fantasy/)
        expect(genre).toBeInTheDocument()
        // Icon ratings should be present
        const names = ['IMDB', 'Rotten Tomaties', 'Metacrtic']
        names.map(name => {
            const image = screen.getByRole('img', {name})
            expect(image).toBeInTheDocument()
        })
    })
})

describe('RENDERING CORRECT VIEWING DATA AND COMPONENTS', () => {
    test('If viewing data is provided, watched checkbox and user rating should be present, with correct text if user is owner.', () => {
        // Render component
        const component = renderWithData(true)
        // Find checkbox
        const checkbox = screen.getByRole('checkbox')   
        expect(checkbox).toBeInTheDocument()
        // Should be checked
        expect(checkbox.checked).toBe(true)
        // Find user rating starts
        const stars = component.container.getElementsByClassName('fa-star')
        // Should be 5 total
        expect(stars).toHaveLength(5)
        // First 3 should have class checked
        Array.from(stars).slice(0,3).map(star => expect(star).toHaveClass('_checked_d9403a'))
        // Final 2 should have class unchecked
        Array.from(stars).slice(3,5).map(star => expect(star).toHaveClass('_unchecked_d9403a'))
        // rating text
        const ratingText = screen.getByText('Your Rating:')
        expect(ratingText).toBeInTheDocument()
        // Save dropdown should not be present
        const saveDropdown = screen.queryByRole('button', {name: 'Save'})
        expect(saveDropdown).not.toBeInTheDocument()
        // Ellipsis icon should be present
        const ellipsis = component.container.getElementsByClassName('fa-ellipsis-vertical')
        expect(ellipsis).toHaveLength(1)
    })
    
    test('If user is not owner, but film has been watched, text next to rating stars should say owners rating and save dropdown should be present.', () => {
        // Render component as not owner
        const component = renderWithData(false)   
        // Rating text should be correct
        const text = screen.getByText("user2's Rating:")
        expect(text).toBeInTheDocument()
        // Checkbox should not be present
        const checkbox = screen.queryByRole('checkbox')   
        expect(checkbox).not.toBeInTheDocument() 
        // Save dropdown should not be present
        const saveDropdown = screen.getByRole('button', {name: 'Save'})
        expect(saveDropdown).toBeInTheDocument()
        // Ellipsis icon should not be present
        const ellipsis = component.container.getElementsByClassName('fa-ellipsis-vertical')
        expect(ellipsis).toHaveLength(0)
    })
    test('If user is not owner and film has not been watched, no rating stars should be present.', () => {
        // Render component with watched false
        const component = renderWithData(false, {watched: false, public: true, userRating: 3})
        // Ratings should not be present
        const stars = component.container.getElementsByClassName('fa-star')
        expect(stars).toHaveLength(0)   
        // Text should not be present
        const text = screen.queryByText("user2's Rating:")
        expect(text).not.toBeInTheDocument()   
    })
    test('If no viewing data is provided, watched checkbox and user rating should not be present.', () => {
        // Render component with no viewing data
        const component = renderWithData(false, {})     
        // Checkbox should not be present
        const checkbox = screen.queryByRole('checkbox')   
        expect(checkbox).not.toBeInTheDocument() 
        // Ratings should not be present
        const stars = component.container.getElementsByClassName('fa-star')
        expect(stars).toHaveLength(0)
    })
})

