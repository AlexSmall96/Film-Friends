/**
 * @vitest-environment jsdom
 */
import FilmPreview from './FilmPreview'
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { screen, act } from '@testing-library/react';
import { test, expect, describe} from 'vitest';
import setupTests from '../test-utils/setupTests';
import renderWithContext from '../test-utils/renderWithContext';

setupTests()

// Define film poster and plot to be used throughout tests
const Poster = 'https://m.media-amazon.com/images/M/MV5BODVhNGIxOGItYWNlMi00YTA0LWI3NTctZmQxZGUwZDEyZWI4XkEyXkFqcGc@._V1_SX300.jpg'
const Plot = 'Two Jedi escape a hostile blockade to find allies and come across a young boy who may bring balance to the Force, but the long-dormant Sith resurface to claim their former glory.'

describe('USING COMPONENT IN HOME PAGE CAROUSEL OR FILMS PAGE', () => {
    test('Only poster should be displayed when film is used in carousel or films page.', () => {
        // Replicate film data used in carousel
        const filmPreviewData = {
            film: {
                _id: 'starwars1',
                imdbID: 'tt0120915',
                Title: 'Star Wars: Episode I - The Phantom Menace',
                Year: '1999',
                Runtime: '136 min',
                Type: 'Movie',
                Director: 'George Lucas',
                Plot,
                Poster,
                Genre: 'Action, Adventure, Fantasy',
                watched: true,
                public: true,
                owner: 'user1id',
                userRating: 5
            },
            mobile: true,
            filmsPage: true,
            faded: true,
            carousel: true
        }
        // Render component
        renderWithContext(<FilmPreview />, {filmPreviewData})
        // Image should be present
        const image = screen.getByRole('img', {name: 'Poster for Star Wars: Episode I - The Phantom Menace'})
        expect(image).toBeInTheDocument()
        // Should have correct source
        expect(image.src).toBe(Poster)
        // Should have class faded and hoverCarousel
        expect(image).toHaveClass('_faded_af00fb')
        expect(image).toHaveClass('_hoverCarousel_af00fb')
        // No text should be present
        const heading = screen.queryByRole('heading')
        expect(heading).not.toBeInTheDocument()
        const paragraph = screen.queryByRole('paragraph')
        expect(paragraph).not.toBeInTheDocument()
        // No buttons should be present
        const button = screen.queryByRole('button')
        expect(button).not.toBeInTheDocument()
    })
})

describe('USING COMPONENT AS SEARCH RESULT', () => {
    test('On large screens when no user is logged in, only poster, title, year and type should be displayed.', () => {
        // Replicate film data used in search results
        const filmPreviewData = {
            film: {
                imdbID: 'tt0120915',
                Title: 'Star Wars: Episode I - The Phantom Menace',
                Year: '1999',
                Type: 'Movie',
                Poster,
            }
        }
        // Render component
        renderWithContext(<FilmPreview />, {filmPreviewData})
        // Image should be present
        const image = screen.getByRole('img', {name: 'Poster for Star Wars: Episode I - The Phantom Menace'})
        expect(image).toBeInTheDocument()
        // Title should be present
        const title = screen.getByRole('heading', {name: 'Star Wars: Episode I - The Phantom Menace'})
        expect(title).toBeInTheDocument()
        // Year and Type should be present
        const yearAndType = screen.getByText( '1999, Movie')
        expect(yearAndType).toBeInTheDocument()
        // Save dropdown should not be present
        const button = screen.queryByRole('button')
        expect(button).not.toBeInTheDocument()
    })
    test('On large screens when a user is logged in, poster, title, year and type should be displayed along with save dropdown.', () => {
        // Replicate film data used in search results when a user is logged in
        const filmPreviewData = {
            film: {
                imdbID: 'tt0120915',
                Title: 'Star Wars: Episode I - The Phantom Menace',
                Year: '1999',
                Type: 'Movie',
                Poster,
            },
            showDropdown: true
        }
        // Render component
        renderWithContext(<FilmPreview />, {filmPreviewData})
        // Dropdown should be present
        const button = screen.getByRole('button', {name: 'Save'})
        expect(button).toBeInTheDocument()
    })
    test('On mobile sceens, only poster and title should be displayed.', () => {
        // Replicate film data used in search results when a user is logged in
        const filmPreviewData = {
            film: {
                imdbID: 'tt0120915',
                Title: 'Star Wars: Episode I - The Phantom Menace',
                Year: '1999',
                Type: 'Movie',
                Poster,
            },
            mobile: true
        }
        // Render component
        renderWithContext(<FilmPreview />, {filmPreviewData})   
        // Image should be present
        const image = screen.getByRole('img', {name: 'Poster for Star Wars: Episode I - The Phantom Menace'})
        expect(image).toBeInTheDocument()  
        // Title should be present
        const title = screen.getByRole('heading', {name: 'Star Wars: Episode I - The Phantom Menace'})
        expect(title).toBeInTheDocument() 
        // Year and Type should not be present
        const yearAndType = screen.queryByText( '1999, Movie')
        expect(yearAndType).not.toBeInTheDocument()        
        // Save dropdown should not be present
        const button = screen.queryByRole('button')
        expect(button).not.toBeInTheDocument()
    })
})

describe('USING COMPONENT IN RECCOMENDATIONS PAGE', () => {
    test('On large screens, only reccomendation message, save dropdown and remove button should be displayed.', () => {
        // Replicate film data used in reccomendations page
        const filmPreviewData = {
            film: {
                _id: 'starwars1',
                imdbID: 'tt0120915',
                Title: 'Star Wars: Episode I - The Phantom Menace',
                Year: '1999',
                Runtime: '136 min',
                Type: 'Movie',
                Director: 'George Lucas',
                Plot,
                Poster,
                Genre: 'Action, Adventure, Fantasy',
                watched: true,
                public: true,
                owner: 'user1id',
                userRating: 5
            },
            message: "Hey! Check out this awesome film I've just watched. I think you'll love it",
            sender: {username: 'user1'},
            showDropdown: true
        }
        // Render component
        renderWithContext(<FilmPreview />, {filmPreviewData}) 
        // Image should be present
        const image = screen.getByRole('img', {name: 'Poster for Star Wars: Episode I - The Phantom Menace'})
        expect(image).toBeInTheDocument()
        // Year and Type should not be present
        const yearAndType = screen.queryByText('1999, Movie')
        expect(yearAndType).not.toBeInTheDocument() 
        // Plot should not be present
        const plot = screen.queryByTestId(Plot) 
        expect(plot).not.toBeInTheDocument()
        // Save dropdown should be present
        const dropdown = screen.getByRole('button', {name: 'Save'})
        expect(dropdown).toBeInTheDocument()  
        // Remove button should be present
        const remove = screen.getByRole('button', {name: 'Remove'})
        expect(remove).toBeInTheDocument()    
    })
    test('On mobile screens, only poster should be present.', () => {
        // Replicate film data used in reccomendations page
        const filmPreviewData = {
            film: {
                _id: 'starwars1',
                imdbID: 'tt0120915',
                Title: 'Star Wars: Episode I - The Phantom Menace',
                Year: '1999',
                Runtime: '136 min',
                Type: 'Movie',
                Director: 'George Lucas',
                Plot,
                Poster,
                Genre: 'Action, Adventure, Fantasy',
                watched: true,
                public: true,
                owner: 'user1id',
                userRating: 5
            },
            message: "Hey! Check out this awesome film I've just watched. I think you'll love it",
            sender: {username: 'user1'},
            showDropdown: true,
            mobile: true
        }
        // Render component
        renderWithContext(<FilmPreview />, {filmPreviewData})  
        // Image should be present
        const image = screen.getByRole('img', {name: 'Poster for Star Wars: Episode I - The Phantom Menace'})
        expect(image).toBeInTheDocument()   
        // Year and Type should not be present
        const yearAndType = screen.queryByText('1999, Movie')
        expect(yearAndType).not.toBeInTheDocument() 
        // Plot should not be present
        const plot = screen.queryByTestId(Plot) 
        expect(plot).not.toBeInTheDocument()
        // Save dropdown should not be present
        const dropdown = screen.queryByRole('button', {name: 'Save'})
        expect(dropdown).not.toBeInTheDocument()  
        // Remove button should be present
        const remove = screen.queryByRole('button', {name: 'Remove'})
        expect(remove).not.toBeInTheDocument()     
    })
})