/**
 * @vitest-environment jsdom
 */
import Results from '../pages/home/Results'
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { test, expect, describe} from 'vitest';
import setupTests from '../test-utils/setupTests';
import userEvent from '@testing-library/user-event';
import renderWithProviders from '../test-utils/renderWithProviders';

setupTests()

const user = userEvent.setup()

describe('SEARCHING VIA CAROUSEL IMAGES', () => {
    test('On large screens, clicking film image in carousel shows all search results.', async () => {
        // Render component
        const { history } = renderWithProviders(<Results />, {path: '/', currentUser: null})
        // Set screen width
        act(() => {
            global.innerWidth = 1000;
            global.dispatchEvent(new Event('resize'));
        });
        // Find image from carousel
        await waitFor(() => {
            const carouselImage = screen.getByRole('img', {name: 'Poster for Star Wars: Episode IV - A New Hope'})
            expect(carouselImage).toBeInTheDocument()
            expect(carouselImage.src).toBe('https://m.media-amazon.com/images/M/MV5BOGUwMDk0Y2MtNjBlNi00NmRiLTk2MWYtMGMyMDlhYmI4ZDBjXkEyXkFqcGc@._V1_SX300.jpg')
        })
        // Click on image to set search results
        const carouselImage = screen.getByRole('img', {name: 'Poster for Star Wars: Episode IV - A New Hope'})
        await user.click(carouselImage)
        await waitFor(() => {
            // Title should now be present as a heading
            const title = screen.getByRole('heading', {name: "Star Wars: Episode IV - A New Hope"})
            expect(title).toBeInTheDocument()
            // Year and type should be present
            const yearAndType = screen.getByText('1977, movie')
            expect(yearAndType).toBeInTheDocument()
            // Search bar should have film as input value
            const input = screen.getByRole('searchbox')
            expect(input.value).toBe("Star Wars: Episode IV - A New Hope")
        })
        // Carousel image should be gone
        expect(carouselImage).not.toBeInTheDocument()
        // Should only be 1 image with corect name
        const filmPoster = screen.getByRole('img', {name: 'Poster for Star Wars: Episode IV - A New Hope'})
        // Hover over film should show plot
        await user.hover(filmPoster)
        const plot = screen.getByText("Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids...")
        expect(plot).toBeInTheDocument()
        // Pagination should not be present
        const pageBtn = screen.queryByRole('button', {name: '1'})
        expect(pageBtn).not.toBeInTheDocument()
        // Sign up and login buttons should be present
        const signupBtn = screen.getByRole('button', {name: 'Sign up'})
        expect(signupBtn).toBeInTheDocument()
        const loginBtn = screen.getByRole('button', {name: 'Login'})
        expect(loginBtn).toBeInTheDocument()
        // Sign up button goes to correct page
        await user.click(signupBtn)
        expect(history.location.pathname).toBe('/signup')
    })
    test('On mobile, clicking film image in carousel shows selected film in mobile view.', async () => {
        // Render component
        renderWithProviders(<Results />)
        // Set screen width
        act(() => {
            global.innerWidth = 300;
            global.dispatchEvent(new Event('resize'));
        }) 
        // Find image from carousel
        let carouselImage
        await waitFor(() => {
            carouselImage = screen.getByRole('img', {name: 'Poster for Spider-Man'})
            expect(carouselImage).toBeInTheDocument()
            expect(carouselImage.src).toBe("https://m.media-amazon.com/images/M/MV5BZWM0OWVmNTEtNWVkOS00MzgyLTkyMzgtMmE2ZTZiNjY4MmFiXkEyXkFqcGc@._V1_SX300.jpg")
        })      
        // Click on image to show main film
        carouselImage = screen.getByRole('img', {name: 'Poster for Spider-Man'})
        await user.click(carouselImage)
        await waitFor(() => {
            // Film poster should be present
            const filmPoster = screen.getByRole('img', {name: 'Poster for Spider-Man'}) 
            expect(filmPoster).toBeInTheDocument()
            // Title should be present
            const title = screen.getByRole('heading', {name: 'Spider-Man'})
            expect(title).toBeInTheDocument()
            // Director, year and runtime should be present
            const data = screen.getByText(/Sami Raimi, 2002, 121 min/)
            expect(data).toBeInTheDocument()
            // Genre should be present
            const genre = screen.getByText(/Action, Adventure, Sci-Fi/)
            expect(genre).toBeInTheDocument()
            // Rating images should be present
            const imageNames = ['IMDB', 'Rotten Tomatoes', 'Metacritic']
            imageNames.map(name => {
                const image = screen.getByRole('img', {name})
                expect(image).toBeInTheDocument()
            })
            // Save dropdown should be present
            const saveBtn = screen.getByRole('button', {name: 'Save'})
            expect(saveBtn).toBeInTheDocument()
        })
        // Sign up and login buttons should not be present
        const signupBtn = screen.queryByRole('button', {name: 'Sign up'})
        expect(signupBtn).not.toBeInTheDocument()
        const loginBtn = screen.queryByRole('button', {name: 'Login'})
        expect(loginBtn).not.toBeInTheDocument()
        // Carousel image should be gone
        expect(carouselImage).not.toBeInTheDocument()
        // View all results button should be present
        const viewAllResultsBtn = screen.getByRole('button', {name: 'View all results'})
        expect(viewAllResultsBtn).toBeInTheDocument()
        // Clicking back button should display all search results
        await user.click(viewAllResultsBtn)
        // Assert first 10 titles are now present
        for (let i=0;i<10;i++){
            const name = i === 0? 'Spider-Man' : `Spider-Man ${i}`
            expect(screen.getByRole('heading', {name})).toBeInTheDocument()
        }
        // Pagination should be present
        const pageBtnNumbers = [1, 2, 3]
        pageBtnNumbers.map(name => expect(screen.getByRole('button', {name})).toBeInTheDocument())
        // Click pagination button to change page
        const pageTwoBtn = screen.getByRole('button', {name: 2})
        await user.click(pageTwoBtn)
        // Titles 11 - 20 should now be present
        for (let i=10;i<20;i++){
            const name = `Spider-Man ${i}`
            expect(screen.getByRole('heading', {name})).toBeInTheDocument()
        }
    })
})

describe('SEARCHING VIA BADGES', () => {
    test('Clicking a badge shows correct search results.', async () => {
        // Render component
        renderWithProviders(<Results />)
        // Set screen width
        act(() => {
            global.innerWidth = 1000;
            global.dispatchEvent(new Event('resize'));
        });
        // Find badge
        let badge
        await waitFor(() => {
            badge = screen.getAllByText('Spider-Man')[0]
            expect(badge).toBeInTheDocument()
        })
        await user.click(badge)
        // Search bar should have film as input value
        const input = screen.getByRole('searchbox')
        expect(input.value).toBe("Spider-Man")
        // Badge should now be coloured dark
        expect(badge).toHaveClass('_selected_da902b')
        // Other badge should not be coloured dark
        const starWarsBadge = screen.getAllByText("Star Wars: Episode IV - A New Hope")[0]
        expect(starWarsBadge).not.toHaveClass('_selected_da902b')
        // Assert first 10 titles are now present
        for (let i=0;i<10;i++){
            const name = i === 0? 'Spider-Man' : `Spider-Man ${i}`
            expect(screen.getByRole('heading', {name})).toBeInTheDocument()
        }
        // Film with title Spider-Man 1 should be already saved, others should not be saved
        const savedFilm = screen.getByRole('heading', {name: 'Spider-Man 1'})
        const saveFilmLink = savedFilm.nextSibling.nextSibling.nextSibling.children[1]
        expect(saveFilmLink).toHaveTextContent('Go to your watchlist')
        const unsavedFilm = screen.getByRole('heading', {name: 'Spider-Man'})
        const unsavedFilmBtn = unsavedFilm.nextSibling.nextSibling.nextSibling
        expect(unsavedFilmBtn).toHaveTextContent('Save')
    })
})

describe('SEARCHING VIA TYPING IN SEARCH BAR', () => {
    test('Typing a matching film shows suggestions under search bar and clicking suggestion shows results.', async () => {
        // Render component
        const { component } = renderWithProviders(<Results />)
        // Find input
        const input = screen.getByRole('searchbox')
        fireEvent.change(input, {target: {value: 'Spider-Man'}})
        // Suggestions should be shown
        let suggestions
        await waitFor(() => {
            suggestions = component.container.getElementsByClassName('suggestion')
            expect(suggestions).toHaveLength(10)
        })
        // Should have correct length and text
        Array.from(suggestions).forEach((suggestion, index) => {
            expect(suggestion).toHaveTextContent(index === 0? 'Spider-Man' : `Spider-Man ${index}`)
        })
        // Select the first suggestion
        await user.click(suggestions[0])
        // Assert first 10 titles are now present
        for (let i=0;i<10;i++){
            const name = i === 0? 'Spider-Man' : `Spider-Man ${i}`
            expect(screen.getByRole('heading', {name})).toBeInTheDocument()
        }
        // Suggestions are now gone
        expect(suggestions).toHaveLength(0)
    })
    test('Typing a matching film and pressing search button shows results.', async () => {
        renderWithProviders(<Results />)
        // Find input
        const input = screen.getByRole('searchbox')
        fireEvent.change(input, {target: {value: 'Spider-Man'}})
        // Find button
        const searchBtn = screen.getByRole('button')
        await user.click(searchBtn)
        // Assert first 10 titles are now present
        for (let i=0;i<10;i++){
            const name = i === 0? 'Spider-Man' : `Spider-Man ${i}`
            expect(screen.getByRole('heading', {name})).toBeInTheDocument()
        }
    })
    test('Typing a non matching film shows nothing.', async () => {
        renderWithProviders(<Results />)
        // Find input
        const input = screen.getByRole('searchbox')
        fireEvent.change(input, {target: {value: 'the'}})
        const searchBtn = screen.getByRole('button')
        await user.click(searchBtn) 
        // Carousel images should still be present
        await waitFor(() => {
            const carouselImages = screen.getAllByRole('img')
            expect(carouselImages[0].src).toBe('https://m.media-amazon.com/images/M/MV5BOGUwMDk0Y2MtNjBlNi00NmRiLTk2MWYtMGMyMDlhYmI4ZDBjXkEyXkFqcGc@._V1_SX300.jpg')
            expect(carouselImages[1].src).toBe('https://m.media-amazon.com/images/M/MV5BZWM0OWVmNTEtNWVkOS00MzgyLTkyMzgtMmE2ZTZiNjY4MmFiXkEyXkFqcGc@._V1_SX300.jpg')
        })      
    })
})

