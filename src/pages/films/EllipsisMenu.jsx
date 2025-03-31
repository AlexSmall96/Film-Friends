import React, { useState, useRef, useEffect } from 'react';
import { Overlay, Dropdown, Modal, Button, Image, Form, Spinner} from 'react-bootstrap';
import appStyles from '../../App.module.css'
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
    const {currentUser} = useCurrentUser()
    const { currentFilmIds, setCurrentFilmIds, viewingData, omdbData } = useCurrentFilm()
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
            await axiosReq.delete(`/films/${currentFilmIds.database}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}} )
            setCurrentFilmIds({imdbID: '', database: ''})
            setUpdated(current => !current)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <>
            <div style={{float: 'right'}}>
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
                        (<div 
                            {...props}
                            style={{
                                position: 'absolute',
                                zIndex: 9999,
                                backgroundColor: 'lightgrey',
                                padding: '2px 10px',
                                color: 'black',
                                borderRadius: 3,
                                ...props.style,
                            }}
                        >   
                            {/* SHARE, REMOVE AND MAKE PUBLIC / PRIVATE OPTIONS */}
                            <p onClick={viewingData.public? handleShowModal : null} className={viewingData.public? appStyles.clickable: appStyles.unclickable}><i className="fa-solid fa-share"></i> Share</p>
                            <p className={appStyles.clickable} onClick={() => updateViewingData(null, null, !viewingData.public)}><i className="fa-solid fa-pen"></i> {viewingData.public? 'Make Private': 'Make Public'}</p>
                            <p className={appStyles.clickable} onClick={handleDelete}><i className="fa-regular fa-trash-can"></i> Remove from Watchlist</p>
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
                                    <p>{recipient? 'Sending to' : sent? 'Film Shared. Select another user to share.': ''}</p>
                                    <Dropdown>
                                        <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                                            {recipient?.username || 'Select recipient'}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu as={CustomMenu}>
                                            <div style={{maxHeight: '400px', overflowY: 'scroll'}}>
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
                {/* FILM TITLE AND IMAGE IN BODY */}
                <Modal.Body>
                {hasLoaded? (
                    <>
                        <Image src={omdbData.Poster} width={50}/>
                        {omdbData.Title}
                    </>
                    ):(
                        <Spinner />
                    )}
                </Modal.Body>
                {/* SEND AND CLOSE BUTTONS */}
                <Modal.Footer>
                    <Form>
                        <Form.Label>Message</Form.Label>
                        <Form.Control style={!recipient? {color: 'grey'}:{color: 'black'}} readOnly={recipient === null} value={message} onChange={handleMessageChange}>
                        </Form.Control>
                    </Form>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button disabled={recipient === null} variant="primary" onClick={handleSend}>
                        {sent && !hasLoaded ? 'Sending...' : 'Send'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default EllipsisMenu