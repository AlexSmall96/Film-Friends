import { createContext, useContext, useState } from 'react';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from './CurrentUserContext';

const SaveFilmContext = createContext();

export const SaveFilmProvider = ({ children }) => {

    const [updated, setUpdated] = useState(false)
    const {currentUser} = useCurrentUser()

    const saveFilm = async (Title, imdbID, Poster, Year, Type, publicFilm) => {
        try {
            await axiosReq.post('/films', {Title, imdbID, Poster, Year, Type, public: publicFilm}, {
                headers: {'Authorization': `Bearer ${currentUser.token}`}
            })
            setUpdated(!updated)
        } catch(err){
            console.log(err)
        }
    }

    return (
        <SaveFilmContext.Provider value={{saveFilm, updated, setUpdated}}>
            {children}
        </SaveFilmContext.Provider>
    );
};

export const useSaveFilmContext = () => useContext(SaveFilmContext);