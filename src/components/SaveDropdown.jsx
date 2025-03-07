import React from 'react';
import appStyles from '../App.module.css'
import { Button, Dropdown } from 'react-bootstrap';
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { useCurrentFilm } from '../contexts/CurrentFilmContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const SaveDropown = ({savedToWatchlist, saveFilm}) => {
    const { currentUser } = useCurrentUser()
    const { omdbData } = useCurrentFilm()
    const history = useHistory()

    const handleSave = (publicFilm) => {
        saveFilm(omdbData.Title, omdbData.imdbID, omdbData.Poster, omdbData.Year, omdbData.Type, publicFilm)
    }

    const goToWatchlist = () => {
        history.push(`/films/${currentUser.user._id}`)
    }
    
    return (
        <>
            {!savedToWatchlist?
                <Dropdown>
                    <Dropdown.Toggle className={appStyles.roundButton} size="sm" variant="outline-secondary" id="dropdown-basic">
                        Save
                    </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleSave(true)}>Save to Public Watchlist</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSave(false)}>Save to Private Watchlist</Dropdown.Item>
                </Dropdown.Menu>
                </Dropdown>        
            :
                <>
                    <p className={`${appStyles.smallFont}`}><i className="fa-solid fa-check"></i> Saved</p>
                    <Button onClick={goToWatchlist} className={appStyles.roundButton} variant="outline-secondary" size="sm">Go to your watchlist</Button>        
                </> 
            }
        </>
        

    )
}

export default SaveDropown