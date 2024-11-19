import React, {useState} from 'react';
import { Button, Modal } from 'react-bootstrap';

const DeleteModal = ({handleDelete, user}) => {
    const [show, setShow] = useState(false);
    return (
        <>
            <Button variant="outline-secondary" onClick={() => setShow(true)}>
                <i className="fa-regular fa-trash-can"></i> Remove
            </Button>

            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Body>{`Are you sure you want to remove ${user.username} as a friend?`}</Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>
                    No
                </Button>
                <Button variant="primary" onClick={handleDelete}>
                    Yes
                </Button>
                </Modal.Footer>
            </Modal>       
        </> 

    )
}

export default DeleteModal