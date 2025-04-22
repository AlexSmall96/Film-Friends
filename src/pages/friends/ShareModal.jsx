import React, {useState, useEffect} from 'react';
import { Button, Container, Row, Col, Dropdown, DropdownButton, Modal, Form, Spinner, ButtonGroup } from 'react-bootstrap';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useFriendData } from '../../contexts/FriendDataContext';
import appStyles from '../../App.module.css'
import FilmPreview from '../../components/FilmPreview';
import { FilmPreviewProvider } from '../../contexts/FilmPreviewContext';

/* 
Used to send reccomendations to other users.
User is selected on friends page, film is selected in modal body.
*/
const ShareModal = () => {
    // Contexts
    const { currentUser } = useCurrentUser()
    const { request } = useFriendData()
    const user = request.isSender? request.reciever : request.sender
    // Hooks
    const history = useHistory()
    // Initialize state variables
    const [films, setFilms] = useState([])
    const [allFilms, setAllFilms] = useState([])
    const [sort, setSort] = useState('Last Updated')
    const [message, setMessage] = useState("Hey! Check out this awesome film I've just watched. I think you'll love it! ")
    const [selectedFilm, setSelectedFilm] = useState(null)
    const [sent, setSent] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)
    const [updated, setUpdated] = useState(false)
    const [show, setShow] = useState(false);
    
    // Get current users films and reccomendations
    useEffect(() => {
        const fetchFilms = async () => {
            try {
                setHasLoaded(false)
                // Fetch users films to determine list of films to share
                const response = await axiosReq.get(`/films/${currentUser.user._id}/?sort=${sort}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                const publicFilms = response.data.films.filter(film => film.public)
                // Fetch users reccomendations to determine which films have already been shared
                const reccomendationsResponse = await axiosReq.get('/reccomendations', {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                const alreadyReccomendedFilms = reccomendationsResponse.data.filter(rec => rec.reciever.username === user.username)
                const alreadyReccomendedIds = alreadyReccomendedFilms.map(rec => rec.film.imdbID)
                setFilms(publicFilms.filter(film => !alreadyReccomendedIds.includes(film.imdbID)))
                setAllFilms(publicFilms)
                setHasLoaded(true)
            } catch (err) {
                console.log(err)
            }
        }
        if (show) {
            fetchFilms()
        }
    }, [currentUser, sort, updated, user.username, show])

    // Reset state variables for modal
    const handleShowModal = () => {
        setShow(true)
        setSent(false)
    }

    // Update selected film
    const handleFilmChange = (id) => {
        setSelectedFilm(films.filter(film => film._id === id)[0])
    }
    
    // Handle message change for custom message in form
    const handleMessageChange = (event) => {
        setMessage(event.target.value)
    }

    // Handle Send - share selected film with user
    const handleSend = async () => {
        try {
            setSent(false)
            await axiosReq.post('/reccomendations', {
                film: selectedFilm._id,
                sender: currentUser.user._id,
                reciever: user._id,
                message
            }, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            setUpdated(!updated)
            setSelectedFilm(null)
            setSent(true)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <> 
            {/* BUTTON TO SHOW MODAL */}
            <Button className={appStyles.roundButton} size='sm' variant="outline-secondary" onClick={handleShowModal}>
                <i className="fa-solid fa-clapperboard"></i> Share 
            </Button>   
            <Modal show={show} onHide={() => setShow(false)} className={appStyles.modal}>
                {/* MODAL HEADER */}
                <Modal.Header>
                    <Container>
                        <Row>
                            <Col>
                                <i className="fa-regular fa-user"></i> <strong>{user.username}</strong>
                            </Col>
                        </Row>
                        {selectedFilm? 
                        <Row>
                            <Col>
                                <i className="fa-solid fa-film"></i> <strong>{selectedFilm?.Title}</strong>
                            </Col>
                        </Row>:''}
                    </Container>
                </Modal.Header>
                {/* MODAL BODY */}  
                <Modal.Body>
                    {hasLoaded? 
                        allFilms.length?
                            <>
                                <Container>
                                    <Row>
                                        {/* FEEDBACK TO USER */}
                                        <p>
                                            {films.length? 
                                                sent? <><i className={`fa-solid fa-check ${appStyles.green}`}></i> Sent </> : ''
                                            :
                                            <>
                                                You've shared all your public films with {user.username}.
                                                <Button variant='link' href={`/films/${currentUser.user._id}`} >Update your films list</Button>
                                                    or
                                                <Button variant='link' href='/'>Browse more films.</Button>
                                            </>
                                            }
                                        </p>
                                        {/* LIST OF FILMS TO SELECT */}
                                        {films.length? (
                                            <DropdownButton variant='outline-secondary' size='sm' title={<><i className="fa-solid fa-sort"></i> {sort}</>}>
                                                <Dropdown.Item onClick={() => setSort('Last Updated')}>Last Updated</Dropdown.Item>
                                                <Dropdown.Item onClick={() => setSort('A-Z')}>A-Z</Dropdown.Item>
                                            </DropdownButton>
                                        ):('')}
                                        <div className={`${appStyles.modalFilmList} ${appStyles.list} ${appStyles.verticalMargin}`}>
                                            <Row>
                                                {films.map(
                                                    film => 
                                                        <Col md={4} xs={4} key={film._id} className={appStyles.noPadding} onClick={() => handleFilmChange(film._id)}>
                                                            <FilmPreviewProvider
                                                                key={film.imdbID} 
                                                                film={film}  
                                                                mobile={true}
                                                                shareModal
                                                            >
                                                                <FilmPreview />
                                                            </FilmPreviewProvider>
                                                        </Col>
                                                )}
                                            </Row>
                                        </div>                                     
                                        <Form className={appStyles.verticalMargin}>
                                            <Form.Label>Message:</Form.Label>
                                            <Form.Control as="textarea" className={`${appStyles.modalText} ${!selectedFilm? appStyles.grey : ''}`} readOnly={selectedFilm === null} value={message} onChange={handleMessageChange} />
                                        </Form>
                                    </Row>
                                </Container>
                            </>
                        :   
                            <>
                                {/* WHEN NO PUBLIC FILMS ARE FOUND, LINK TO WATCHLIST */}
                                You don't have any public films. 
                                <p>
                                    <Button onClick={() => history.push('/films')} variant='link'>Go to your watchlist</Button> to mark a film as public.
                                </p>
                            </>
                            
                    :
                        <Spinner />
                    }
                </Modal.Body>
                <Modal.Footer>
                    {/* MODAL BUTTONS */}
                    <ButtonGroup>
                        <Button variant="outline-secondary" className={appStyles.roundButton} onClick={() => setShow(false)}>
                            <i className="fa-solid fa-xmark"></i> Close
                        </Button>
                        <Button disabled={selectedFilm === null} className={appStyles.roundButton} variant="outline-secondary" onClick={handleSend}>
                            <i className="fa-solid fa-paper-plane"></i> {sent && !hasLoaded ? 'Sending...' : 'Send'}
                        </Button>
                    </ButtonGroup>
                </Modal.Footer>
            </Modal>       
        </> 
    )
}

export default ShareModal