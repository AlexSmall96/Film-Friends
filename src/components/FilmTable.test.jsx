/**
 * @vitest-environment jsdom
 */
import FilmTable from './FilmTable';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { test, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

afterEach(() => {
    cleanup()
})

const defaultPoster = 'https://res.cloudinary.com/dojzptdbc/image/upload/v1726945998/default-movie_uajvdm.png'

test('Correct film data is rendered', async () => {
    // Render component with data
    const films = [
        {_id: 'film1id', title: 'film1title', year: 1996, watched: true, userRating: 4, poster: defaultPoster, notes:''},
        {_id: 'film2id', title: 'film2title', year: 1997, watched: true, userRating: 0, poster: defaultPoster, notes:''},
        {_id: 'film3id', title: 'film3title', year: 1998, watched: false, userRating: 3, poster: defaultPoster, notes:''},
    ]
    render(<FilmTable films={films} />)
    // Table should be present
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    // Should be 3 films present
    expect(table.children[0].children).toHaveLength(3)
    // Correct data is being displayed
    films.map(
        film => expect(screen.getByText(
            `Title: ${film.title}, year: ${film.year}, watched: ${film.watched}, your rating: ${film.userRating}, your notes:`
        )).toBeInTheDocument()
    )
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(3)
    images.map(
        (image) => {
            expect(image).toBeInTheDocument()
            expect(image.src).toEqual('https://res.cloudinary.com/dojzptdbc/image/upload/v1726945998/default-movie_uajvdm.png')
        }
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
    buttons.map(
        (button) => {
            expect(button).toBeInTheDocument()
            expect(button).toHaveTextContent('Click to view details')
        }
    )
})

test('Clicking Click to view details button takes user to individual film page' , async () => {
    // Render component with data and history
    const history = createMemoryHistory();
    render(
        <Router history={history}>
            <FilmTable films={[{_id: 'film1id'}]} />
        </Router>
    )
    // Find and click button
    const button = screen.getByRole('button', {name: /Click to view details/i})
    expect(button).toBeInTheDocument()
    const user = userEvent.setup()
    await user.click(button)
    // Assert that url has changed
    expect(history.location.pathname).toContain('/films/film1id')
})