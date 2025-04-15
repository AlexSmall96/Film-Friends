import React, { useEffect, useState } from 'react';
import {Alert, Col, Row, Spinner} from 'react-bootstrap'
import appStyles from '../App.module.css'
import styles from '../styles/Films.module.css'
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { useCurrentFilm } from '../contexts/CurrentFilmContext';
import { useFilmPreview } from '../contexts/FilmPreviewContext';
import useWindowDimensions from '../hooks/useWindowDimensions';
import SaveDropown from './SaveDropdown';
import { useSaveFilmContext } from '../contexts/SaveFilmContext';

// Displays film poster and data either as a list of search results, saved films or reccomendations
const FilmPreview = () => {
    const {film, showDropdown, filmsPage, mobile, smallScreen, setShowMainFilm, message, sender, resultId } = useFilmPreview()
    const { width } = useWindowDimensions()
    const { setCurrentFilmIds, omdbData, setCurrentReccomendation } = useCurrentFilm()
    const omdbStringArray = [film.Director, film.Year, film.Type]
    const omdbString = omdbStringArray.filter(value => value).join(', ')
    const { setHoveredOverImdbID, hasLoadedPlot } = useSaveFilmContext()
    const [showPlot, setShowPlot] = useState(false)
    const { currentUser } = useCurrentUser()
    const [posterWidth, setPosterWidth] = useState(250)

    useEffect(() => {
        if (mobile){
            setShowPlot(false)
        }
    }, [mobile])

    useEffect(() => {
        if (width >= 1400){
            setPosterWidth(filmsPage ? 250 : 350)
        }
        if (width < 1400){
            setPosterWidth(filmsPage ? 200 : 300)
        }
        if (width < 1200){
            setPosterWidth(filmsPage ? 170 : 250)
        }
        if (width < 992){
            setPosterWidth(filmsPage ? 150 : 280)
        }
        if (width < 768){
            setPosterWidth(filmsPage ? 250 : 300)
        }
        if (width < 576){
            setPosterWidth(filmsPage ? 0.45 * width : 0.5 * width)
        }
    }, [width])


    const handleClick = async () => {
        await setCurrentFilmIds({imdbID:film.imdbID, database:film._id})
        if (resultId) {
            setCurrentReccomendation({_id: resultId, message, sender})
        }
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
                    <img className={appStyles.filmPoster} src={film.Poster}
                        height={posterWidth}
                        width={posterWidth}                         
                        onMouseEnter={!filmsPage && !mobile ? handleMouseEnter : null}
                        onMouseLeave={!filmsPage && !mobile ? handleMouseLeave : null}
                    />
                </Col>
                <Col md={filmsPage? 8 : 6} className={appStyles.leftAlign} sm={8} xs={12}>
                    {showPlot? 
                        hasLoadedPlot?
                            <p className={`${appStyles.smallFont} ${appStyles.paragraphFont} ${width < 1200 ? styles.plotPreview: ''}`}>
                                {omdbData.Plot}
                            </p>
                        : 
                            <Spinner />
                    :
                    <>
                        {!filmsPage && !message? <h5 className={`${mobile? `${appStyles.verySmallFont} ${appStyles.center} ${appStyles.smallPadding}`: appStyles.smallFont}`}>{film.Title}</h5>:''}
                        {!mobile && !filmsPage && !message?
                            <>
                                <p className={`${appStyles.smallFont} ${appStyles.grey}`}>{omdbString}</p>
                                <p className={`${appStyles.smallFont} ${appStyles.grey}`}>{filmsPage? film.Genre : '' }</p>                        
                            </>:''
                        }
                    </>}
                    {sender && message && !mobile && !showPlot? 
                    <>
                    
                    <Alert variant='light' className={appStyles.verySmallFont}>
                        <strong>{sender.username}: </strong>{message}
                    </Alert>

                    </> :''}     
                    {showDropdown && currentUser && !mobile? 
                        <SaveDropown />
                    :''} 
                </Col>
            </Row>
    )
}

export default FilmPreview