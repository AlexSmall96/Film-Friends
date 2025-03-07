import React from 'react';
import {Button, Col, Dropdown, Row, Image} from 'react-bootstrap'
import appStyles from '../App.module.css'
import styles from '../styles/Films.module.css'
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { useCurrentFilm } from '../contexts/CurrentFilmContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import useWindowDimensions from '../hooks/useWindowDimensions';
import SaveDropown from './SaveDropdown';

// Displays film poster and data either as a list of search results, saved films or reccomendations
const FilmPreview = ({film, showDropdown, saveFilm, handleClick, savedToWatchlist}) => {
    return (
            <Row onClick={handleClick ?? null}>
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
                    {showDropdown? 
                        <SaveDropown saveFilm={saveFilm} film={film} savedToWatchlist={savedToWatchlist} />
                    :''}
                </Col>
            </Row>
    )
}

export default FilmPreview