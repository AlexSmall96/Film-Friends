import React, {useState, useRef} from 'react';
import { Button, Col, Container, Row, Dropdown, DropdownButton, Spinner } from 'react-bootstrap';
import styles from '../styles/Films.module.css'
import appStyles from '../App.module.css'

const Filters = ({isOwner, filter, setFilter, sort, setSort, username, mobile, filteredFilms, title, setCurrentFilmIds, setViewingData }) => {
    return (
        <>
        <Row>
        {mobile? (
                <DropdownButton className={styles.filter}  variant='light' title={title}>
                    {filteredFilms.map(
                        film => 
                            <Dropdown.Item 
                                key={film._id} 
                                onClick={
                                    () => {
                                        setCurrentFilmIds({imdbID: film.imdbID, database: film._id})
                                        setViewingData({watched: film.watched, userRating: film.userRating})
                                    }
                                }
                            >
                                {film.Title}
                            </Dropdown.Item>
                    )}
                </DropdownButton>
            ) :('')}

        </Row>
        <Row>
            <Col xs={6} sm={4} md={12}>
            {isOwner? (
                
                    <DropdownButton className={styles.filter} variant='outline-secondary' title={`Your ${filter.public? 'Public': 'Private'} Watchlist`}>
                        <Dropdown.Item onClick={!filter.public ? () => setFilter({public: true, watched: filter.watched}): null}>Public</Dropdown.Item>
                        <Dropdown.Item onClick={filter.public ? () => setFilter({public: false, watched: filter.watched}): null}>Private</Dropdown.Item>
                    </DropdownButton>
                
            ):(
                `${username}'s Watchlist`
            )}
            </Col>
            <Col xs={6} sm={6} md={12}>
            <div style={{display: 'block', margin: '5px 0px 5px 0px'}}>
                <DropdownButton className={`${styles.filmSortButton} ${styles.filter} ${appStyles.smallFont}`} variant='outline-secondary' title={sort === 'title'? 'A-Z': 'Last updated'}>
                    <Dropdown.Item onClick={sort !== 'title' ? () => setSort('title'):null}>A-Z</Dropdown.Item>
                    <Dropdown.Item onClick={sort === 'title' ? () => setSort(null):null}>Last Updated</Dropdown.Item>
                </DropdownButton>
                <DropdownButton 
                className={`${styles.filmSortButton} ${styles.filter} ${appStyles.smallFont}`} variant='outline-secondary' title={filter.watched}>
                    <Dropdown.Item onClick={filter.watched !== 'All' ? () => {setFilter({public: filter.public, watched: 'All'})} : null}>All</Dropdown.Item>
                    <Dropdown.Item onClick={filter.watched !== 'Watched' ? () => {setFilter({public: filter.public, watched: 'Watched'})} : null}>Watched</Dropdown.Item>
                    <Dropdown.Item onClick={filter.watched !== 'Still to watch' ? () => {setFilter({public: filter.public, watched: 'Still to watch'})} : null}>Still to Watch</Dropdown.Item>  
                </DropdownButton>
            </div>
            </Col>
        </Row>

        </>
        )
}

export default Filters