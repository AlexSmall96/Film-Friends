import React from 'react';
import Pagination from 'react-bootstrap/Pagination';

// Renders a custom pagination component depending on the number of pages and current page selected
// First, prev, ellipsis, next and last are only required for certain values of current page and final page //
const ResultsPagination = ({currentPage, setCurrentPage, finalPage}) => {
    return (
        <Pagination>
            {currentPage !== 1? (
                <>
                    <Pagination.First onClick={() => setCurrentPage(1)} />
                        {currentPage !== 2? (
                            <>
                                <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)}/>
                                <Pagination.Ellipsis />
                            </>
                        ):('')}
                    <Pagination.Item onClick={() => setCurrentPage(currentPage - 1)}>{currentPage - 1}</Pagination.Item>
                </>
            ):('')}
            <Pagination.Item active>{currentPage}</Pagination.Item>
            {currentPage !== finalPage? (
                <>
                    <Pagination.Item onClick={() => setCurrentPage(currentPage + 1)}>{currentPage + 1}</Pagination.Item>
                    {currentPage !== finalPage - 1? (
                        <>
                            <Pagination.Ellipsis />
                            <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)}/>
                        </>
                    ):('')}
                    <Pagination.Last onClick={() => setCurrentPage(finalPage)}/>
                </>
            ):('')}
        </Pagination>
    )
}

export default ResultsPagination