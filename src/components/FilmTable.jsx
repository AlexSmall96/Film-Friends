import React from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from '../contexts/CurrentUserContext'

const FilmTable = ({films, setFilms, isOwner}) => {

    const history = useHistory()

    const { currentUser } = useCurrentUser()

    const handleDelete = async (id) => {
        try {
            await axiosReq.delete(`/films/${id}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            setFilms(films.filter(film => film._id !== id))
        } catch (err) {
            console.log(err)
        }
    }


    return (
        <table>
            <tbody>
                {films.map(film =>
                    <tr key={film._id}>
                        <td>{`Title: ${film.title}, year: ${film.year}, watched: ${film.watched}, your rating: ${film.userRating}, your notes: ${film.notes} `}</td>
                        <td><img src={film.poster} alt={`Poster for ${film.title}`} /></td>
                        <td><button onClick={() => history.push(`/films/${film._id}`)}>Click to view details</button></td>
                        {isOwner? <td><button onClick={() => handleDelete(film._id)}>Remove from watchlist</button></td>:('')}
                    </tr>
                )}
            </tbody>
        </table>
    )
}

export default FilmTable