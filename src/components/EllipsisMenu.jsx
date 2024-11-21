import React, { useState, useRef, useEffect } from 'react';
import { Overlay, Dropdown, Modal, Button, Image, Form, Spinner } from 'react-bootstrap';
import appStyles from '../App.module.css'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { CustomMenu, CustomToggle } from './CustomDropDown';
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { axiosReq } from '../api/axiosDefaults';

const EllipsisMenu = ({handleDelete, handleShare, updateViewingData, viewingData, omdbData, filmId}) => {
    const history = useHistory()
    const {currentUser} = useCurrentUser()
    const [showMenu, setShowMenu] = useState(false);
    const [showModal, setShowModal] = useState(false)
    const target = useRef(null)
    const [message, setMessage] = useState("Hey! Check out this awesome film I've just watched. I think you'll love it! ")
    const [feedback, setFeedback] = useState('')
    const [recipient, setRecipient] = useState(null)
    const [friends, setFriends] = useState([])
    const [allFriends, setAllFriends] = useState([])
    const [updated, setUpdated] = useState(false)
    const [sent, setSent] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)

    const handleShowModal = () => {
        setShowModal(true)
        setShowMenu(false)
        setSent(false)
    }

    const handleMessageChange = (event) => {
        setMessage(event.target.value)
    }

    const handleCloseModal = () => setShowModal(false)

    useEffect(() => {
        const fetchRequests = async () => {
            const response = await axiosReq.get(`/requests/?limit=10000&skip=0`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            const acceptedRequests = response.data.filter(req => req.accepted)
            const reccomendationsResponse = await axiosReq.get('/reccomendations', {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            const alreadyReccomended = reccomendationsResponse.data.filter(rec => rec.film.imdbID === omdbData.imdbID)
            const alreadyReccomendedUsernames = alreadyReccomended.map(rec => rec.reciever.username)
            setFriends(acceptedRequests.filter(request => request.isSender? !alreadyReccomendedUsernames.includes(request.reciever.username):!alreadyReccomendedUsernames.includes(request.sender.username)))
            setAllFriends(acceptedRequests)
            setHasLoaded(true)
        }
        fetchRequests()
    }, [currentUser.token, updated, omdbData])

    const handleSend = async () => {
        try {
            await axiosReq.post('/reccomendations', {
                film: filmId,
                sender: currentUser.user._id,
                reciever: recipient._id,
                message
            }, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            setUpdated(!updated)
            setRecipient(null)
            setSent(true)
            setHasLoaded(false)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <>
        <div style={{float: 'right'}}>
            <i onClick={() => setShowMenu(!showMenu)} ref={target} className={`fa-xl fa-solid fa-ellipsis-vertical`}></i>
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
                        backgroundColor: 'lightgrey',
                        padding: '2px 10px',
                        color: 'black',
                        borderRadius: 3,
                        ...props.style,
                    }}
                >
                    {friends.length? 
                        <p onClick={handleShowModal} className={appStyles.hover}><i className="fa-solid fa-share"></i> Share</p>
                    : allFriends.length? 
                        <p style={{color: 'grey'}}><i className="fa-solid fa-share"></i> You've shared this with all your friends</p>
                    :   <p style={{color: 'grey'}}><i className="fa-solid fa-share"></i> You don't have any friends yet</p>}
                    <p className={appStyles.hover} onClick={handleDelete}><i className="fa-regular fa-trash-can"></i> Remove from Watchlist</p>
                    <p className={appStyles.hover} onClick={() => updateViewingData(null, null, !viewingData.public)}><i className="fa-solid fa-pen"></i> {viewingData.public? 'Make Private': 'Make Public'}</p>
                </div>)
            }
            </Overlay>
        </div>
              <Modal show={showModal} onHide={handleCloseModal}>
              <Modal.Header closeButton>
            {hasLoaded? 
              recipient? 
                <p>Sending to: </p>
            :
                <p>{sent? friends.length? 'Film Shared. Select another user to share.' :`Film Shared. You've shared this film with all your friends.`: ''}</p>
            
            :''}
            {hasLoaded?
              friends.length?
              <Dropdown>
              <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
              {recipient?.username || 'Select recipient'}
              </Dropdown.Toggle>
              <Dropdown.Menu as={CustomMenu}>
                  <div style={{maxHeight: '400px', overflowY: 'scroll'}}>
                  {friends.map(
                      friend => <Dropdown.Item key={friend._id} 
                                  onClick={() => setRecipient(friend.isSender? friend.reciever : friend.sender)}>
                                      {friend.isSender? friend.reciever.username : friend.sender.username}
                                  </Dropdown.Item>
                  )}
                  </div>

              </Dropdown.Menu>
              </Dropdown>
              : 
              ''
            :''}
            </Modal.Header>
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
                Send
              </Button>
            </Modal.Footer>
            
            </Modal>
            </>
    )
}

export default EllipsisMenu