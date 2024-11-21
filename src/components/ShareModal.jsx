import React, {useState, useEffect} from 'react';
import { Button, Dropdown, DropdownButton, Modal, Form, Image, Tooltip, OverlayTrigger, Spinner } from 'react-bootstrap';
import User from './User';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from '../contexts/CurrentUserContext';

const ShareModal = ({user}) => {
    const { currentUser } = useCurrentUser()
    const [films, setFilms] = useState([])
    const [allFilms, setAllFilms] = useState([])
    const [sort, setSort] = useState('Last Updated')
    const [message, setMessage] = useState("Hey! Check out this awesome film I've just watched. I think you'll love it! ")
    const [feedback, setFeedback] = useState('')
    const [selectedFilm, setSelectedFilm] = useState(null)
    const [reccomendations, setReccomendations] = useState([])
    const [updated, setUpdated] = useState(false)
    const [sent, setSent] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)

    useEffect(() => {
        const fetchFilms = async () => {
            try {
                const response = await axiosReq.get(`/films/${currentUser.user._id}/?sort=${sort}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                const publicFilms = response.data.films.filter(film => film.public)
                const reccomendationsResponse = await axiosReq.get('/reccomendations', {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                const alreadyReccomendedFilms = reccomendationsResponse.data.fullReccomendations.filter(rec => rec.reciever.username === user.username)
                const alreadyReccomendedIds = alreadyReccomendedFilms.map(rec => rec.film.imdbID)
                setFilms(publicFilms.filter(film => !alreadyReccomendedIds.includes(film.imdbID)))
                setAllFilms(publicFilms)
                setHasLoaded(true)
            } catch (err) {
                console.log(err)
            }
        }
        fetchFilms()
    }, [currentUser, sort, updated, user.username])

    const handleShowModal = () => {
        setShow(true)
        setSent(false)
    }

    const handleFilmChange = (id) => {
        setSelectedFilm(films.filter(film => film._id === id)[0])
    }
    
    const handleMessageChange = (event) => {
        setMessage(event.target.value)
    }

    const handleSend = async () => {
        try {
            await axiosReq.post('/reccomendations', {
                film: selectedFilm._id,
                sender: currentUser.user._id,
                reciever: user._id,
                message
            }, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            setUpdated(!updated)
            setSelectedFilm(null)
            setSent(true)
            setHasLoaded(false)
        } catch (err) {
            console.log(err)
        }
    }

    const renderTooltip = (username) => (
        <Tooltip id="button-tooltip">
            {`You've shared all your public films with ${username}.`}
        </Tooltip>
    );

    const [show, setShow] = useState(false);
    return (
        <>
            {films.length ? 
                <Button style={{marginRight: '5px'}} variant="outline-secondary" onClick={handleShowModal}>
                    <i className="fa-solid fa-clapperboard"></i> Share 
                </Button>   
            :
            allFilms.length? 
                <OverlayTrigger
                    placement="left"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip(user.username)}
                >
                        <span style={{marginRight: '5px', color: 'grey'}}><i className="fa-solid fa-check"></i> <i className="fa-solid fa-clapperboard"></i></span>
                </OverlayTrigger>
            :''}


            

            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header>
                    Sending to: <User data={user} searchResult={true}/>
                </Modal.Header>
                <Modal.Body>
                    {hasLoaded?(
                        <>
                            {selectedFilm  ? (
                                <span>Film Selected: <Image src={selectedFilm?.Poster} width={50}/></span>
                            ):(
                                <p>{sent? films.length? 'Film shared. Select another film to share.':`You've shared all your public films with ${user.username}`:''}</p>
                            )}
                            {films.length? (<DropdownButton variant='outline-secondary' title={sort}>
                                <Dropdown.Item onClick={() => setSort('Last Updated')}>Last Updated</Dropdown.Item>
                                <Dropdown.Item onClick={() => setSort('A-Z')}>A-Z</Dropdown.Item>
                            </DropdownButton>):('')}
                            <div style={{height: '200px', overflowY: 'scroll'}}>
                            {films.map(
                                film => 
                                <p key={film._id} onClick={() => handleFilmChange(film._id)}>
                                    {film.Title}
                                </p>
                            )}
                            </div> 
                        </>
                    ):(
                        <Spinner />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Form>
                        <Form.Label>Message</Form.Label>
                        <Form.Control style={!selectedFilm? {color: 'grey'}:{color: 'black'}} readOnly={selectedFilm === null} value={message} onChange={handleMessageChange}>
                        </Form.Control>
                    </Form>
                <Button variant="secondary" onClick={() => setShow(false)}>
                    Close
                </Button>
                <Button disabled={selectedFilm === null} variant="primary" onClick={handleSend}>
                {sent && !hasLoaded ? 'Sending...' : 'Send'}
                </Button>
                </Modal.Footer>
            </Modal>       
        </> 

    )
}

export default ShareModal