import React, {useState, useRef} from 'react';
import {Button, Col, Dropdown, Row, Image, Overlay, OverlayTrigger, Tooltip, Form} from 'react-bootstrap'
import appStyles from '../App.module.css'
import styles from '../styles/Films.module.css'
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import EllipsisMenu from './EllipsisMenu';
import IconRating from './IconRating';
import useWindowDimensions from '../hooks/useWindowDimensions';

// Displays film poster and data, either individually or as a list of search results/saved films 
const Film = ({ 
    filmData, 
    fullView, 
    filmsPage, 
    isOwner, 
    username, 
    saveFilm, 
    saved, 
    omdbData, 
    viewingData,
    updateViewingData, 
    setCurrentFilmIds, 
    setViewingData,
    handleDelete, 
    handleShare, 
    }) => {

    const { height, width } = useWindowDimensions();
    const { currentUser } = useCurrentUser()
    const history = useHistory()
    const ratingValues = [1, 2, 3, 4, 5]
    // Define handle save function
    const saveToPublicList = () => saveFilm(filmData.Title, filmData.imdbID, filmData.Poster, filmData.Year, filmData.Type, true)
    const saveToPrivateList = () => saveFilm(filmData.Title, filmData.imdbID, filmData.Poster, filmData.Year, filmData.Type, false)

    return (
        <Row onClick={
            !fullView? () => {
                setCurrentFilmIds({imdbID: filmData.imdbID, database: filmData._id})
                setViewingData({watched: filmData.watched, userRating: filmData.userRating})
            }: null
            } className={!fullView && filmsPage? styles.filmRow: ''} style={{padding: '2px', textAlign: 'left'}}>
            {/* FILM POSTER */}
            <Col sm={4}>
                <Image 
                    key={fullView? omdbData.imdbID: filmData.imdbID} 
                    src={
                        fullView? 
                            omdbData.Poster !== 'N/A'? omdbData.Poster : 'https://res.cloudinary.com/dojzptdbc/image/upload/v1726945998/default-movie_uajvdm.png'
                        : 
                            filmData.Poster !== 'N/A'? filmData.Poster : 'https://res.cloudinary.com/dojzptdbc/image/upload/v1726945998/default-movie_uajvdm.png'
                    } 
                    width={fullView? (width > 599? 800:300): 100} 
                    thumbnail
                />
            </Col>
            {/* FILM INFO */}
            <Col sm={8}>   
                <h5 className={fullView? appStyles.bold: appStyles.medium}>
                    {fullView? omdbData.Title : filmData.Title}
                    {fullView && isOwner? <EllipsisMenu handleDelete={handleDelete} handleShare={handleShare} updateViewingData={updateViewingData} viewingData={viewingData} /> : '' }
                </h5>
                {fullView? 
                    (
                        <>
                            <p>{`${omdbData.Director !== 'N/A'? omdbData.Director + ', ' : ''}${omdbData.Year}, ${omdbData.Type}`}</p>
                            <p className={appStyles.smallFont}>{omdbData.Plot}</p>
                            <p>{omdbData.Runtime !== 'N/A'? omdbData.Runtime : ''}</p>
                            <p>
                                {omdbData.imdb? <IconRating index={0} value={omdbData.imdb} />: ''}
                                {omdbData.rt? <IconRating index={1} value={omdbData.rt} /> : ''}
                                {omdbData.mc? <IconRating index={2} value={omdbData.mc} /> : ''}
                            </p>
                            <Form>
                            <Form.Check 
                                type='checkbox'
                                label='Watched'
                                checked={filmData.watched || false}
                                disabled={!isOwner}
                                onChange={updateViewingData}
                            />
                            <p>
                                {isOwner? ('Your Rating: '):(`${username}'s Rating:`)}
                                {ratingValues.map(
                                    value => <span onClick={isOwner? () => updateViewingData(null, value):null} key={value} className={`fa fa-star ${filmData.userRating >= value ? styles.checked : ''}`}></span>
                                )}
                            </p>
                        </Form>
                        </>
                    ):(
                        <>
                            <p>{`${filmData.Year}, ${filmData.Type}`}</p>
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