import React from 'react';
import {Button, Col, Dropdown, Row, Image, Form} from 'react-bootstrap'
import appStyles from '../App.module.css'
import styles from '../styles/Films.module.css'
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { useCurrentFilm } from '../contexts/CurrentFilmContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import EllipsisMenu from './EllipsisMenu';
import IconRating from './IconRating';
import useWindowDimensions from '../hooks/useWindowDimensions';

// Displays film poster and data, either individually or as a list of search results/saved films 
const Film = ({ filmData, fullView, filmsPage, reccomendatonsPage, isOwner, username, saved }) => {
    
    // Hooks
    const { width } = useWindowDimensions();
    // Contexts
    const { currentUser } = useCurrentUser()
    const {setCurrentFilmIds, viewingData, setViewingData, omdbData, updateViewingData, saveFilm} = useCurrentFilm()
    const history = useHistory()
    const ratingValues = [1, 2, 3, 4, 5]

    // Define handle save function
    const saveToPublicList = 
        fullView?
            () => saveFilm(omdbData.Title, omdbData.imdbID, omdbData.Poster, omdbData.Year, omdbData.Type, true)
        : 
            () => saveFilm(filmData.Title, filmData.imdbID, filmData.Poster, filmData.Year, filmData.Type, true)
    const saveToPrivateList = 
        fullView?
            () => saveFilm(omdbData.Title, omdbData.imdbID, omdbData.Poster, omdbData.Year, omdbData.Type, false)
        :
            () => saveFilm(filmData.Title, filmData.imdbID, filmData.Poster, filmData.Year, filmData.Type, false)
    
    return (
        <Row onClick={
            !fullView && filmsPage? () => {
                setCurrentFilmIds({imdbID: filmData.imdbID, database: filmData._id})
                setViewingData({watched: viewingData.watched, userRating: viewingData.userRating})
            }:null
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
                    {fullView && isOwner? 
                    <EllipsisMenu /> : '' }
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
                            {isOwner ?
                                    <Form.Check 
                                        type='checkbox'
                                        label='Watched'
                                        checked={viewingData.watched || false}
                                        disabled={!isOwner}
                                        onChange={updateViewingData}
                                    />                            
                            :''}
                            <p>
                                {isOwner? ('Your Rating: '): viewingData.watched ? (`${username}'s Rating:`):''}
                                {isOwner || viewingData.watched ? ratingValues.map(
                                    value => <span onClick={isOwner? () => updateViewingData(null, value):null} key={value} className={`fa fa-star ${viewingData.userRating >= value ? styles.checked : ''}`}></span>
                                ):''}
                            </p>
                            {/* SAVE / GO TO WATCHLIST BUTTONS IF NOT OWNER OF FILMS LIST */}
                            {!isOwner? 
                             !saved?
                                <Dropdown>
                                <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                                    Save to your watchlist
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={saveToPublicList}>Save to Public Watchlist</Dropdown.Item>
                                    <Dropdown.Item onClick={saveToPrivateList}>Save to Private Watchlist</Dropdown.Item>
                                </Dropdown.Menu>
                                </Dropdown>
                            :
                            <>
                                <p className={appStyles.smallFont}><i className="fa-solid fa-check"></i> Saved to your watchlist</p>                           
                            </> : ''}
                        </Form>
                        </>
                    ):(
                        <>
                            <p>{`${filmData.Year}, ${filmData.Type}`}</p>
                            {(!filmsPage && !reccomendatonsPage ) && currentUser? (
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
                                        <Button variant='outline-secondary' onClick={() => history.push(`/films/${currentUser.user._id}`)}>Go to watchlist</Button>
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