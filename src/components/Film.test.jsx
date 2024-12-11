/**
 * @vitest-environment jsdom
 */
import Film from './Film';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { describe, test, expect } from 'vitest';
import setupTests from '../test-utils/setupTests'
import renderWithContext from '../test-utils/renderWithContext';
import renderWithFilmContext from '../test-utils/renderWithFilmContext';
import { CurrentFilmContext, useCurrentFilm } from '../contexts/CurrentFilmContext';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import { useCurrentUser } from '../contexts/CurrentFilmContext';
import { server } from '../test-utils/mocks/server'
import { handlers } from '../test-utils/mocks/handlers';
import { HttpResponse, http } from "msw";
import { wait } from '@testing-library/user-event/dist/cjs/utils/index.js';
const url = 'http://localhost:3001'

setupTests()

const filmData = {
    Type: 'movie', 
    Year: '1996', 
    imdbID: '123', 
    Title: 'Film 1', 
    Poster: 'https://m.media-amazon.com/images/M/MV5BOTdiODQ1MDYtZjM5My00MmQ5LTk1ZWUtZWIwYjBhZGMxZDAyXkEyXkFqcGc@._V1_SX300.jpg'
}

describe('RENDERING DATA', () => {
    test('Should render only title, year, image and type when component is used in films list', () => {
        // Deal with case when isOwner is true/false
        // Render component as an entry in the films list: full view should be false and films page should be true
        renderWithFilmContext(                    
            <Film fullView={false} filmsPage={true} filmData={filmData} />
        )
        // Title, image, year and type should be present
        const title = screen.getByRole('heading', {name: /Film 1/i})
        expect(title).toBeInTheDocument()
        const image = screen.getByRole('img')
        expect(image).toBeInTheDocument()
        expect(image.src).toBe('https://m.media-amazon.com/images/M/MV5BOTdiODQ1MDYtZjM5My00MmQ5LTk1ZWUtZWIwYjBhZGMxZDAyXkEyXkFqcGc@._V1_SX300.jpg')
        const text = screen.getByText('1996, movie')
        expect(text).toBeInTheDocument()
        // Director and plot should not be present as this data is only shown in selected film view (full view)
        const director = screen.queryByRole('My favoruite director')
        expect(director).not.toBeInTheDocument()
        const plot = screen.queryByRole('Some really interesting stuff happens')
        expect(plot).not.toBeInTheDocument()
        // Save or go to watchlist buttons should not be present as these are only used in search results
        const saveButton = screen.queryByRole('button', {name: /Save/i})
        expect(saveButton).not.toBeInTheDocument()
        const watchlistButton = screen.queryByRole('button', {name: /Go to watchlist/i})
        expect(watchlistButton).not.toBeInTheDocument()
        // Saved text should not be present
        const savedText = screen.queryByText('Saved')
        expect(savedText).not.toBeInTheDocument()
    })
    test('Should render title, year, image and type and correct buttons when component is used in search results.', async () => {
        // Render component as an entry in search results: all boolean variables should be false
        renderWithFilmContext(<Film filmData={filmData} />)
        // Title, image, year and type should be present
        const title = screen.getByRole('heading', {name: /Film 1/i})
        expect(title).toBeInTheDocument()
        const image = screen.getByRole('img')
        expect(image).toBeInTheDocument()
        expect(image.src).toBe('https://m.media-amazon.com/images/M/MV5BOTdiODQ1MDYtZjM5My00MmQ5LTk1ZWUtZWIwYjBhZGMxZDAyXkEyXkFqcGc@._V1_SX300.jpg')
        const text = screen.getByText('1996, movie')
        expect(text).toBeInTheDocument()
        // Director and plot should not be present as this data is only shown in selected film view (full view)
        const director = screen.queryByRole('My favoruite director')
        expect(director).not.toBeInTheDocument()
        const plot = screen.queryByRole('Some really interesting stuff happens')
        expect(plot).not.toBeInTheDocument()
        // Save button should be present
        const saveButton = screen.getByRole('button', {name: /Save/i})
        expect(saveButton).toBeInTheDocument()
        // Render component as an entry in search results as film thas user has already saved: saved should be true
        renderWithFilmContext(<Film filmData={filmData} saved={true} />)
        // Go to watchlist button should be present
        const watchlistButton = screen.getByRole('button', {name: /Go to watchlist/i})
        expect(watchlistButton).toBeInTheDocument()
    })
    test('Should render title, year, image, type, director, plot, ratings, users watched data and ellipsis menu.', () => {
        renderWithFilmContext(<Film filmData={filmData} fullView={true} isOwner={true}/>)
        // Title, image, year and type should be present
        const title = screen.getByRole('heading', {name: /Film 1/i})
        expect(title).toBeInTheDocument()
        const image = screen.getByRole('img')
        expect(image).toBeInTheDocument()
        expect(image.src).toBe('https://m.media-amazon.com/images/M/MV5BOTdiODQ1MDYtZjM5My00MmQ5LTk1ZWUtZWIwYjBhZGMxZDAyXkEyXkFqcGc@._V1_SX300.jpg')
        const text = screen.getByText('1996, movie')
        expect(text).toBeInTheDocument()
        // Director and plot should be present
        const director = screen.getByRole('My favoruite director')
        expect(director).not.toBeInTheDocument()
        const plot = screen.getByRole('Some really interesting stuff happens')
        expect(plot).not.toBeInTheDocument()
    })
})