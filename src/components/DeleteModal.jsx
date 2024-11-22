import React, {useState} from 'react';
import { Button, Modal } from 'react-bootstrap';

const DeleteModal = ({handleDelete, message}) => {
    const [show, setShow] = useState(false);
    const [text, setText] = useState('Yes')
    return (
        <>
            <Button variant="outline-secondary" onClick={() => setShow(true)}>
                <i className="fa-regular fa-trash-can"></i> Remove
            </Button>

            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Body>{message}</Modal.Body>
                <Modal.Footer>
                {text === 'Yes'?
                    <Button variant="secondary" onClick={() => setShow(false)}>
                        No
                    </Button>
                :'' }
                <Button variant="primary" 
                    onClick={() => {
                        setText('Deleting...')
                        handleDelete()
                    }}>
                    {text}
                </Button>
                </Modal.Footer>
            </Modal>       
        </> 

    )
}

export default DeleteModal