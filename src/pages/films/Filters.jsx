import React, {useState, useRef} from 'react';
import { Button, Col, Container, Row, Dropdown, DropdownButton, Spinner, ButtonGroup } from 'react-bootstrap';
import styles from '../../styles/Films.module.css'
import appStyles from '../../App.module.css'
import { useCurrentFilm } from '../../contexts/CurrentFilmContext';

const Filters = ({ filter, setFilter, sort, setSort }) => {
    const {isOwner, username} = useCurrentFilm()
    return (
        <Container fluid>
        <Row>
            <Col xl={6} lg={12} md={12} sm={6} xs={6}>
                {isOwner? ( 
                        <DropdownButton size="md" className={appStyles.verticalMargin} style={{width: '100%'}} variant='outline-secondary' title={`Your ${filter.public? 'Public': 'Private'} Watchlist`}>
                            <Dropdown.Item onClick={!filter.public ? () => setFilter({public: true, watched: filter.watched}): null}>Public</Dropdown.Item>
                            <Dropdown.Item onClick={filter.public ? () => setFilter({public: false, watched: filter.watched}): null}>Private</Dropdown.Item>
                        </DropdownButton>
                    
                ):(
                    `${username}'s Watchlist`
                )}            
            </Col>
            <Col xl={6} lg={12} md={12} sm={6} xs={6}>
                <ButtonGroup>
                    <DropdownButton 
                        as={ButtonGroup} 
                        size="md" 
                        className={`${appStyles.verticalMargin}`} 
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
                        size="md"
                        className={`${appStyles.verticalMargin}`} 
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