import React, { useEffect, useState } from 'react';
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
    const {film, showDropdown, filmsPage, mobile, smallScreen, setShowMainFilm} = useFilmPreview()
    const { setCurrentFilmIds, omdbData } = useCurrentFilm()
    const omdbStringArray = [film.Director, film.Year, film.Type]
    const omdbString = omdbStringArray.filter(value => value).join(', ')
    const { setHoveredOverImdbID, hasLoadedPlot } = useSaveFilmContext()
    const [showPlot, setShowPlot] = useState(false)
    const { currentUser } = useCurrentUser()
    
    useEffect(() => {
        if (mobile){
            setShowPlot(false)
        }
    }, [mobile])

    const handleClick = async () => {
        await setCurrentFilmIds({imdbID:film.imdbID, database:film._id})
        if (mobile || smallScreen) {
            setShowMainFilm(true) 
        }
    }

    const handleMouseEnter = () => {
        setHoveredOverImdbID(film.imdbID)
        setShowPlot(true)
    }

    const handleMouseLeave = () => {
        setShowPlot(false)
    }

    return (
            <Row onClick={filmsPage || mobile? handleClick : null}>
                <Col md={filmsPage? 12 : 6} sm={filmsPage? 12: 4} xs={12} className={`${appStyles.noPadding}`}>
                    <Image  
                        onMouseEnter={!filmsPage && !mobile ? handleMouseEnter : null}
                        onMouseLeave={!filmsPage && !mobile ? handleMouseLeave : null}
                        src={film.Poster} 
                        thumbnail
                        fluid   
                    />
                </Col>
                <Col md={filmsPage? 8 : 6} className={appStyles.leftAlign} sm={8} xs={12}>
                    {showPlot? 
                        hasLoadedPlot?
                            <p className={`${appStyles.smallFont} ${appStyles.paragraphFont}`}>
                                {omdbData.Plot}
                            </p>
                        : 
                            <Spinner />
                    :
                    <>
                        {!filmsPage? <h5 className={`${mobile? `${appStyles.verySmallFont} ${appStyles.center} ${appStyles.smallPadding}`: appStyles.smallFont}`}>{film.Title}</h5>:''}
                        {!mobile && !filmsPage?
                            <>
                                <p className={`${appStyles.smallFont} ${appStyles.grey}`}>{omdbString}</p>
                                <p className={`${appStyles.smallFont} ${appStyles.grey}`}>{filmsPage? film.Genre : '' }</p>                        
                            </>:''
                        }
                    </>}    
                    {showDropdown && currentUser && !mobile? 
                        <SaveDropown />
                    :''}                 
                </Col>
            </Row>
    )
}

export default FilmPreview