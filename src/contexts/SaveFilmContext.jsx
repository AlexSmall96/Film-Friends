import { createContext, useContext, useState, useEffect } from 'react';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from './CurrentUserContext';
import { useCurrentFilm } from './CurrentFilmContext';

const SaveFilmContext = createContext();

export const SaveFilmProvider = ({ children }) => {

    const [updated, setUpdated] = useState(false)
    const {currentUser} = useCurrentUser()
    const {setOmdbData} = useCurrentFilm()
    const [hasLoadedPlot, setHasLoadedPlot] = useState(false)
    const [hoveredOverImdbID, setHoveredOverImdbID] = useState('')

    const saveFilm = async (Title, imdbID, Poster, Year, Type, publicFilm) => {
        // Get director and genre from OMDB API
        try {
            const response = await axiosReq.get(`filmData/?imdbID=${imdbID}`)
            const Director = response.data.Director
            const Genre = response.data.Genre
            await axiosReq.post('/films', {Title, imdbID, Poster, Year, Type, Director, Genre, public: publicFilm}, {
                headers: {'Authorization': `Bearer ${currentUser.token}`}
            })
            setUpdated(!updated)
        } catch(err){
            console.log(err)
        }
    }

    useEffect(() => {   
        // Get individual film data from OMDB API for main view
        const getOMDBData = async () => {
            try {
                setHasLoadedPlot(false)
                const response = await axiosReq.get(`/filmData/?imdbID=${hoveredOverImdbID}`)
                setOmdbData(response.data)
                setHasLoadedPlot(true)
            } catch (err) {
                console.log(err)
            }
        }
        getOMDBData()
    }, [hoveredOverImdbID])
           
    return (
        <SaveFilmContext.Provider value={{saveFilm, updated, setUpdated, hasLoadedPlot, setHoveredOverImdbID}}>
            {children}
        </SaveFilmContext.Provider>
    );
};

export const useSaveFilmContext = () => useContext(SaveFilmContext);