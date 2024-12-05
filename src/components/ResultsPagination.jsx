import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import appStyles from '../App.module.css'

// Renders a custom pagination component depending on the number of pages and current page selected
const ResultsPagination = ({currentPage, setCurrentPage, finalPage, setHasLoaded}) => {
   
    const [pages, setPages] = useState([])
    // Use current page and final page to determine pages array
    useEffect(() => {
        const items = []
        if (finalPage <= 10) {
            for (let i=1;i<=finalPage;i++){
                items.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i=1;i<=8;i++){
                    items.push(i)
                }
                items.push('...')
                items.push(finalPage)
            } else if (currentPage <= finalPage - 8){
                items.push(1)
                items.push('...')
                for (let i=currentPage;i<=currentPage + 5;i++){
                    items.push(i)
                }
                items.push('...')
                items.push(finalPage)
            } else {
                items.push(1)
                items.push('...')
                for (let i=finalPage-7;i<=finalPage-1;i++){
                    items.push(i)
                }
                items.push(finalPage)
            }
        }
        setPages(items)
    }, [currentPage, finalPage])

    return (
        <>
            {/* MAP PAGES ARRAY TO BUTTONS */}
            <Button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} variant='link'><i className="fa-solid fa-chevron-left"></i></Button>
                {pages.map(page => 
                    <Button className={appStyles.noUnderline} variant={page === currentPage? 'secondary': 'link'} onClick={() => setCurrentPage(page)}>{page}</Button>
                )}
            <Button disabled={currentPage === finalPage} onClick={() => setCurrentPage(currentPage + 1)} variant='link'><i className="fa-solid fa-chevron-right"></i></Button>         
        </>
    )

}

export default ResultsPagination