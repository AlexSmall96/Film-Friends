/**
 * @vitest-environment jsdom
 */
import Friends from '../pages/friends/Friends'
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { test, expect, describe} from 'vitest';
import setupTests from '../test-utils/setupTests';
import renderWithProviders from '../test-utils/renderWithProviders';
import userEvent from '@testing-library/user-event';

setupTests()


const user = userEvent.setup()

// Define test data
const currentUser = {user: {username: 'user1', _id: 'user1id'}, token: 'user1token'}
const defaultProfileImage = 'https://res.cloudinary.com/dojzptdbc/image/upload/v1687104476/default_profile_k3tfhd.jpg'
const changedImage = 'https://res.cloudinary.com/dojzptdbc/image/upload/v1744801354/my-profile/trebppi1l7ssjmypwsk0.png'

const userData = [
    {username: 'user2', image:defaultProfileImage, _id: 'user2id', icon: 'fa-envelope-circle-check', text: 'Friend request pending'},
    {username: 'user3', image:defaultProfileImage, _id: 'user3id', icon: 'fa-user-group', text: 'Friends'},
    {username: 'user4', image:defaultProfileImage, _id: 'user4id', icon: 'fa-user-group', text: 'Friends'},
    {username: 'user5', image:defaultProfileImage, _id: 'user5id', icon: 'fa-user-group', text: 'Friends'},
    {username: 'user6', image:changedImage, _id: 'user6id', text: 'Send Friend Request'}
]

const friendData = [
    {username: 'sender1', image: changedImage, _id: 'sender1id', icon: 'fa-envelope-open', text: 'Wants to be friends'},
     ...userData.slice(0, 4)
    ]

describe('DISPLAYING CORRECT DATA', () => {
    test('Search bar should show matching users, with correct friend request status.', async () => {
        // Render component
        const { component, history } = renderWithProviders(<Friends />, {currentUser, path: '/friends'})
        // Find input
        let input
        await waitFor(() => {
            input = screen.getByRole('searchbox')
            expect(input).toBeInTheDocument()
        })
        // Input should have correct placeholder
        expect(input.placeholder).toBe('Search for users')
        // Results should not be displayed yet
        let results
        results = component.container.getElementsByClassName('result')
        expect(results).toHaveLength(0)
        // User can type in input
        fireEvent.change(input, {target: {value: 'user'}})
        expect(input.value).toEqual('user')
        // Results should now be displayed
        let resultsContainer
        await waitFor(() => {
            results = component.container.getElementsByClassName('result')
            expect(results).not.toHaveLength(0)
            resultsContainer = component.container.getElementsByClassName('_results_883ab8')
            expect(resultsContainer).toHaveLength(1)
        })
        // Should be 5 matching users
        const matchingResults = resultsContainer[0].children
        expect(matchingResults).toHaveLength(5)
        // Each result should have correct username, image and request status
        Array.from(matchingResults).forEach((result, index) => {
            // Image should have correct source
            const image = result.children[0].children[0]
            expect(image.src).toBe(userData[index].image)
            // Username should be correct
            const username = result.children[1].children[0]
            expect(username).toHaveTextContent(userData[index].username)
            // Friend Request status should be correct
            const statusIcon = result.children[2].children[0]
            const statusText = result.children[2].children[0].nextSibling
            if (index !== 4) {
                expect(statusIcon).toHaveClass(userData[index].icon)
                expect(statusText).toHaveTextContent(userData[index].text)
            } else {
                expect(statusIcon).toHaveTextContent(userData[index].text)
            }
        })
        // Clicking link in search results directs to that users profile
        await user.click(matchingResults[0].children[1].children[0])
        expect(history.location.pathname).toBe('/films/user2id')
    })
    test('Friends list should show correct users with correct status and pagination messge should be correct.', async () => {
        // Render component
        const { component, history } = renderWithProviders(<Friends />, {currentUser, path: '/friends'})
        // Should be 4 user cards
        let userCards
        await waitFor(() => {
            userCards = component.container.getElementsByClassName('_userCard_883ab8')
            expect(userCards).toHaveLength(5)
        })
        Array.from(userCards).forEach((card, index) => {
            // Image should have correct source
            const image = card.children[0]
            expect(image.src).toBe(friendData[index].image) 
            // Should have correct username
            const username = card.children[2]
            expect(username).toHaveTextContent(friendData[index].username)
            // Status should be correct
            const statusIcon = card.children[3].children[0]
            expect(statusIcon).toHaveClass(friendData[index].icon) 
            // Text should be correct
            const statusText = card.children[3].children[0].nextSibling 
            expect(statusText).toHaveTextContent(friendData[index].text)  
        })
        // Clicking link in user card directs to that users profile
        await user.click(userCards[0].children[2])
        expect(history.location.pathname).toBe('/films/sender1id')
    })
})

describe('FILTERING, SORTING AND PAGINATING FRIEND REQUESTS', () => {
    test('Filtering based on accepted/pending changes which requests are shown. Sorting changes order correctly.', async () => {
        // Render component
        const { component } = renderWithProviders(<Friends />, {currentUser, path: '/friends'})
        // Assert filter is present
        let filterButton
        await waitFor(() => {
            filterButton = screen.getByRole('button', {name: 'All'})
            expect(filterButton).toBeInTheDocument()
        })
        // Pagination message is correct
        let message = screen.getByText('Showing all requests 1 to 5 of 5')
        expect(message).toBeInTheDocument()
        // Click filter should reveal dropdown options
        await user.click(filterButton)
        let items = component.container.getElementsByClassName('dropdown-item')
        expect(items).toHaveLength(3)
        expect(items[0]).toHaveTextContent('All')
        expect(items[1]).toHaveTextContent('Friends')
        expect(items[2]).toHaveTextContent('Pending Requests')
        // Clicking Friends should hide user2 and sender1, leaving 3
        await user.click(items[1])
        let userCards = component.container.getElementsByClassName('_userCard_883ab8')
        expect(userCards).toHaveLength(3)
        // Pagination message is correct
        message = screen.getByText('Showing friends 1 to 3 of 3')
        expect(message).toBeInTheDocument()
        Array.from(userCards).forEach((card, index) => {
            // Should have correct username
            const username = card.children[2]
            expect(username).toHaveTextContent(index === 0? 'user3': index === 1? 'user4': 'user5')
        })
        // Clicking pending requests should show only user2 and sender1
        await user.click(items[2])
        userCards = component.container.getElementsByClassName('_userCard_883ab8')
        expect(userCards).toHaveLength(2)
        // Pagination message is correct
        message = screen.getByText('Showing pending requests 1 to 2 of 2')
        Array.from(userCards).forEach((card, index) => {
            // Should have correct username
            const username = card.children[2]
            expect(username).toHaveTextContent(index === 0? 'sender1': 'user2')
        })
        // Assert sort dropdown is present
        const sortButton = screen.getByRole('button', {name: 'A-Z'})
        expect(sortButton).toBeInTheDocument()
        // Clicking sort button should reveal correct items
        await user.click(sortButton)
        await waitFor(() => {
            items = component.container.getElementsByClassName('dropdown-item')
            expect(items).toHaveLength(5)
            expect(items[3]).toHaveTextContent('A-Z')
            expect(items[4]).toHaveTextContent('Last Updated')
        })
        // Sorting by last updated should change order correctly
        await user.click(items[4])
        userCards = component.container.getElementsByClassName('_userCard_883ab8')
        await waitFor(() => {
            expect(userCards[0].children[2]).toHaveTextContent('user2')
            expect(userCards[1].children[2]).toHaveTextContent('sender1')
        })
    })
    test('Pagination should be present when user has more than 10 requests, and clicking page buttons should change results.', async () => {
        // Render component
        const { component } = renderWithProviders(
            <Friends />, 
            {currentUser: {user: {username: 'alex', _id: 'alexid'}, token: 'alextoken'}, path: '/friends'}
        )   
        let userCards 
        // Should be 9 users
        await waitFor(() => {
            userCards = component.container.getElementsByClassName('_userCard_883ab8')    
            expect(userCards).toHaveLength(9)
        }) 
        // Usernames should be correct
        Array.from(userCards).forEach((card, index) => {
            expect(card.children[2]).toHaveTextContent(`friend ${String.fromCharCode(97 + index)}`)
        })
        // Find and click page 2 button
        const pageBtn = screen.getByRole('button', {name: 2})
        expect(pageBtn).toBeInTheDocument()
        await user.click(pageBtn)
        userCards = component.container.getElementsByClassName('_userCard_883ab8')
        // New usernames should be correct
        Array.from(userCards).forEach((card, index) => {
            expect(card.children[2]).toHaveTextContent(`friend ${String.fromCharCode(106 + index)}`)
        })
    })
})

describe('NO REQUESTS TO DISPLAY CASES', () => {
    test('If current user has no friend requests, image and message should be display', async () => {
        // Render component
        const { component } = renderWithProviders(
            <Friends />, 
            {currentUser: {user: {username: 'steve', _id: 'steveid'}, token: 'stevetoken'}, path: '/friends'}
        )         
        // Placeholder image should be present
        await waitFor(() => {
            const image = screen.getByRole('img', {name: 'Friends placeholder image'})
            expect(image).toBeInTheDocument()
            expect(image.src).toBe('https://res.cloudinary.com/dojzptdbc/image/upload/v1744199262/FriendsPlus_jbxswo.png')
        })
        // Message should be present
        const message = screen.getByText("It looks like you don't have any friends yet. Search to connect with other users!")
        expect(message).toBeInTheDocument()
        // No user cards should be present
        const userCards = component.container.getElementsByClassName('_userCard_883ab8')
        expect(userCards).toHaveLength(0)
    })
    test('If current user has friend reuqests but none match criteria in filter, correct message should be displayed', async () => {
        // Render component
        const { component } = renderWithProviders(
            <Friends />, 
            {currentUser: {user: {username: 'user2', _id: 'user2id'}, token: 'user2token'}, path: '/friends'}
        )
        // Should be 1 request
        let userCards
        await waitFor(() => {
            userCards = component.container.getElementsByClassName('_userCard_883ab8')
        })    
        expect(userCards).toHaveLength(1)
        // Click filter button
        const filterButton = screen.getByRole('button', {name: 'All'})
        await user.click(filterButton)
        const items = component.container.getElementsByClassName('dropdown-item')
        // Select pending requests
        await user.click(items[2])
        // Should be no users displayed
        userCards = component.container.getElementsByClassName('_userCard_883ab8')
        expect(userCards).toHaveLength(0)
        // Correct message should be displayed
        const message = screen.getByText('No requests matching current criteria')
    })
})
