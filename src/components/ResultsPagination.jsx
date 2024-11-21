import React from 'react';
import Pagination from 'react-bootstrap/Pagination';

// Renders a custom pagination component depending on the number of pages and current page selected
// First, prev, ellipsis, next and last are only required for certain values of current page and final page //
const ResultsPagination = ({currentPage, setCurrentPage, finalPage, setHasLoaded}) => {

    const handleClick = (page) => {
        setCurrentPage(page)
        if (setHasLoaded){
            setHasLoaded(false)
        }
    }

    return (
        <Pagination>
            {currentPage !== 1? (
                <>
                    <Pagination.First onClick={() => handleClick(1)} />
                        {currentPage !== 2? (
                            <>
                                <Pagination.Prev onClick={() => handleClick(currentPage - 1)}/>
                                <Pagination.Ellipsis />
                            </>
                        ):('')}
                    <Pagination.Item onClick={() => handleClick(currentPage - 1)}>{currentPage - 1}</Pagination.Item>
                </>
            ):('')}
            <Pagination.Item active>{currentPage}</Pagination.Item>
            {currentPage !== finalPage? (
                <>
                    <Pagination.Item onClick={() => handleClick(currentPage + 1)}>
                        {currentPage + 1}
                    </Pagination.Item>
                    {currentPage !== finalPage - 1? (
                        <>
                            <Pagination.Ellipsis />
                            <Pagination.Next onClick={() => handleClick(currentPage + 1)}/>
                        </>
                    ):('')}
                    <Pagination.Last onClick={() => handleClick(finalPage) }/>
                </>
            ):('')}
        </Pagination>
    )
}

export default ResultsPagination