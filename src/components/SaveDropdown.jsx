import React from 'react';
import appStyles from '../App.module.css'
import { Button, Dropdown } from 'react-bootstrap';
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { useCurrentFilm } from '../contexts/CurrentFilmContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useSaveFilmContext } from '../contexts/SaveFilmContext';
import { useFilmPreview } from '../contexts/FilmPreviewContext';
import { FriendDataProvider } from '../contexts/FriendDataContext';
import DeleteModal from './DeleteModal';

/* 
Dropdown button used to save films via home page, reccomendations page or another users film list
Drowpdown expands and user has the option to save to public or private watchlist
When used on reccomendations page, DeleteModal is also rendered to remove the reccomendation
*/
const SaveDropown = () => {
    // Contexts
    const { currentUser } = useCurrentUser()
    const { omdbData, setCurrentFilmIds, currentReccomendation } = useCurrentFilm()
    const {savedToWatchlist, film, filmsPage, message} = useFilmPreview()
    const { saveFilm } = useSaveFilmContext()
    // useHistory
    const history = useHistory()

    // Save a film to a users watchlist
    const handleSave = (publicFilm) => {
        if (filmsPage){
            saveFilm(omdbData.Title, omdbData.imdbID, omdbData.Poster, omdbData.Year, omdbData.Type, publicFilm)
        } else {
            saveFilm(film.Title, film.imdbID, film.Poster, film.Year, film.Type, publicFilm)
        }
    }

    // Link to users own watchlist, sets currentFilmIds to make clicked on film appear first
    const goToWatchlist = () => {
        setCurrentFilmIds({
            imdbID: filmsPage ? omdbData.imdbID : film.imdbID, 
            database: filmsPage ? omdbData._id : film._id
        })
        history.push(`/films/${currentUser.user._id}`)
    }
    
    return (
        <>
            {!savedToWatchlist?
                <>
                    {/* IF NOT YET SAVED RETURN DROPDOWN WITH OPTIONS */}
                    <Dropdown>
                        <Dropdown.Toggle className={appStyles.roundButton} size="sm" variant="outline-secondary" id="dropdown-basic">
                            Save
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleSave(true)}>Save to Public Watchlist</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleSave(false)}>Save to Private Watchlist</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </>     
            :
                <>
                    {/* IF SAVED RETURN LINK TO WATCHLIST */}
                    <div className={appStyles.smallFont}>
                        <i className={`${appStyles.green} fa-solid fa-check`}></i> Saved
                        <Button className={`${appStyles.smallFont}`} onClick={goToWatchlist} variant="link" size="sm">Go to your watchlist</Button>        
                    </div>
                </>
            }
            {/* IF USED AS RECCOMENDATION ALSO INCLUDE DELETE MODAL */}  
            {message || currentReccomendation?.message ?
                <FriendDataProvider>
                    <DeleteModal 
                        confirmMessage={`Are you sure you want to remove ${film?.Title || omdbData.Title } from your reccomendations?`}
                    />
                </FriendDataProvider>
            :
                ''
            }           
        </>
    )
}

export default SaveDropown