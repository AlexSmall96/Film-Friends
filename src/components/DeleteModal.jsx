import React, { useState } from 'react';
import { Button, ButtonGroup, Modal } from 'react-bootstrap';
import { useFriendAction } from '../contexts/FriendActionContext';
import { useFriendData } from '../contexts/FriendDataContext';
import appStyles from '../App.module.css'
import { useFilmPreview } from '../contexts/FilmPreviewContext';
import { useSaveFilmContext } from '../contexts/SaveFilmContext';
import { useCurrentFilm } from '../contexts/CurrentFilmContext';
import { useCurrentUser } from '../contexts/CurrentUserContext';

// Used as confirmation when user requests to delete reccomendation or friend
const DeleteModal = ({confirmMessage}) => {
    // Contexts
    const { deleteRequest } = useFriendAction()
    const { request  } = useFriendData()
    const { resultId, mainFilm } = useFilmPreview()
    const { deleteReccomendation } = useSaveFilmContext()
    const { currentReccomendation } = useCurrentFilm()
    const { isGuest } = useCurrentUser()

    // Initialize state variables
    const [show, setShow] = useState(false);
    const [text, setText] = useState('Yes')

    return (
        <>  
            {/* BUTTONS TO SHOW MODAL */}
            <Button variant="outline-secondary" disabled={isGuest} size="sm" className={`${appStyles.roundButton} ${isGuest && `${appStyles.verySmallFont} ${appStyles.black}`} ${resultId? appStyles.smallVerticalMargin: ''}`} onClick={() => setShow(true)}>
                <i className="fa-regular fa-trash-can"></i> {isGuest? " Cannot remove as guest": " Remove"}
            </Button>
            {/* MODAL CONTENT */}
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Body>
                    {confirmMessage}
                </Modal.Body>
                {/* MODAL BUTTONS */}
                <Modal.Footer>
                    <ButtonGroup>
                    {text === 'Yes'?
                        <Button variant="outline-secondary" className={appStyles.roundButton} onClick={() => setShow(false)}>
                            No
                        </Button>
                    :'' }
                    <Button variant="outline-secondary" className={appStyles.roundButton} 
                        onClick={() => {
                            setText('Deleting...')
                            resultId? deleteReccomendation(mainFilm? currentReccomendation?._id :resultId) : deleteRequest(request._id)
                        }}
                    >
                        {text}
                    </Button>
                    </ButtonGroup>
                </Modal.Footer>
            </Modal>       
        </> 

    )
}

export default DeleteModal