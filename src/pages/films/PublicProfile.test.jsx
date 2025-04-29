/**
 * @vitest-environment jsdom
 */
import PublicProfile from './PublicProfile'
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { screen, waitFor, act } from '@testing-library/react';
import { test, expect, describe} from 'vitest';
import setupTests from '../../test-utils/setupTests';
import userEvent from '@testing-library/user-event'
import renderWithContext from '../../test-utils/renderWithContext';

// Define profile data
const profileImage = 'https://res.cloudinary.com/dojzptdbc/image/upload/v1744368051/defaultProfile_hizptb.png'

const user = userEvent.setup()

setupTests()

describe('RENDERING USERNAME AND IMAGE', () => {
    test('Username and profile image should be rendered.', () => {
        // render component
        const props = {profile: {username: 'user1', _id: 'user1id', image:profileImage}}
        renderWithContext(<PublicProfile />, null, props)
        // image should be present
        const image = screen.getByRole('img', {name: 'avatar'})
        expect(image).toBeInTheDocument()
        expect(image.src).toBe(profileImage)
        // username should be present
        const username = screen.getByRole('heading', {name: 'user1'})
        expect(username).toBeInTheDocument()
    })
    test('If the current user is owner of public profile, clicking username should redirect user to the full profile page.', async () => {
        // render component
        const props = {profile: {username: 'user1', _id: 'user1id', image:profileImage}}
        const currentFilmData = {isOwner: true}
        const path = '/films/user1id'
        const { history } = renderWithContext(<PublicProfile />, null, props, path, currentFilmData)
        expect(history.location.pathname).toBe('/films/user1id')
        const username = screen.getByRole('heading', {username: 'user1'})
        await user.click(username)
        expect(history.location.pathname).toBe('/profile')
    })
})

describe('RENDERING WATCHED PROGRESS BAR AND SIMILARITY SCORE', () => {
    test('If the current user is owner of public profile, a progress bar should be rendered with watched count.', () => {
        // Define sample data to pass in to component
        const props = {
            filmStats: {savedCount: 8, watchedCount: 4},
            showStats: true,
            genreCounts: [['Sci-Fi', 4], ['Action', 3], ['Adventure', 3]],
            directorCounts: [['Sam Raimi', 4], ['J.J. Abrams', 4], ['George Lucas', 2]],
            profile: {username: 'user1', _id: 'user1id', image:profileImage}
        }
        const currentFilmData = {isOwner: true}
        // Render component
        renderWithContext(<PublicProfile />, null, props, null, currentFilmData)
        // Find watched header
        const watchedHeading = screen.getByRole('heading', {name: 'Watched'})
        expect(watchedHeading).toBeInTheDocument()
        // Find watched count saying 4 / 8
        const watchedCount = screen.getByText('4 / 8')
        expect(watchedCount).toBeInTheDocument()
    })
    test('If the current user views another users public profile, a progress bar should be rendered with similarity score.', () => {
        // Define sample data to pass in to component
        const props = {
            similarity: 0.6,
            showStats: true,
            genreCounts: [['Sci-Fi', 4], ['Action', 3], ['Adventure', 3]],
            directorCounts: [['Sam Raimi', 4], ['J.J. Abrams', 4], ['George Lucas', 2]],
            profile: {username: 'user1', _id: 'user1id', image:profileImage}
        } 
        const currentFilmData = {isOwner: false}
        // Render component
        renderWithContext(<PublicProfile />, null, props, null, currentFilmData)
        // Find similarity header
        const similarityHeading = screen.getByRole('heading', {name: 'Similarity'})
        expect(similarityHeading).toBeInTheDocument()
        // Find similarity text saying 60%
        const similarityCount = screen.getByText('60%')
        expect(similarityCount).toBeInTheDocument()       
    })
})

describe('RENDERING FAVOURITE GENRES AND DIRECTORS PROGRESS BARS', () => {
    test('On large screens, when films have been watched and rated, progress bars showing favourite genres and directors should be displayed.', () => {
        // Define sample data to pass in to component
        const props = {
            similarity: 0.6,
            showStats: true,
            genreCounts: [['Sci-Fi', 4], ['Action', 3], ['Adventure', 3]],
            directorCounts: [['Sam Raimi', 4], ['J.J. Abrams', 4], ['George Lucas', 2]],
            profile: {username: 'user1', _id: 'user1id', image:profileImage}
        } 
        const currentFilmData = {isOwner: false}
        // Render component
        const { component } = renderWithContext(<PublicProfile />, null, props, null, currentFilmData)
        // Set width
        act(() => {
            global.innerWidth = 1000;
            global.dispatchEvent(new Event('resize'));
        });
        // Find headers
        const favGenresHeading = screen.getByRole('heading', {name: 'Favourite Genres'})   
        expect(favGenresHeading).toBeInTheDocument()  
        const favDirectorsHeading = screen.getByRole('heading', {name: 'Favourite Directors'}) 
        expect(favDirectorsHeading).toBeInTheDocument()
        // Get all progress bars
        const progressBars = screen.getAllByRole('progressbar')
        // Should be 6 total
        expect(progressBars).toHaveLength(6)
        // First 3 should be top genres with colors in the order of red, blue and orange
        expect(progressBars[0].innerHTML).toBe('Sci-Fi')
        expect(progressBars[0]).toHaveClass('bg-success')   
        expect(progressBars[1].innerHTML).toBe('Action')
        expect(progressBars[1]).toHaveClass('bg-info')   
        expect(progressBars[2].innerHTML).toBe('Adventure')  
        expect(progressBars[2]).toHaveClass('bg-warning')  
        // Final 3 should be top directors with colors in the order of red, blue and orange
        expect(progressBars[3].innerHTML).toBe('Sam Raimi')
        expect(progressBars[3]).toHaveClass('bg-success')   
        expect(progressBars[4].innerHTML).toBe('J.J. Abrams')
        expect(progressBars[4]).toHaveClass('bg-info')   
        expect(progressBars[5].innerHTML).toBe('George Lucas')  
        expect(progressBars[5]).toHaveClass('bg-warning')
        // Badges should not be present
        const badges = component.container.getElementsByClassName('badge')
        expect(badges).toHaveLength(0)
        // Question mark image should not be present
        const questionMark = screen.queryByRole('img', {name: 'question mark'})
        expect(questionMark).not.toBeInTheDocument()
    })
    test('On small screens, when films have been watched and rated, badges showing favourite genres and directors should be displayed.', () => {
        // Define sample data to pass in to component
        const props = {
            similarity: 0.6,
            showStats: true,
            genreCounts: [['Sci-Fi', 4], ['Action', 3], ['Adventure', 3]],
            directorCounts: [['Sam Raimi', 4], ['J.J. Abrams', 4], ['George Lucas', 2]],
            profile: {username: 'user1', _id: 'user1id', image:profileImage}
        }        
        const currentFilmData = {isOwner: false}
        // Render component
        const { component } = renderWithContext(<PublicProfile />, null, props, null, currentFilmData)
        // Set width
        act(() => {
            global.innerWidth = 500;
            global.dispatchEvent(new Event('resize'));
        });
        // Get all badges
        const badges = component.container.getElementsByClassName('badge')
        // Should be 6 total
        expect(badges).toHaveLength(6)
        // First 3 should be top genres with bg = primary
        expect(badges[0].innerHTML).toBe('Sci-Fi')
        expect(badges[0]).toHaveClass('bg-primary')
        expect(badges[1].innerHTML).toBe('Action')
        expect(badges[1]).toHaveClass('bg-primary')
        expect(badges[2].innerHTML).toBe('Adventure')
        expect(badges[2]).toHaveClass('bg-primary')
        // Final 3 should be directors with bg = secondary
        expect(badges[3].innerHTML).toBe('Sam Raimi')
        expect(badges[3]).toHaveClass('bg-secondary')
        expect(badges[4].innerHTML).toBe('J.J. Abrams')
        expect(badges[4]).toHaveClass('bg-secondary')
        expect(badges[5].innerHTML).toBe('George Lucas')
        expect(badges[5]).toHaveClass('bg-secondary')
        // Progress bars should not be present
        const progressBars = screen.queryByRole('progressbar')
        expect(progressBars).not.toBeInTheDocument()
        // Question mark image should not be present
        const questionMark = screen.queryByRole('img', {name: 'question mark'})
        expect(questionMark).not.toBeInTheDocument()
    })
    test('When no films have been rated, on large screens, question marks should appear in place of progress bars.', () => {
        // Define sample data to pass in to component
        const props = {
            filmStats: {savedCount: 8, watchedCount: 0},
            showStats: true,
            genreCounts: [],
            directorCounts: [],
            profile: {username: 'user1', _id: 'user1id', image:profileImage}
        }        
        const currentFilmData = {isOwner: false}
        // Render component
        const { component } = renderWithContext(<PublicProfile />, null, props, null, currentFilmData)
        // Set width
        act(() => {
            global.innerWidth = 1000;
            global.dispatchEvent(new Event('resize'));
        });
        // Assert question marks images are present
        const questionMarks = screen.getAllByRole('img', {name: 'question mark'})
        expect(questionMarks).toHaveLength(2)
        // Images have correct source
        questionMarks.map(img => expect(img.src).toBe('https://res.cloudinary.com/dojzptdbc/image/upload/v1744639090/question_ydkaop.png'))
        // Badges are not present
        const badges = component.container.getElementsByClassName('badge')
        expect(badges).toHaveLength(0)
        // Progress bars are not present
        const progressBars = screen.queryByRole('progressbar')
        expect(progressBars).not.toBeInTheDocument()
        // Set width to 500, question marks should dissapear
        act(() => {
            global.innerWidth = 500;
            global.dispatchEvent(new Event('resize'));
        });
        // Assert question marks images are not present
        const questionMarksNulll = screen.queryByRole('img', {name: 'question mark'})
        expect(questionMarksNulll).not.toBeInTheDocument()
    })
})

describe('HOVERING OVER ELEMENTS DISPLAYS TOOLTIPS', () => {
    test('Hovering over similarity score should display tooltip with the correct message', async () => {
        // Define sample data to pass in to component
        const props = {
            similarity: 0.6,
            showStats: true,
            genreCounts: [['Sci-Fi', 4], ['Action', 3], ['Adventure', 3]],
            directorCounts: [['Sam Raimi', 4], ['J.J. Abrams', 4], ['George Lucas', 2]],
            profile: {username: 'user1', _id: 'user1id', image:profileImage}
        } 
        // Render component
        const currentFilmData = {isOwner: false}
        renderWithContext(<PublicProfile />, null, props, null, currentFilmData)      
        // Find similarity text saying 60%
        const similarityCount = screen.getByText('60%')
        expect(similarityCount).toBeInTheDocument()    
        // Tooltip should not be present
        const tooltipNull = screen.queryByRole('tooltip')
        expect(tooltipNull).not.toBeInTheDocument()
        // Message should not be present
        const messageNull = screen.queryByText('Based on films that you and user 1 have in common, your ratings are 60%.')
        expect(messageNull).not.toBeInTheDocument()
        // Hover over text
        await user.hover(similarityCount)
        await waitFor(() => {
            // Tooltip should be present
            const tooltip = screen.getByRole('tooltip')
            expect(tooltip).toBeInTheDocument()
            // Message should be present
            const message = screen.getByText('Based on films that you and user1 have in common, your ratings are 60% similar.')
            expect(message).toBeInTheDocument()
        })
        // Unhover over text
        await user.unhover(similarityCount)
        await waitFor(() => {
            // Tooltip should not be present
            const tooltipNull = screen.queryByRole('tooltip')
            expect(tooltipNull).not.toBeInTheDocument()
            // Message should not be present
            const messageNull = screen.queryByText('Based on films that you and user 1 have in common, your ratings are 60%.')
            expect(messageNull).not.toBeInTheDocument()            
        })
    })
    test('Hovering over progress bars displays correct message based on genre or director', () => {
        // Define sample data to pass in to component
        const props = {
            similarity: 0.6,
            showStats: true,
            genreCounts: [['Sci-Fi', 4], ['Action', 3], ['Adventure', 3]],
            directorCounts: [['Sam Raimi', 4], ['J.J. Abrams', 4], ['George Lucas', 2]],
            profile: {username: 'user1', _id: 'user1id', image:profileImage}
        } 
        // Render component
        const currentFilmData = {isOwner: false}
        renderWithContext(<PublicProfile />, null, props, null, currentFilmData)   
        // Set width to ensure progress bar appears
        act(() => {
            global.innerWidth = 1000;
            global.dispatchEvent(new Event('resize'));
        });    
        // Get all progress bars
        const progressBars = screen.getAllByRole('progressbar')
        // Assert no tooltips are present
        const tooltipNull = screen.queryByRole('tooltip')
        expect(tooltipNull).not.toBeInTheDocument()
        // Hover over each progress bar
        progressBars.forEach(async (bar, index) => {
            await user.hover(bar)
            await waitFor(() => {
                // Tooltip should be present
                const tooltip = screen.getByRole('tooltip')
                expect(tooltip).toBeInTheDocument()
                // Message should be present
                const message = screen.getByText(
                    index < 3? 
                        `Your ${props.genreCounts[index][0]} films have an average rating of ${props.genreCounts[index][1]}`
                    :
                        `Your films directed by ${props.directorCountsCounts[index][0]} have an average rating of ${props.directorCountsCounts[index][1]}`
                )
                expect(message).toBeInTheDocument()
            })
            // un hover over progress bar
            await user.unhover(bar)
            await waitFor(() => {
                // Assert no tooltips are present
                const tooltipNull = screen.queryByRole('tooltip')
                expect(tooltipNull).not.toBeInTheDocument()                
            })
        })
    })
})
