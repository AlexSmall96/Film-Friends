/**
 * @vitest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { screen, render, act } from '@testing-library/react';
import { test, expect, describe} from 'vitest';
import setupTests from '../test-utils/setupTests';
import ResultsPagination from './ResultsPagination';

setupTests()

// Helper function to render with props
// Setcurrent page is a null function as this test file doesn't require testing updating state
const renderWithData = (finalPage,  currentPage=1) => {
    const setCurrentPage = () => {}
    render(<ResultsPagination currentPage={currentPage} finalPage={finalPage} setCurrentPage={setCurrentPage} />)
    const buttons = screen.getAllByRole('button')
    return buttons
}

// Function to compare the buttons rendered to an array of the correct text content
const checkButtonText = (buttons, textArray, currentPage=1) => {
    expect(buttons).toHaveLength(currentPage === 1? textArray.length + 1 : textArray.length + 2)
    Array.from(buttons).slice(
        currentPage < 4? 0: 1, textArray.length
    ).forEach((button, index) => {
        expect(button).toHaveTextContent(textArray[index])
    })
}

describe('RENDERING CORRECT NUMBER OF ITEMS: current page = 1 and width >= 475', () => {
    test('If final page is > 10, items should be 1 - 8, ..., final page. ', async () => {
        // Set width
        act(() => {
            global.innerWidth = 1000;
            global.dispatchEvent(new Event('resize'));
        });
        // Render with final page 12
        const buttons = renderWithData(12)
        // Check text content
        checkButtonText(buttons, [1, 2, 3, 4, 5, 6, 7, 8, '...', 12])
        // All buttons after 1 should have class of link and not secondary
        Array.from(buttons).slice(1, 10).map(button => {
            expect(button).toHaveClass('btn-link')
            expect(button).not.toHaveClass('btn-secondary')
        })
        // Only button for 1 should have class secondary
        expect(buttons[0]).toHaveClass('btn-secondary')
        expect(buttons[0]).not.toHaveClass('btn-link')
    })
    test('If final page is <= 10, items should be 1 - final page.', () => {
        // Render with final page 8
        const buttons = renderWithData(8) 
        // Check text content
        checkButtonText(buttons, [1, 2, 3, 4, 5, 6, 7, 8])       
    })
})

describe('RENDERING CORRECT NUMBER OF ITEMS: current page = 1 and width >= 387 and < 475.', () => {
    test('If final page is > 8, items should be 1 - 6, ..., final page. ', async () => {
        // Set width
        act(() => {
            global.innerWidth = 400;
            global.dispatchEvent(new Event('resize'));
        });
        // Render with final page 12
        const buttons = renderWithData(12)
        // Check text content
        checkButtonText(buttons, [1, 2, 3, 4, 5, 6, '...', 12])
    })
    test('If final page is <= 8, items should be 1 - final page.', () => {
        // Set width
        act(() => {
            global.innerWidth = 400;
            global.dispatchEvent(new Event('resize'));
        });
        // Render with final page 8
        const buttons = renderWithData(8) 
        // Check text content
        checkButtonText(buttons, [1, 2, 3, 4, 5, 6, 7, 8])       
    })
})

describe('RENDERING CORRECT NUMBER OF ITEMS: current page = 1 and width < 387.', () => {
    test('If final page > 6, items should be 1 - 4, ..., final page.', () => {
        // Set width
        act(() => {
            global.innerWidth = 300;
            global.dispatchEvent(new Event('resize'));
        }); 
        // Render with final page 8
        const buttons = renderWithData(8)  
        // Check text content
        checkButtonText(buttons, [1, 2, 3, 4, '...', 8])     
    })
    test('If final page <= 6, items should be 1 - final page.', () => {
        // Set width
        act(() => {
            global.innerWidth = 300;
            global.dispatchEvent(new Event('resize'));
        }); 
        // Render with final page 5
        const buttons = renderWithData(5)  
        // Check text content
        checkButtonText(buttons, [1, 2, 3, 4, 5])         
    })
})

describe('ELLIPSIS IN CORRECT POSITION', () => {
    test('If current page is >= 4 but < final page - 7, ellipsis should be next to 1 and final page..', () => {
        // Set width
        act(() => {
            global.innerWidth = 1000;
            global.dispatchEvent(new Event('resize'));
        });
        // Render with final page 12
        const buttons = renderWithData(12, 4)
        // Check text content
        checkButtonText(buttons, [1, '...', 4, 5, 6, 7, 8, 9, '...', 12], 4)    
        // Current page should have correct class
        const currentPageBtn = buttons[3]
        expect(currentPageBtn).toHaveClass('btn-secondary')    
        expect(currentPageBtn).not.toHaveClass('btn-link')    
    })
    test('If current page is >= final page - 7, ellipsis should only be next to 1.', () => {
        // Render with final page 12
        const buttons = renderWithData(12, 11)
        // Check text content
        checkButtonText(buttons, [1, '...', 5, 6, 7, 8, 9, 10, 11, 12], 11)            
    })
})