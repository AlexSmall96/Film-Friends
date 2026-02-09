import React, { useState, useRef, useEffect } from 'react';
import { Overlay, Dropdown, Modal, Button, Form, Spinner, ButtonGroup} from 'react-bootstrap';
import appStyles from '../../App.module.css'
import styles from '../../styles/EllipsisMenu.module.css'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { CustomMenu, CustomToggle } from '../../components/CustomDropDown'
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentFilm } from '../../contexts/CurrentFilmContext';
import { useSaveFilmContext } from '../../contexts/SaveFilmContext';

/* 
Ellipsis menu - used as a subcomponent of the film component when rendered on films page
Allows user to share film, delete film, or make public / private
*/
const EllipsisMenu = ({updateViewingData}) => {
    // Contexts
    const {currentUser, isGuest} = useCurrentUser()
    const { currentFilmIds, setCurrentFilmIds, viewingData, omdbData, setHasDeleted } = useCurrentFilm()
    const { updated, setUpdated } = useSaveFilmContext()
    // Hooks
    const history = useHistory()
    // Initialise state variables
    const [showMenu, setShowMenu] = useState(false);
    const [showModal, setShowModal] = useState(false)
    const target = useRef(null)
    const [message, setMessage] = useState("Hey! Check out this awesome film I've just watched. I think you'll love it! ")
    const [recipient, setRecipient] = useState(null)
    const [friends, setFriends] = useState([])
    const [allFriends, setAllFriends] = useState([])
    const [sent, setSent] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)

    // Reset variables for new modal being shown
    const handleShowModal = () => {
        setShowModal(true)
        setShowMenu(false)
        setSent(false)
    }

    // Change handler for message form
    const handleMessageChange = (event) => {
        setMessage(event.target.value)
    }

    // Handle close modal
    const handleCloseModal = () => setShowModal(false)

    // Use effect executes whenever a film is shared or a new film is selected
    useEffect(() => {
        const fetchRequests = async () => {
            setHasLoaded(false)
            // Get all users friend requests to determine who film can be shared with
            const response = await axiosReq.get(`/requests/`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            // Filter to accepted requests (friends)
            const acceptedRequests = await response.data.filter(req => req.accepted)
            // Get all reccomendations to determine who film has already been shared with
            const reccomendationsResponse = await axiosReq.get('/reccomendations', {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            const alreadyReccomended = await reccomendationsResponse.data.filter(rec => rec.film?.imdbID === omdbData?.imdbID)
            const alreadyReccomendedUsernames = await alreadyReccomended.map(rec => rec.reciever.username)
            // Filter friend requests based on already sent reccomendations
            const filteredRequests = await acceptedRequests.filter(request => request.isSender? !alreadyReccomendedUsernames.includes(request.reciever.username):!alreadyReccomendedUsernames.includes(request.sender.username))
            setFriends(filteredRequests)
            setAllFriends(acceptedRequests)
            setHasLoaded(true)
        }

        fetchRequests()
    }, [currentUser.token, updated, omdbData])

    // Handle send - creates a new reccomendation
    const handleSend = async () => {
        try {
            // Post data
            await axiosReq.post('/reccomendations', {
                film: currentFilmIds.database,
                sender: currentUser.user._id,
                reciever: recipient._id,
                message
            }, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            // Reset state variables and trigger useEffect re-run
            setRecipient(null)
            setSent(true)
            setHasLoaded(false)
            setUpdated(current => !current)
        } catch (err) {
            console.log(err)
        }
    }
    // Handle Delete - Removes film from watchlist
    const handleDelete = async () => {
        try {
            setHasDeleted(false)
            await axiosReq.delete(`/films/${currentFilmIds.database}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}} )
            setCurrentFilmIds({imdbID: '', database: ''})
            setUpdated(current => !current)
            setHasDeleted(true)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <>
            <div className={`${appStyles.rightAlign} ${appStyles.bigLeftHorizMargin} ${appStyles.verticalMargin}`}>
                {/* ELLIPSIS ICON TO SHOW MENU */}
                <i onClick={() => setShowMenu(!showMenu)} ref={target} className={`fa-xl fa-solid fa-ellipsis-vertical`}></i>
                {/* OVERLAY TO SHOW OPTIONS */}
                <Overlay 
                    target={target.current} 
                    show={showMenu} 
                    placement="left" 
                    rootClose='false'
                    onHide={() => {setShowMenu(false)}} 
                >
                    {({placement: _placement, arrowProps: _arrowProps, show: _show, popper: _popper, hasDoneInitialMeasure: _hasDoneInitialMeasure, ...props}) => 
                        (<div className={styles.menu} {...props}>   
                            {/* SHARE, REMOVE AND MAKE PUBLIC / PRIVATE OPTIONS */}
                            <p onClick={viewingData.public && friends.length? handleShowModal : null} className={viewingData.public && friends.length? styles.clickable: appStyles.grey}><i className="fa-solid fa-share"></i> Share</p>
                            <p className={styles.clickable} onClick={() => updateViewingData(null, null, !viewingData.public)}><i className="fa-solid fa-pen"></i> {viewingData.public? 'Make Private': 'Make Public'}</p>
                            <p className={isGuest ? appStyles.grey: styles.clickable} onClick={() => { if (!isGuest) handleDelete() }}><i className="fa-regular fa-trash-can" disabled={isGuest}></i> 
                                {isGuest? ' Cannot remove as guest' : ' Remove from Watchlist'}
                            </p>
                        </div>)
                    }
                </Overlay>
            </div>
            { /* MODAL FOR SHARE FILM */}
            <Modal show={showModal} onHide={handleCloseModal}>
                {/* SELECT RECIPIENT DROPDOWN */}
                <Modal.Header closeButton>
                    {hasLoaded?
                        allFriends.length? 
                            friends.length? (
                                <>
                                    <i className="fa-regular fa-user"></i>
                                    <Dropdown>
                                        <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                                            <strong> {recipient?.username || 'Select recipient'}</strong>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu as={CustomMenu}>
                                            <div className={styles.recipientList}>
                                                {friends.map(friend => 
                                                    <Dropdown.Item key={friend._id} 
                                                        onClick={() => setRecipient(friend.isSender? friend.reciever : friend.sender)}
                                                    >
                                                        {friend.isSender? friend.reciever.username : friend.sender.username}
                                                    </Dropdown.Item>
                                                )}
                                            </div>
                                        </Dropdown.Menu>
                                    </Dropdown>                                
                                </>
                            ):(
                                "You've shared this film with all your friends."
                            )
                        :
                            <>
                                You don't have any friends to share this film with
                                <Button variant='link' onClick={() => history.push('/friends')}>Search for users</Button>
                            </>
                    :(
                        ''
                    )}
                </Modal.Header>
                {/* FILM TITLE IN BODY */}
                <Modal.Body>
                    {hasLoaded? 
                        <>
                            <i className="fa-solid fa-film"></i> <strong>{omdbData.Title}</strong> 
                        </>
                        :
                            <Spinner />
                    }
                    <Form>
                        <Form.Control 
                            className={`${appStyles.modalText} ${appStyles.verticalMargin} ${!recipient? appStyles.grey : ''}`} 
                            as='textarea' 
                            readOnly={recipient === null} 
                            value={message}
                            name='message' 
                            onChange={handleMessageChange}
                        >
                        </Form.Control>
                    </Form>
                </Modal.Body>
                {/* SEND AND CLOSE BUTTONS */}
                <Modal.Footer>
                    <ButtonGroup>
                        <Button variant="outline-secondary" className={appStyles.roundButton} onClick={handleCloseModal}>
                            <i className="fa-solid fa-xmark"></i> Close
                        </Button>
                        <Button disabled={recipient === null} variant="outline-secondary" className={appStyles.roundButton} onClick={handleSend}>
                            <i className="fa-solid fa-paper-plane"></i> {sent && !hasLoaded ? 'Sending...' : 'Send'}
                        </Button>
                    </ButtonGroup>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default EllipsisMenu