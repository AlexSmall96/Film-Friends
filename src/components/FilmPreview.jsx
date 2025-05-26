import React, { useEffect, useState } from 'react';
import {Alert, Col, Row, Spinner} from 'react-bootstrap'
import appStyles from '../App.module.css'
import styles from '../styles/FilmPreview.module.css'
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { useCurrentFilm } from '../contexts/CurrentFilmContext';
import { useFilmPreview } from '../contexts/FilmPreviewContext';
import useWindowDimensions from '../hooks/useWindowDimensions';
import SaveDropown from './SaveDropdown';
import { useSaveFilmContext } from '../contexts/SaveFilmContext';
import { useFilmSearchContext } from '../contexts/FilmSearchContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

// Displays film poster and preview of data either as a list of search results, saved films or reccomendations
const FilmPreview = () => {
    // Contexts
    const {film, showDropdown, filmsPage, mobile, smallScreen, message, sender, resultId, faded, shareModal, carousel } = useFilmPreview()
    const { setCurrentFilmIds, omdbData, setCurrentReccomendation } = useCurrentFilm()
    const { setSearch, setSubmitted, setSearchedViaCarousel } = useFilmSearchContext()
    const { setShowMainFilm } = useSaveFilmContext()
    // Hooks
    const { width } = useWindowDimensions()
    const history = useHistory()
    // Initialize variables
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

    // Set width of poster depending on screen width
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
            setPosterWidth(filmsPage ? 0.45 * width : shareModal? 0.3 * width : 0.5 * width)
        }
        if (shareModal && width >= 576){
            setPosterWidth(150)
        }
    }, [width, filmsPage, shareModal])


    // Click on preview to update main film based on film ids
    const handleClick = async () => {
        await setCurrentFilmIds({imdbID:film.imdbID, database:film._id})
        if (resultId) {
            setCurrentReccomendation({_id: resultId, message, sender})
        }
        if ((mobile || smallScreen) && !(faded || shareModal)) {
            setShowMainFilm(true) 
        }
        if (carousel){
            setSearch(film.Title)
            setSubmitted(current => !current)
            setSearchedViaCarousel(true)
        }
    }

    // Show plot when mouse is hovered
    const handleMouseEnter = () => {
        setHoveredOverImdbID(film.imdbID)
        setShowPlot(true)
    }

    const handleMouseLeave = () => {
        setShowPlot(false)
    }

    return (
        <Row onClick={filmsPage || mobile? handleClick : null}>
            {/* POSTER */}
            <Col md={filmsPage || shareModal? 12 : 6} sm={filmsPage || shareModal? 12: 4} xs={12} className={`${!shareModal? appStyles.noPadding: ''}`}>
                <img className={`${styles.filmPoster} ${faded? styles.faded : ''} ${carousel? styles.hoverCarousel: styles.hover}`} src={film.Poster}
                    height={posterWidth}
                    width={posterWidth}                         
                    onMouseEnter={!filmsPage && !mobile ? handleMouseEnter : null}
                    onMouseLeave={!filmsPage && !mobile ? handleMouseLeave : null}
                    alt={`Poster for ${film.Title}`}
                />
            </Col>
            {/* PLOT */}
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
                    {/* TITLE, GENRE, DIRECTOR AND YEAR */}
                    {!filmsPage && !message && !shareModal? 
                        <h5 className={`${mobile? `${appStyles.verySmallFont} ${appStyles.center} ${appStyles.smallPadding}`: appStyles.smallFont}`}>
                            {film.Title}
                        </h5>:''}
                    {!mobile && !filmsPage && !message?
                        <>
                            <p className={`${appStyles.smallFont} ${appStyles.grey}`}>{omdbString}</p>
                            <p className={`${appStyles.smallFont} ${appStyles.grey}`}>{filmsPage? film.Genre : '' }</p>                        
                        </>:''
                    }
                </>}
                {sender && message && !mobile && !showPlot? 
                <>
                {/* RECCOMENDATION MESSAGE */}
                <Alert variant='light' className={appStyles.verySmallFont}>
                    <a href='' onClick={() => history.push(`/films/${sender._id}`)}><strong>{sender.username}: </strong></a>{message}
                </Alert>

                </> :''}     
                {/* DROPDOWN BUTTON TO SAVE FILM */}
                {showDropdown && currentUser && !mobile? 
                    <SaveDropown />
                :''} 
            </Col>
        </Row>
    )
}

export default FilmPreview