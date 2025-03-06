import React from 'react';
import {Button, Col, Dropdown, Row, Image, Form, Tooltip, OverlayTrigger} from 'react-bootstrap'
import appStyles from '../App.module.css'
import styles from '../styles/Films.module.css'
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { useCurrentFilm } from '../contexts/CurrentFilmContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import EllipsisMenu from '../pages/films/EllipsisMenu';
import IconRating from '../pages/films/IconRating';
import useWindowDimensions from '../hooks/useWindowDimensions';

// Displays film poster and data either as a list of search results, saved films or reccomendations
const FilmPreview = ({film, homePage, saveFilm, savedToWatchlist}) => {
    const { currentUser } = useCurrentUser()
    const history = useHistory()

    const handleSave = (publicFilm) => {
        saveFilm(film.Title, film.imdbID, film.Poster, film.Year, film.Type, publicFilm)
    }

    return (
        <Col md={4}>
            <Row>
                <Col md={6}>
                    <Image 
                        src={film.Poster} 
                        width={150}
                        thumbnail
                        fluid
                        />
                </Col>
                <Col md={6} className={appStyles.leftAlign}>
                    <h5 className={appStyles.smallFont}>{film.Title}</h5>
                    <p className={appStyles.smallFont}>{film.Year}, {film.Type}</p>
                    {homePage? 
                        !savedToWatchlist?
                            <Dropdown>
                            <Dropdown.Toggle className={appStyles.roundButton} size="sm" variant="outline-secondary" id="dropdown-basic">
                                Save
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleSave(true) }>Save to Public Watchlist</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleSave(false) }>Save to Private Watchlist</Dropdown.Item>
                            </Dropdown.Menu>
                            </Dropdown>
                        :
                            <>
                                <p className={`${appStyles.smallFont}`}><i className="fa-solid fa-check"></i> Saved</p>
                                <Button onClick={() => history.push(`/films/${currentUser.user._id}`)} className={appStyles.roundButton} variant="outline-secondary" size="sm">Go to watchlist</Button>
                            </>
                        
                    :''}
                </Col>
            </Row>

            
        </Col>
        
    )
}

export default FilmPreview