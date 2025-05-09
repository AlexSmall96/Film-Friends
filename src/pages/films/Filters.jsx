import React from 'react';
import { Col, Container, Row, Dropdown, DropdownButton, ButtonGroup } from 'react-bootstrap';
import appStyles from '../../App.module.css'
import { useCurrentFilm } from '../../contexts/CurrentFilmContext';
import useWindowDimensions from '../../hooks/useWindowDimensions';

// A collection of buttons used to filter and sort a users watchlist
const Filters = ({ filter, setFilter, sort, setSort }) => {

    // Contexts and hooks
    const {isOwner, username} = useCurrentFilm()
    const { width } = useWindowDimensions()

    return (
        <Container fluid>
        <Row>
            <Col xl={4} lg={12} md={12} sm={6} xs={12}>
                {isOwner? ( 
                    /* CHANGE WATCHLIST TO PRIVATE OR PUBLIC */
                    <ButtonGroup className={appStyles.whiteBackground}>
                        <DropdownButton size="sm" variant='outline-secondary' title={`Your ${filter.public? 'Public': 'Private'} Watchlist`}>
                            <Dropdown.Item onClick={!filter.public ? () => setFilter({public: true, watched: filter.watched}): null}>Public</Dropdown.Item>
                            <Dropdown.Item onClick={filter.public ? () => setFilter({public: false, watched: filter.watched}): null}>Private</Dropdown.Item>
                        </DropdownButton>
                    </ButtonGroup>
                ):(
                    `${username}'s Watchlist`
                )}            
            </Col>
            <Col xl={8} lg={12} md={12} sm={6} xs={12}>
                {/* SORT AND FILTER BY WATCHED/NOT WATCHED */}
                <ButtonGroup className={`${width <= 575 || (width >= 768 && width < 1200)? appStyles.verticalMargin : ''} ${appStyles.whiteBackground}`}>
                    <DropdownButton 
                        as={ButtonGroup} 
                        size="sm" 
                        variant='outline-secondary' 
                        title={
                            <>
                                <i className="fa-solid fa-sort"></i> {sort}
                            </>
                        }
                    >
                        <Dropdown.Item onClick={() => setSort('A-Z')}>A-Z</Dropdown.Item>
                        <Dropdown.Item onClick={() => setSort('Last Updated')}>Last Updated</Dropdown.Item>
                    </DropdownButton>
                    <DropdownButton 
                        as={ButtonGroup} 
                        size="sm" 
                        variant='outline-secondary' 
                        
                        title={
                            <>
                                <i className="fa-solid fa-filter"></i> {filter.watched}
                            </>
                        }
                    >
                        <Dropdown.Item onClick={filter.watched !== 'All' ? () => {setFilter({public: filter.public, watched: 'All'})} : null}>All</Dropdown.Item>
                        <Dropdown.Item onClick={filter.watched !== 'Watched' ? () => {setFilter({public: filter.public, watched: 'Watched'})} : null}>Watched</Dropdown.Item>
                        <Dropdown.Item onClick={filter.watched !== 'Still to watch' ? () => {setFilter({public: filter.public, watched: 'Still to watch'})} : null}>Still to Watch</Dropdown.Item>  
                    </DropdownButton>
                </ButtonGroup>            
            </Col>  
        </Row>
        </Container>
        )
}

export default Filters