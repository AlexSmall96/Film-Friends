import React, { useEffect, useState } from 'react';
import {Button, Row, Col, Image, Form, Dropdown} from 'react-bootstrap'
import IconRating from './IconRating';
import EllipsisMenu from './EllipsisMenu';
import styles from '../../styles/Films.module.css'
import appStyles from '../../App.module.css'
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const Film = ({omdbData, viewingData, setViewingData, isOwner, currentFilmIds, setCurrentFilmIds, username, saved, setUpdated, updated}) => {

    const ratingValues = [1, 2, 3, 4, 5]
    const { currentUser } = useCurrentUser()
    const history = useHistory()
    // Saves a film to users watchlist, can be called via the buttons for each film result
    const saveFilm = async (publicFilm) => {
        try {
            await axiosReq.post('/films', {
                Title: omdbData.Title, imdbID: omdbData.imdbID, Poster: omdbData.Poster, Year: omdbData.Year, Type: omdbData.Type, public: publicFilm
            }, {
                headers: {'Authorization': `Bearer ${currentUser.token}`}
            })
            setUpdated(!updated)
        } catch(err){
            console.log(err)
        }
    }

    // Updates a users rating, watched value, or public / private marking
    const updateViewingData = async (event, value, publicFilm) => {
        let reqObj, stateObj
        if (event) {
            reqObj = {watched: event.target.checked}
            stateObj = {watched: event.target.checked, userRating: viewingData.userRating, public: viewingData.public}
        } else if (value) {
            reqObj = {userRating: value}
            stateObj = {watched: viewingData.watched, userRating: value, public: viewingData.public}
        } else {
            reqObj = {public: publicFilm}
            stateObj = {watched: viewingData.watched, userRating: viewingData.userRating, public: publicFilm}
        }
        try {
            await axiosReq.patch(`/films/${currentFilmIds.database}`, reqObj, {headers: {'Authorization': `Bearer ${currentUser.token}`}} )
            setViewingData(stateObj)
        } catch(err) {
            console.log(err)
        }
    }
    

    return (
        <Row>
            <Col md={6}>
                <Image src={omdbData.Poster} width={200} />
            </Col>
            <Col md={6}>
                {isOwner?
                    <EllipsisMenu 
                        updateViewingData={updateViewingData} 
                        omdbData={omdbData} 
                        viewingData={viewingData} 
                        currentFilmIds={currentFilmIds} 
                        setCurrentFilmIds={setCurrentFilmIds}
                    />:''            
                }

                <p>{omdbData.Title}</p>
                <p>{omdbData.Plot}</p>
                <p>{omdbData.Director}, {omdbData.Runtime}</p>
                <p>
                    {omdbData.imdb? <IconRating index={0} value={omdbData.imdb} />: ''}
                    {omdbData.rt? <IconRating index={1} value={omdbData.rt} /> : ''}
                    {omdbData.mc? <IconRating index={2} value={omdbData.mc} /> : ''}
                </p>
                <Form>
                    {isOwner?
                        <Form.Check 
                            type='checkbox'
                            label='Watched'
                            checked={viewingData.watched || false}
                            disabled={!isOwner}
                            onChange={updateViewingData}
                        />                            
                    :''}
                    
                        {isOwner? ('Your Rating: '): viewingData.watched ? (`${username}'s Rating:`):''}
                        {isOwner || viewingData.watched ? ratingValues.map(
                            value => <span onClick={isOwner? () => updateViewingData(null, value):null} key={value} className={`fa fa-star ${viewingData.userRating >= value ? styles.checked : ''}`}></span>
                        ):''}
                        {/* SAVE / GO TO WATCHLIST BUTTONS IF NOT OWNER OF FILMS LIST */}
                        {!isOwner? 
                            !saved?
                            <Dropdown>
                                <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                                    Save to your watchlist
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                <Dropdown.Item onClick={() => saveFilm(true) }>Save to Public Watchlist</Dropdown.Item>
                                <Dropdown.Item onClick={() => saveFilm(false) }>Save to Private Watchlist</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        :
                        <>
                                <p className={`${appStyles.smallFont}`}><i className="fa-solid fa-check"></i> Saved</p>
                                <Button onClick={() => {
                                    history.push(`/films/${currentUser.user._id}`)
                                    setUpdated(!updated)
                                    }} className={appStyles.roundButton} variant="outline-secondary" size="sm">Go to watchlist</Button>                          
                        </> : ''}
                    
                </Form>
            </Col>
        </Row>
    )
}

export default Film