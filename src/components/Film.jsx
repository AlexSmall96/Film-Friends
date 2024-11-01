import React, {useState, useRef} from 'react';
import {Button, Col, Dropdown, Row, Image, Overlay, OverlayTrigger, Tooltip, Form} from 'react-bootstrap'
import appStyles from '../App.module.css'
import styles from '../styles/Films.module.css'
import { useCurrentUser } from '../contexts/CurrentUserContext';
import EllipsisMenu from './EllipsisMenu';
import IconRating from './IconRating';
// Displays film poster and data, either individually or as a list of search results/saved films 
const Film = ({
    film,
    rating,
    watched,
    saveFilm, 
    history,  
    saved, 
    fullView,
    selected,
    handleFilmChange,
    handleWatchedChange,
    handleRatingChange,
    handlePublicChange,
    handleDelete,
    handleShare,
    publicFilm,
    isOwner,
    filmsPage
}) => {
    const { currentUser } = useCurrentUser()
    const ratings = [1, 2, 3, 4, 5]
    // Define handle save function
    const saveToPublicList = () => saveFilm(film.Title, film.imdbID, film.Poster, film.Year, film.Type, true)
    const saveToPrivateList = () => saveFilm(film.Title, film.imdbID, film.Poster, film.Year, film.Type, false)

    return (
        <Row onClick={!fullView && filmsPage? () => handleFilmChange(film, null) : null} className={!fullView && filmsPage? styles.filmRow: ''} style={{padding: '2px', textAlign: 'left', backgroundColor: selected? 'lightgrey':'' }}>
            {/* FILM POSTER */}
            <Col sm={4}>
                <Image 
                    key={film.imdbID} 
                    src={film.Poster !== 'N/A'? film.Poster : 'https://res.cloudinary.com/dojzptdbc/image/upload/v1726945998/default-movie_uajvdm.png'} 
                    width={fullView? 800: 100} 
                    thumbnail
                    className={`${selected? styles.selected : !fullView && filmsPage? styles.unselected: ''}`}
                    
                />
            </Col>
            {/* FILM INFO */}
            <Col sm={8}>   
                <h5>
                    {film.Title}
                    {fullView?(
                        <EllipsisMenu handleDelete={handleDelete} publicFilm={publicFilm} handlePublicChange={handlePublicChange} handleShare={handleShare} />
                    ):('')}
                </h5>
                {fullView? 
                    (
                        <>
                            <p>{`${film.Director !== 'N/A'? film.Director + ', ' : ''}${film.Year}, ${film.Type}`}</p>
                            <p className={appStyles.smallFont}>{film.Plot}</p>
                            <p>{film.Runtime !== 'N/A'? film.Runtime : ''}</p>
                            <p>
                                {film.imdb? <IconRating index={0} value={film.imdb} />: ''}
                                {film.rt? <IconRating index={1} value={film.rt} /> : ''}
                                {film.mc? <IconRating index={2} value={film.mc} /> : ''}
                            </p>
                            <Form>
                            <Form.Check 
                                type='checkbox'
                                label='Watched'
                                onChange={handleWatchedChange}
                                checked={watched}
                                disabled={!isOwner}
                            />
                            <p>
                                {isOwner? ('Your Rating: '):(`${currentUser.user.username}'s Rating:`)}
                                {ratings.map(
                                    i => <span key={i} className={`fa fa-star ${rating >= i ? styles.checked : ''}`} onClick={isOwner? () => handleRatingChange(i) : null}></span>
                                )}
                            </p>
                        </Form>
                        </>
                    ):(
                        <>
                            <p>{`${film.Year}, ${film.Type}`}</p>
                            {!filmsPage && currentUser? (
                                !saved? (
                                    <>
                                        {/* SAVE / GO TO WATCHLIST BUTTONS */}
                                        <Dropdown>
                                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                                                Save
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={saveToPublicList}>Save to Public Watchlist</Dropdown.Item>
                                                <Dropdown.Item onClick={saveToPrivateList}>Save to Private Watchlist</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </>
                                ):(
                                    <>
                                        <p className={appStyles.smallFont}><i className="fa-solid fa-check"></i> Saved</p>
                                        <Button  variant='outline-secondary' onClick={() => history.push(`/films/${currentUser.user._id}`)}>Go to watchlist</Button>
                                    </>
                                )
                            ):('')}
                        </>
                    )
                }

            </Col>
        </Row>
    )
}

export default Film