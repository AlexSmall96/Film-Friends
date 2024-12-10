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
        const show = width >= 475? 10 : width >= 387? 8 : 6
        const items = []
        if (finalPage <= show) {
            for (let i=1;i<=finalPage;i++){
                items.push({key: i, display: i})
            }
        } else {
            if (currentPage <= 3) {
                for (let i=1;i<=show-2;i++){
                    items.push({key: i, display: i})
                }
                items.push({key: finalPage - 1, display: '...'})
                items.push({key: finalPage, display: finalPage})
            } else if (currentPage <= finalPage - show + 2){
                items.push({key: 1, display: 1})
                items.push({key: 2, display: '...'})
                for (let i=currentPage;i<=currentPage + show - 5;i++){
                    items.push({key: i, display: i})
                }
                items.push({key: finalPage - 1, display: '...'})
                items.push({key: finalPage, display: finalPage})
            } else {
                items.push({key:1, display: 1})
                items.push({key:2, display: '...'})
                for (let i=finalPage-show + 3;i<=finalPage-1;i++){
                    items.push({key: i, display: i})
                }
                items.push({key: finalPage, display: finalPage})
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
                    <Button key={page.key} disabled={page.display === '...'} className={appStyles.noUnderline} variant={page.display === currentPage? 'secondary': 'link'} onClick={() => setCurrentPage(page.display)}>{page.display}</Button>
                )}
            {currentPage !== finalPage?
                <Button size='sm' disabled={currentPage === finalPage} onClick={() => setCurrentPage(currentPage + 1)} variant='link'><i className="fa-solid fa-chevron-right"></i></Button>  
            :''}   
        </>
    )

}

export default ResultsPagination