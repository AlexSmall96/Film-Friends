/**
 * @vitest-environment jsdom
 */
import Filters from './Filters'
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import setupTests from '../../test-utils/setupTests';
import userEvent from '@testing-library/user-event'
import renderWithContext from '../../test-utils/renderWithContext'

setupTests()

const user = userEvent.setup()

test('If current user is owner of films list, dropdwon with public and private options should be displayed.', async () => {
    // Render component as owner of films list
    const props = {filter: {public: true, watched: false}}
    const currentFilmData = {isOwner: true, username: 'user1'}
    renderWithContext(<Filters />, {props, currentFilmData})
    // Dropdown options should not yet be present
    const optionNames = ['Public', 'Private']
    optionNames.map(name => {
        const option = screen.queryByRole('button', {name})
        expect(option).not.toBeInTheDocument()
    })
    // Find dropdown button
    const publicPrivateDrpdwn = screen.getByRole('button', {name: 'Your Public Watchlist'})
    expect(publicPrivateDrpdwn).toBeInTheDocument()
    // Click button
    await user.click(publicPrivateDrpdwn)
    optionNames.map(name => {
        const option = screen.getByRole('button', {name})
        expect(option).toBeInTheDocument()
    })
    // Text saying user 1s watchlist should not be present
    const watchlistText = screen.queryByText("user1's Watchlist")
    expect(watchlistText).not.toBeInTheDocument()
})

test('If current user is not owner of films list, text saying user 1s watchlist should be displayed instead of public/private dropdown', () => {
    // Render component as not owner of films list
    const props = {filter: {public: true, watched: false}}
    const currentFilmData = {isOwner: false, username: 'user1'}
    renderWithContext(<Filters />, {props, currentFilmData})
    // Dropdown button should not be present
    const publicPrivateDrpdwn = screen.queryByRole('button', {name: 'Your Public Watchlist'})
    expect(publicPrivateDrpdwn).not.toBeInTheDocument() 
    // Text saying user 1s watchlist should be present
    const watchlistText = screen.getByText("user1's Watchlist")
    expect(watchlistText).toBeInTheDocument()
})

test('Filter by watched/unwatched and sort dropdowns should be present', async () => {
    // Render component as not owner of films list
    const props = {filter: {public: true, watched: false}}
    const currentFilmData = {isOwner: false, username: 'user1'}
    renderWithContext(<Filters />, {props, currentFilmData}) 
    // Dropdown options should not yet be present
    const sortOptionNames = ['A-Z', 'Last Updated']
    sortOptionNames.map(name => {
        const option = screen.queryByRole('button', {name})
        expect(option).not.toBeInTheDocument()
    })
    const filterOptionNames = ['All', 'Watched', 'Still to Watch']
    filterOptionNames.map(name => {
        const option = screen.queryByRole('button', {name})
        expect(option).not.toBeInTheDocument()
    })
    // Buttongroup should be present
    const buttonGroupWrapper = screen.getAllByRole('group')[0]
    // Should be two children of wrapper
    expect(buttonGroupWrapper.children).toHaveLength(2)
    // Find and click sort dropdown
    const sortDropdown = buttonGroupWrapper.children[0].children[0]
    expect(sortDropdown).toBeInTheDocument()
    await user.click(sortDropdown)
    sortOptionNames.map(name => {
        const option = screen.getByRole('button', {name})
        expect(option).toBeInTheDocument()
    })
    // Find and click filter dropdown
    const filterDropdown = buttonGroupWrapper.children[1].children[0]
    expect(filterDropdown).toBeInTheDocument()
    await user.click(filterDropdown)
    filterOptionNames.map(name => {
        const option = screen.getByRole('button', {name})
        expect(option).toBeInTheDocument()
    })
})
