/**
 * @vitest-environment jsdom
 */
import Avatar from './Avatar'
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { screen } from '@testing-library/react';
import { test, expect} from 'vitest';
import setupTests from '../test-utils/setupTests';
import renderWithNullContext from '../test-utils/renderWithNullContext';

setupTests()

test('When rendered with all props, the image should have correct height, width and source.', () => {
    const src = 'https://res.cloudinary.com/dojzptdbc/image/upload/v1744633674/defaultProfile_fjp9f4.png'
    // Render component
    renderWithNullContext(<Avatar />, {src, height: 100})
    // Find image
    const image = screen.getByRole('img', {name: 'avatar'})
    expect(image).toBeInTheDocument()
    // Image should have correct src, height and width
    expect(image.src).toBe('https://res.cloudinary.com/dojzptdbc/image/upload/v1744633674/defaultProfile_fjp9f4.png')
    expect(image.height).toBe(100)
    expect(image.width).toBe(100)
})

test('When rendered with no props, the image should have default source and height.', () => {
    // Render component
    renderWithNullContext(<Avatar />)
    // Find image
    const image = screen.getByRole('img', {name: 'avatar'})
    expect(image).toBeInTheDocument()
    // Image should have default src of current user image, and default height and width.
    expect(image.src).toBe('https://res.cloudinary.com/dojzptdbc/image/upload/v1744368051/defaultProfile_hizptb.png')
    expect(image.height).toBe(45)
    expect(image.width).toBe(45)
})

test('When rendered with square prop as true, the image should have class name squareAvatar and not avatar.', () => {
    // Render component with square as true
    renderWithNullContext(<Avatar />, {square: true})
    const image = screen.getByRole('img', {name: 'avatar'})
    expect(image).toBeInTheDocument()
    expect(image).not.toHaveClass('_avatar_a0aacb')
    expect(image).toHaveClass('_squareAvatar_a0aacb')
})

test('When rendered with square prop as false, the image should have class name avatar and not squareAvatar', () => {
    // Render component with square as false
    renderWithNullContext(<Avatar />, {square: false})
    const image = screen.getByRole('img', {name: 'avatar'})
    expect(image).toBeInTheDocument()
    expect(image).not.toHaveClass('_squareAvatar_a0aacb')
    expect(image).toHaveClass('_avatar_a0aacb')
})
