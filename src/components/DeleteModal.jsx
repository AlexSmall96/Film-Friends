import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useFriendAction } from '../contexts/FriendActionContext';
import { useFriendData } from '../contexts/FriendDataContext';
import appStyles from '../App.module.css'
import { useFilmPreview } from '../contexts/FilmPreviewContext';
import useWindowDimensions from '../hooks/useWindowDimensions';
import { useSaveFilmContext } from '../contexts/SaveFilmContext';
import { useCurrentFilm } from '../contexts/CurrentFilmContext';

const DeleteModal = ({message}) => {
    // Contexts
    const { deleteRequest } = useFriendAction()
    const { requestId  } = useFriendData()
    const { sender, resultId, mainFilm } = useFilmPreview()
    const { deleteReccomendation } = useSaveFilmContext()
    const { currentReccomendation } = useCurrentFilm()

    // Initialize state variables
    const [show, setShow] = useState(false);
    const [text, setText] = useState('Yes')

    return (
        <>  
            {/* BUTTONS TO SHOW MODAL */}
            <Button variant="outline-secondary" size="sm" className={`${appStyles.roundButton}`} onClick={() => setShow(true)}>
                <i className="fa-regular fa-trash-can"></i> Remove 
            </Button>
            {/* MODAL CONTENT */}
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Body>
                    {message}
                </Modal.Body>
                {/* MODAL BUTTONS */}
                <Modal.Footer>
                    {text === 'Yes'?
                        <Button variant="secondary" onClick={() => setShow(false)}>
                            No
                        </Button>
                    :'' }
                    <Button variant="primary" 
                        onClick={() => {
                            setText('Deleting...')
                            !requestId? deleteReccomendation(mainFilm? currentReccomendation._id :resultId) : deleteRequest(requestId)
                        }}
                    >
                        {text}
                    </Button>
                </Modal.Footer>
            </Modal>       
        </> 

    )
}

export default DeleteModal