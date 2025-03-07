import React from 'react';
import { Row, Col, Image, Form } from 'react-bootstrap'
import IconRating from './IconRating';
import EllipsisMenu from './EllipsisMenu';
import SaveDropown from '../../components/SaveDropdown';
import styles from '../../styles/Films.module.css'
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { useCurrentFilm } from '../../contexts/CurrentFilmContext';

const Film = ({isOwner, username, savedToWatchlist, setUpdated, updated}) => {

    const ratingValues = [1, 2, 3, 4, 5]
    const { currentUser } = useCurrentUser()
    const { currentFilmIds, viewingData, setViewingData, omdbData } = useCurrentFilm()
    
    // Saves a film to users watchlist, can be called via the buttons for each film result
    const saveFilm = async (Title, imdbID, Poster, Year, Type, publicFilm) => {
        try {
            await axiosReq.post('/films', {Title, imdbID, Poster, Year, Type, public: publicFilm}, {
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
                            <SaveDropown 
                                savedToWatchlist={savedToWatchlist} 
                                saveFilm={saveFilm}
                            />
                        : ''}
                </Form>
            </Col>
        </Row>
    )
}

export default Film