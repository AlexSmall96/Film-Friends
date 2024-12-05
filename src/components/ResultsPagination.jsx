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
        <Pagination  >
            {currentPage !== 1? (
                <>
                    <Pagination.First linkStyle={{color: 'black'}} onClick={() => handleClick(1)} />
                        {currentPage !== 2? (
                            <>
                                <Pagination.Prev linkStyle={{color: 'black'}} onClick={() => handleClick(currentPage - 1)}/>
                                <Pagination.Ellipsis linkStyle={{color: 'black'}} />
                            </>
                        ):('')}
                    <Pagination.Item linkStyle={{color: 'black'}} onClick={() => handleClick(currentPage - 1)}>{currentPage - 1}</Pagination.Item>
                </>
            ):('')}
            <Pagination.Item linkStyle={{color: 'white', backgroundColor: 'grey', borderColor: 'grey'}} active>{currentPage}</Pagination.Item>
            {currentPage !== finalPage? (
                <>
                    <Pagination.Item linkStyle={{color: 'black'}} onClick={() => handleClick(currentPage + 1)}>
                        {currentPage + 1}
                    </Pagination.Item>
                    {currentPage !== finalPage - 1? (
                        <>
                            <Pagination.Ellipsis linkStyle={{color: 'black'}}/>
                            <Pagination.Next  linkStyle={{color: 'black'}} onClick={() => handleClick(currentPage + 1)}/>
                        </>
                    ):('')}
                    <Pagination.Last linkStyle={{color: 'black'}} onClick={() => handleClick(finalPage) }/>
                </>
            ):('')}
        </Pagination>
    )
}

export default ResultsPagination