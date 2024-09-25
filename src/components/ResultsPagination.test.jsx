/**
 * @vitest-environment jsdom
 */
import ResultsPagination from './ResultsPagination';
import React, {useState} from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { describe, test, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
    cleanup()
})

const MockComponent = () => {
    const [currentPage, setCurrentPage] = useState(3);
    return <ResultsPagination currentPage={currentPage} setCurrentPage={setCurrentPage} finalPage={10} />;
};

describe('RENDERING BUTTONS', () => {
    test('Should render 5 buttons when first page is selected, each with correct text', async () => {
        // Render component
        render(<ResultsPagination currentPage={1} finalPage={10} />)
        const pageTabs = screen.getByRole('list')
        expect(pageTabs).toBeInTheDocument()
        // Should have correct length
        expect(pageTabs.children).toHaveLength(5)
        // Each tab should have correct text
        const pageNumbers = Array.from(pageTabs.children).map(child => child.children[0].textContent)
        expect(pageNumbers).toEqual([ '1(current)', '2', '…More', '›Next', '»Last'])
        // First tab should be active
        expect(pageTabs.children[0]).toHaveClass('active')
    })
    test('Should render 7 buttons when second page is selected, each with correct text', async () => {
        // Render component
        render(<ResultsPagination currentPage={2} finalPage={10} />)
        const pageTabs = screen.getByRole('list')
        expect(pageTabs).toBeInTheDocument()
        // Should have correct length
        expect(pageTabs.children).toHaveLength(7)
        // Each tab should have correct text
        const pageNumbers = Array.from(pageTabs.children).map(child => child.children[0].textContent)
        expect(pageNumbers).toEqual(["«First", "1", "2(current)", "3", "…More", "›Next", "»Last"])
        // Third tab should be active
        expect(pageTabs.children[2]).toHaveClass('active')
    })
    test('Should render 9 buttons when a general page is selected, each with correct text', async () => {
        // Render component
        render(<ResultsPagination currentPage={3} finalPage={10} />)
        const pageTabs = screen.getByRole('list')
        expect(pageTabs).toBeInTheDocument()
        // Should have correct length
        expect(pageTabs.children).toHaveLength(9)
        // Each tab should have correct text
        const pageNumbers = Array.from(pageTabs.children).map(child => child.children[0].textContent)
        expect(pageNumbers).toEqual(['«First', '‹Previous', '…More', "2", "3(current)", "4", '…More', '›Next', '»Last'])
        // Fifth tab should be active
        expect(pageTabs.children[4]).toHaveClass('active')
    })
    test('Should render 7 buttons when second last page is selected, each with correct text', async () => {
        // Render component
        render(<ResultsPagination currentPage={9} finalPage={10} />)
        const pageTabs = screen.getByRole('list')
        expect(pageTabs).toBeInTheDocument()
        // Should have correct length
        expect(pageTabs.children).toHaveLength(7)
        // Each tab should have correct text
        const pageNumbers = Array.from(pageTabs.children).map(child => child.children[0].textContent)
        expect(pageNumbers).toEqual(['«First', '‹Previous', '…More', "8", "9(current)", "10", '»Last'])
        // Fifth tab should be active
        expect(pageTabs.children[4]).toHaveClass('active')
    })
    test('Should render 5 buttons when last page is selected, each with correct text', async () => {
        // Render component
        render(<ResultsPagination currentPage={10} finalPage={10} />)
        const pageTabs = screen.getByRole('list')
        expect(pageTabs).toBeInTheDocument()
        // Should have correct length
        expect(pageTabs.children).toHaveLength(5)
        // Each tab should have correct text
        const pageNumbers = Array.from(pageTabs.children).map(child => child.children[0].textContent)
        expect(pageNumbers).toEqual(['«First', '‹Previous', '…More', "9", "10(current)"])
        // Fifth tab should be active
        expect(pageTabs.children[4]).toHaveClass('active')       
    })
})

describe('BUTTON FUNCTIONALITY', () => {
    test('Clicking active tab does nothing', async () => {
        // Render component
        render(<MockComponent />)
        const pageTabs = screen.getByRole('list')
        // Get and click active tab
        let tab = pageTabs.children[4]
        const user = userEvent.setup()
        await user.click(tab)
        // Length should stay the same
        expect(pageTabs.children).toHaveLength(9)
        // Text should stay the same
        const pageNumbers = Array.from(pageTabs.children).map(child => child.children[0].textContent)
        expect(pageNumbers).toEqual(['«First', '‹Previous', '…More', "2", "3(current)", "4", '…More', '›Next', '»Last'])
        // Fifth tab should still be active
        tab = pageTabs.children[4]
        expect(tab).toHaveClass('active')
    })
    test('Clicking tab with « makes first tab active and changes length and text', async () => {
        render(<MockComponent />)
        const pageTabs = screen.getByRole('list')
        // Get and click « first tab
        let tab = pageTabs.children[0]
        const user = userEvent.setup() 
        await user.click(tab.children[0])
        // Length should now be 5
        expect(pageTabs.children).toHaveLength(5)
        // Check if the first tab is active
        tab = pageTabs.children[0]
        expect(tab).toHaveClass('active')
        // First tab should have text "1(current)"
        expect(tab.children[0]).toHaveTextContent("1(current)")
    })
    test('Clicking tab with ‹ makes third tab active and changes length and text', async () => {
        render(<MockComponent />)
        const pageTabs = screen.getByRole('list')
        // Get and click ‹ tab
        let tab = pageTabs.children[1]
        const user = userEvent.setup() 
        await user.click(tab.children[0])
        // Length should now be 7
        expect(pageTabs.children).toHaveLength(7)
        // Check if the third tab is active
        tab = pageTabs.children[2]
        expect(tab).toHaveClass('active')
        // Third tab should have text "2(current)"
        expect(tab.children[0]).toHaveTextContent("2(current)")
    })
    test('Clicking tabs with … does nothing', async () => {
        // Render component
        render(<MockComponent />)
        const pageTabs = screen.getByRole('list')
        // Get and click … tab
        let tab = pageTabs.children[2]
        const user = userEvent.setup()
        await user.click(tab)
        // Length should stay the same
        expect(pageTabs.children).toHaveLength(9)
        // Text should stay the same
        const pageNumbers = Array.from(pageTabs.children).map(child => child.children[0].textContent)
        expect(pageNumbers).toEqual(['«First', '‹Previous', '…More', "2", "3(current)", "4", '…More', '›Next', '»Last'])
        // Fifth tab should still be active
        tab = pageTabs.children[4]
        expect(tab).toHaveClass('active')
    })
    test('Clicking tab with 2 makes third tab active and changes length and text', async () => {
        render(<MockComponent />)
        const pageTabs = screen.getByRole('list')
        // Get and click 2 tab
        let tab = pageTabs.children[3]
        const user = userEvent.setup() 
        await user.click(tab.children[0])
        // Length should now be 7
        expect(pageTabs.children).toHaveLength(7)
        // Check if the third tab is active
        tab = pageTabs.children[2]
        expect(tab).toHaveClass('active')
        // Third tab should have text "2(current)"
        expect(tab.children[0]).toHaveTextContent("2(current)")
    })
    test('Clicking tab with 4 keeps the fifth tab active and changes text but length stays the same', async () => {
        render(<MockComponent />)   
        const pageTabs = screen.getByRole('list')
        // Get and click 4 tab
        let tab = pageTabs.children[5]
        const user = userEvent.setup() 
        await user.click(tab.children[0])
        // Length should still be 9
        expect(pageTabs.children).toHaveLength(9)
        // Check if the fourth tab is active
        tab = pageTabs.children[4]
        expect(tab).toHaveClass('active')
        // Fourth tab should have text "4(current)"
        expect(tab.children[0]).toHaveTextContent("4(current)")
    })
    test('Clicking tab with › keeps the fifth tab active and changes text but length stays the same', async () => {
        render(<MockComponent />)
        const pageTabs = screen.getByRole('list')
        // Get and click › tab
        let tab = pageTabs.children[7]
        const user = userEvent.setup() 
        await user.click(tab.children[0])
        // Length should still be 9
        expect(pageTabs.children).toHaveLength(9)
        // Check if the fourth tab is active
        tab = pageTabs.children[4]
        expect(tab).toHaveClass('active')
        // Third tab should have text "4(current)"
        expect(tab.children[0]).toHaveTextContent("4(current)")
    })
    test('Clicking tab with » makes the final tab actice and changes length and text', async () => {
        render(<MockComponent />)
        const pageTabs = screen.getByRole('list')
        // Get and click » tab
        let tab = pageTabs.children[8]
        const user = userEvent.setup() 
        await user.click(tab.children[0])
        // Length should now be 5
        expect(pageTabs.children).toHaveLength(5)
        // Check if the final tab is active
        tab = pageTabs.children[4]
        expect(tab).toHaveClass('active')
        // First tab should have text "10(current)"
        expect(tab.children[0]).toHaveTextContent("10(current)")       
    })
})