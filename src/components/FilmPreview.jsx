import React, { useState } from 'react';
import {Button, Col, Dropdown, Row, Image, Tooltip, OverlayTrigger, Spinner} from 'react-bootstrap'
import appStyles from '../App.module.css'
import styles from '../styles/Films.module.css'
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { useCurrentFilm } from '../contexts/CurrentFilmContext';
import { useFilmPreview } from '../contexts/FilmPreviewContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import useWindowDimensions from '../hooks/useWindowDimensions';
import SaveDropown from './SaveDropdown';
import { useSaveFilmContext } from '../contexts/SaveFilmContext';

// Displays film poster and data either as a list of search results, saved films or reccomendations
const FilmPreview = () => {
    const {film, showDropdown, filmsPage} = useFilmPreview()
    const { setCurrentFilmIds, omdbData } = useCurrentFilm()
    const { setHoveredOverImdbID, hasLoadedPlot } = useSaveFilmContext()
    const [showPlot, setShowPlot] = useState(false)
    const [width, setWidth] = useState(150)
    const { currentUser } = useCurrentUser()
    const handleClick = () => {
        setCurrentFilmIds({imdbID:film.imdbID, database:film._id})
    }

    const handleMouseEnter = () => {
        setHoveredOverImdbID(film.imdbID)
        setShowPlot(true)
    }

    const handleMouseLeave = () => {
        setShowPlot(false)
    }

    return (
            <Row onClick={filmsPage? handleClick : null}>
                <Col md={6} sm={4} xs={4}>
                    <Image
                        onMouseEnter={! filmsPage ? handleMouseEnter : null}
                        onMouseLeave={! filmsPage ? handleMouseLeave : null}
                        src={film.Poster} 
                        width={width}
                        thumbnail
                        fluid
                    />
                </Col>
                <Col md={6} className={appStyles.leftAlign} sm={8} xs={8}>

                    {showPlot? 
                        hasLoadedPlot?
                            <p className={appStyles.smallFont}>
                                <em>{omdbData.Plot}</em>
                            </p>
                        : 
                            <Spinner />
                    :
                    <>
                        <h5 className={appStyles.smallFont}>{film.Title}</h5>
                        <p className={appStyles.smallFont}>{filmsPage? film.Director + ', ' : ''} {film.Year}, {film.Type}</p>
                        <p className={appStyles.smallFont}>{filmsPage? film.Genre : '' }</p>
                    </>}    
                    {showDropdown && currentUser? 
                        <SaveDropown />
                    :''}                 
                
                

                </Col>
            </Row>
    )
}

export default FilmPreview