import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import appStyles from '../App.module.css'
import useWindowDimensions from '../hooks/useWindowDimensions';

// Renders a custom pagination component depending on the number of pages and current page selected
// Shows a certain number of page links depending on window size
const ResultsPagination = ({currentPage, setCurrentPage, finalPage}) => {
    const {width} = useWindowDimensions()
    const [pages, setPages] = useState([])
    // Use current page and final page to determine pages array
    useEffect(() => {
        const show = width >= 576? 10 : 6
        const items = []
        if (finalPage <= show) {
            for (let i=1;i<=finalPage;i++){
                items.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i=1;i<=show-2;i++){
                    items.push(i)
                }
                items.push('...')
                items.push(finalPage)
            } else if (currentPage <= finalPage - show + 2){
                items.push(1)
                items.push('...')
                for (let i=currentPage;i<=currentPage + show - 5;i++){
                    items.push(i)
                }
                items.push('...')
                items.push(finalPage)
            } else {
                items.push(1)
                items.push('...')
                for (let i=finalPage-show + 3;i<=finalPage-1;i++){
                    items.push(i)
                }
                items.push(finalPage)
            }
        }
        setPages(items)
    }, [currentPage, finalPage, width])

    return (
        <>
            {/* MAP PAGES ARRAY TO BUTTONS */}
            {currentPage !== 1?
                <Button size='sm' onClick={() => setCurrentPage(currentPage - 1)} variant='link'><i className="fa-solid fa-chevron-left"></i></Button>
            :''
            }
                {pages.map(page => 
                    <Button key={page} className={appStyles.noUnderline} variant={page === currentPage? 'secondary': 'link'} onClick={() => setCurrentPage(page)}>{page}</Button>
                )}
            {currentPage !== finalPage?
                <Button size='sm' disabled={currentPage === finalPage} onClick={() => setCurrentPage(currentPage + 1)} variant='link'><i className="fa-solid fa-chevron-right"></i></Button>  
            :''}   
        </>
    )

}

export default ResultsPagination