import React, { useEffect, useState } from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { Container, Image, Row, Col, Button, Tooltip, OverlayTrigger, ButtonGroup, DropdownButton, Dropdown, Spinner, Toast, Card} from 'react-bootstrap';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import sortBy from 'array-sort-by'
import DeleteModal from '../../components/DeleteModal'
import ResultsPagination from '../../components/ResultsPagination';
import { FriendDataProvider } from '../../contexts/FriendDataContext';
import { useCurrentFilm } from '../../contexts/CurrentFilmContext';
import { useSaveFilmContext } from '../../contexts/SaveFilmContext';
import { FilmPreviewProvider } from '../../contexts/FilmPreviewContext';
import FilmPreview from '../../components/FilmPreview';
import { useRedirect } from '../../hooks/useRedirect';
import styles from '../../styles/Reccomendations.module.css'
import appStyles from '../../App.module.css'

const Reccomendations = () => {
    useRedirect()
    const {currentUser} = useCurrentUser()
    const {setCurrentFilmIds} = useCurrentFilm()
    const { updated } = useSaveFilmContext()
    const history = useHistory()
    const [reccomendations, setReccomendations] = useState([])
    const [filter, setFilter] = useState('All')
    const [usernames, setUsernames] = useState([])
    const [sort, setSort] = useState('Last Sent')
    const [hasLoaded, setHasLoaded] = useState(false)
    const [hasUpdated, setHasUpdated] = useState(true)
    const [deleted, setDeleted] = useState(false)
    const [filmIds, setFilmIds] = useState([])
    const [showMainFilm, setShowMainFilm] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [finalPage, setFinalPage] = useState(1)

    useEffect(() => {
        const fetchReccomendations = async () => {
            const response = await axiosReq.get(`/reccomendations/`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            const allReccomendations = response.data.filter(rec => !rec.isSender)
            const filteredReccomendations = allReccomendations.filter(rec => filter === 'All' ? true : rec.sender.username === filter)
            const sortedReccomendations = sort === 'Film Title' ? sortBy(filteredReccomendations, (rec) => rec.film.Title) : filteredReccomendations
            setReccomendations(sortedReccomendations.slice(9 * (currentPage - 1), 9 * currentPage))
            setFinalPage(
                Math.ceil(0.1 * sortedReccomendations.length)
            )   
            const allUsernames = allReccomendations.map(rec => rec.sender.username)
            setUsernames([...new Set(allUsernames)])
            setHasLoaded(true)
            setHasUpdated(true)
        }
        fetchReccomendations()
    }, [filter, sort, currentUser.token, deleted, currentPage])

    useEffect(() => {
        setHasUpdated(false) 
    }, [filter, sort])

    const deleteReccomendation = async (id) => {
        try {
            await axiosReq.delete(`/reccomendations/${id}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            setDeleted(!deleted)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        // Gets the imdbIds of the users saved films, to determine which buttons should appear next to film result
        const fetchFilmIds = async () => {
            if (!currentUser) {
                return null
            }
            try {
                const response = await axiosReq.get(`/films/${currentUser.user._id}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                setFilmIds(response.data.films.map(film => film.imdbID))
            } catch (err) {
                console.log(err)
            }
        }
        fetchFilmIds()
    }, [currentUser, updated])

    return (
        <>
            {hasLoaded? 
                reccomendations.length? 
                <>  
                    <div className={styles.wrapper}>   
                        <div className={styles.filterComponents}>                    
                            <ButtonGroup className={appStyles.bigVerticalMargin}>
                                <DropdownButton as={ButtonGroup} variant='outline-secondary' title={<><i className="fa-solid fa-filter"></i> {filter}</>}>
                                    <Dropdown.Item onClick={() => setFilter('All')}>All</Dropdown.Item>
                                        {usernames.map(username => 
                                            <Dropdown.Item key={username} onClick={() => setFilter(username)}>{username}</Dropdown.Item>
                                        )}
                                    </DropdownButton> 
                                <DropdownButton as={ButtonGroup} variant='outline-secondary' title={<><i className="fa-solid fa-sort"></i> {sort}</>}>
                                    <Dropdown.Item onClick={() => setSort('Film Title')}>Film Title</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setSort('Last Sent')}>Last Sent</Dropdown.Item>
                                </DropdownButton>
                            </ButtonGroup>
                            {/* PAGINATION MESSAGE */}
                            <p>
                                {currentPage !== finalPage ? (
                                    `Showing results ${9 * (currentPage - 1) + 1} to ${9 * (currentPage - 1) + 9} of ${9 * finalPage}`
                                ):(
                                    `Showing results ${9 * (currentPage - 1) + 1} to ${9 * finalPage} of ${9 * finalPage}`
                                )}
                            </p>
                            {/* PAGINATION BUTTONS */}
                            {finalPage > 1 ? 
                                <ResultsPagination currentPage={currentPage} finalPage={finalPage} setCurrentPage={setCurrentPage}/>                       
                            : '' } 
                        </div> 
                    </div> 
                    <div className={styles.recResults}>
                        <Row>
                        {reccomendations.map(rec =>
                            <Col md={4} key={rec.film.imdbID}>
                                <FilmPreviewProvider 
                                    film={rec.film} 
                                    showDropdown
                                    savedToWatchlist={filmIds.includes(rec.film.imdbID)} 
                                >  
                                <Row>
                                    <Col md={1}>
                                        <Image src={rec.sender.image} width={30}/>
                                    </Col>
                                    <Col md={10}>
                                        <p className={appStyles.verySmallFont}>{rec.message}</p> 
                                    </Col>
                                    <Col md={1}>
                                        <i className="fa-solid fa-trash-can"></i>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <FilmPreview />
                                    </Col>
                                </Row>

                                </FilmPreviewProvider>                            
                            </Col>
     
                        )}
                        </Row>
                        </div>
                </>
                :'No reccomendations'
            :
                <Spinner />
            }
            </>
    )
}

export default Reccomendations;