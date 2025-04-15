import React from 'react';
import { Row, Col, Image, Form } from 'react-bootstrap'
import IconRating from './IconRating';
import EllipsisMenu from './EllipsisMenu';
import SaveDropown from '../../components/SaveDropdown';
import styles from '../../styles/Film.module.css'
import appStyles from '../../App.module.css'
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { useCurrentFilm } from '../../contexts/CurrentFilmContext';
import { useSaveFilmContext } from '../../contexts/SaveFilmContext';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const Film = () => {
    const extraBP = 550
    const ratingValues = [1, 2, 3, 4, 5]
    const { currentUser } = useCurrentUser()
    const { currentFilmIds, viewingData, setViewingData, omdbData, isOwner, username } = useCurrentFilm()
    const { setUpdated } = useSaveFilmContext()
    const { width } = useWindowDimensions()
    const omdbStringArray = [omdbData.Director, omdbData.Year, omdbData.Runtime]
    const omdbString = omdbStringArray.filter(value => value && value !== 'N/A').join(', ')
    const Poster = omdbData.Poster !== 'N/A'? omdbData.Poster: 'https://res.cloudinary.com/dojzptdbc/image/upload/v1726945998/default-movie_uajvdm.png'
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
            setUpdated(current => !current)
        } catch(err) {
            console.log(err)
        }
    }
    
    return (
        <>
        <Row>
            <Col md={6} xs={5}>
                <Image src={Poster} thumbnail fluid />
            </Col>
            <Col md={6} xs={7} className={appStyles.leftAlign}>
                {isOwner?
                    <EllipsisMenu 
                        updateViewingData={updateViewingData} 
                    />:''            
                }
                <h5>{omdbData.Title}</h5>
                {width > extraBP && omdbData.Plot !== 'N/A'? <p className={appStyles.paragraphFont}>{omdbData.Plot}</p>:''}
                <p className={`${appStyles.grey} ${appStyles.smallFont}`}>
                    {omdbString}
                <br />
                
                    {omdbData.Genre}
                </p>
                <p>
                    {omdbData.imdb? <IconRating index={0} value={omdbData.imdb} /> : ''}
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
                            value => <span onClick={isOwner? () => updateViewingData(null, value):null} key={value} className={`fa fa-star ${viewingData.userRating >= value ? styles.checked : styles.unchecked}`}></span>
                        ):''}
                        {/* SAVE / GO TO WATCHLIST BUTTONS IF NOT OWNER OF FILMS LIST */}
                        {!isOwner? 
                            <SaveDropown />
                        : ''}
                </Form>
            </Col>
        </Row>
            {width <= extraBP?
                <Row>
                    <p className={`${appStyles.verticalMargin} ${appStyles.leftAlign} ${appStyles.paragraphFont}`}>{omdbData.Plot || ''}</p>
                </Row>:''
            }
        </>
    )
}

export default Film