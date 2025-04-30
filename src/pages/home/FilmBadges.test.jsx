/**
 * @vitest-environment jsdom
 */
import FilmBadges from './FilmBadges'
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { act } from '@testing-library/react';
import { test, expect} from 'vitest';
import setupTests from '../../test-utils/setupTests';
import { vi } from 'vitest';
import renderWithContext from '../../test-utils/renderWithContext';

setupTests()

// Define sample data to pass into component
const films = ['Spider-Man 2', 'Love Actually', 'Memento', 'Inception']
const props = {films}

test('Each film should appear once in badges and once in hidden badges.', () => {
    // Render component
    const { component } = renderWithContext(<FilmBadges />, {props})
    const container = component.container
    // Get elements with class name visible badge
    const visibleBadges = container.getElementsByClassName('_badge_da902b')
    // Should have length 4
    expect(visibleBadges).toHaveLength(4)
    // Each title should be rendered as a badge
    films.map((film) => {
        const index = films.indexOf(film)
        expect(visibleBadges[index].innerHTML).toBe(film)
    })
    // Get elements with class name visible badge
    const hiddenBadges = container.getElementsByClassName('hidden-badge')
    // Should have length 4
    expect(hiddenBadges).toHaveLength(4)
    // Each title should rendered as a badge
    films.map((film) => {
        const index = films.indexOf(film)
        expect(hiddenBadges[index].innerHTML).toBe(film)
    })
})

test('When screen width is changed, badges should dissapear if their right border is cut off', async () => {
    // Render component
    const { component } = renderWithContext(<FilmBadges />, {props})
    const container = component.container
    // Get both badges for each film (hidden and visible)
    const hiddenBadgeElements = container.getElementsByClassName('hidden-badge')
    const hiddenBadges = Array.from(hiddenBadgeElements)
    // Define right borders for mock implementation of getBoundingClientRect
    const rightBorders = [50, 100, 160, 230]
    // Mock values for each badge
    hiddenBadges.forEach((badge, index) => {
        vi.spyOn(badge, 'getBoundingClientRect').mockImplementation(() => ({
            x: 0,
            y: 0,
            bottom: 100,
            height: 50,
            left: 0,
            right: rightBorders[index],
            top: 0,
            width: 50            
        }))
    })
    // Set width to border position + 16 for each border
    rightBorders.forEach((border, index) => {
        act(() => {
            global.innerWidth = border + 16;
            global.dispatchEvent(new Event('resize'));
        });
        // Find visible badges
        const visibleBadges = container.getElementsByClassName('_badge_da902b')
        // Assert there are the correct number of badges and the correct film titles
        expect(visibleBadges).toHaveLength(index + 1)
        const visibleTitles = Array.from(visibleBadges).map(badge => badge.innerHTML)
        expect(visibleTitles).toEqual(films.slice(0, index + 1))
    })
})