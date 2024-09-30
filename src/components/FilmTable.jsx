import React from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const FilmTable = ({films}) => {
    const history = useHistory()
    return (
        <table>
            <tbody>
                {films.map(film =>
                    <tr key={film._id}>
                        <td>{`Title: ${film.title}, year: ${film.year}, watched: ${film.watched}, your rating: ${film.userRating}, your notes: ${film.notes} `}</td>
                        <td><img src={film.poster} alt={`Poster for ${film.title}`} /></td>
                        <td><button onClick={() => history.push(`/films/${film._id}`)}>Click to view details</button></td>
                    </tr>
                )}
            </tbody>
        </table>
    )
}

export default FilmTable