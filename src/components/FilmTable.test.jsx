/**
 * @vitest-environment jsdom
 */
import FilmTable from './FilmTable';
import React, {useState} from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { test, expect, describe } from 'vitest';
import renderWithContext from '../test-utils/renderWithContext';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import setupTests from '../test-utils/setupTests'

setupTests()

const defaultPoster = 'https://res.cloudinary.com/dojzptdbc/image/upload/v1726945998/default-movie_uajvdm.png'

const filmList = [
    {_id: 'film1id', title: 'film1title', year: 1996, watched: true, userRating: 4, poster: defaultPoster, notes:''},
    {_id: 'film2id', title: 'film2title', year: 1997, watched: true, userRating: 0, poster: defaultPoster, notes:''},
    {_id: 'film3id', title: 'film3title', year: 1998, watched: false, userRating: 3, poster: defaultPoster, notes:''},
]

const currentUser = {user : {username: 'user two',_id: 'user2id'}, token: 'user2token'}

const MockComponent = () => {
    const [films, setFilms] = useState(filmList);
    return (
        <CurrentUserContext.Provider value={{currentUser}}>
            <FilmTable films={films} setFilms={setFilms} isOwner={true}/>;
        </CurrentUserContext.Provider>
    ) 
};

describe('RENDERING DATA', () => {
    test('Correct film data is rendered when isOwner is true', async () => {
        // Render component with data and isOwner = true
        renderWithContext(<FilmTable films={filmList} isOwner={true} />)
        // Table should be present
        const table = screen.getByRole('table')
        expect(table).toBeInTheDocument()
        // Should be 3 films present
        expect(table.children[0].children).toHaveLength(3)
        // Correct data is being displayed
        filmList.map(
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
        const detailsButtons = screen.getAllByRole('button', {name: /Click to view details/i})
        const deleteButtons = screen.getAllByRole('button', {name: /Remove from watchlist/i})
        expect(detailsButtons).toHaveLength(3)
        expect(deleteButtons).toHaveLength(3)
        detailsButtons.map(
            (button) => {
                expect(button).toBeInTheDocument()
                expect(button).toHaveTextContent('Click to view details')
            }
        )
        deleteButtons.map(
            (button) => {
                expect(button).toBeInTheDocument()
                expect(button).toHaveTextContent('Remove from watchlist')
            }
        )
    
    })
    test('Correct film data is rendered when isOwner is false', async () => {
        // Render component with data and isOwner = false
        renderWithContext(<FilmTable films={filmList} isOwner={false} />)
        // Delete button should not be present
        const deleteButtons = screen.queryAllByRole('button', {name: /Remove from watchlist/i})
        deleteButtons.map(button => expect(button).not.toBeInTheDocument())
    })
})

describe('BUTTON FUNCTIONALITY', () => {
    test('Clicking Click to view details button takes user to individual film page', async () => {
        // Render component with data and history
        const {history} = renderWithContext(<FilmTable films={filmList}  />, 'films', '123')
        // Find buttons
        const buttons = screen.getAllByRole('button', {name: /Click to view details/i})
        const user = userEvent.setup()
        for (let i=0;i++;i<3) {
            // Click button
            await user.click(buttons[i])
            // Assert that url has changed
            expect(history.location.pathname).toContain(`/films/film${i+1}id`)
        }
    })
    test('Clicking Remove from watchlist removes film and it no longer appears', async () => {
        render(<MockComponent />)
        // Find buttons
        const buttons = screen.getAllByRole('button', {name: /Remove from watchlist/i})
        const user = userEvent.setup()
        let table = screen.getByRole('table')
        // Click button
        await user.click(buttons[0])
        table = screen.getByRole('table')
        // Only 2 films should remain
        expect(table.children[0].children).toHaveLength(2)
        // Film text should no longer be present
        const filmText = screen.queryByLabelText('Title: film1title, year: 1996, watched: true, your rating: 4, your notes:')
        expect(filmText).not.toBeInTheDocument()
    })
})
