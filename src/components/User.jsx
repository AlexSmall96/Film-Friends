import React from 'react';
import { Button, Image } from 'react-bootstrap';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

/* 
Component used in friends page
Displays username, profile image, and an action button
Action button can be: send reccomendation, accept/decline request or text
*/
const User = ({user, id, status, updateRequest, sendRequest}) => {

    const history = useHistory()
    // Determine action button based on friend request status
    const getActionComponent = () => {
        if (status === 'accepted') {
            return (
            <>
                    <Button onClick={() => history.push(`/reccomendations/send/users/${user._id}`)}>
                        <i className="fa-solid fa-share"></i>
                    </Button>
            </>)
        }
        if (status === 'sent') {
            return 'Friend request sent'
        }
        if (status === 'recieved') {
            return (
                <>
                    <p>Wants to be friends</p>
                    <Button variant='outline-secondary' onClick={() => updateRequest(true, id)}>Accept</Button>
                    <Button variant='outline-secondary' onClick={() => updateRequest(false, id)}>Decline</Button>  
                </>
            )
        }
        return (
            <Button onClick={() => sendRequest(user._id)} variant='outline-secondary'>Add Friend</Button>
        )
    }
    // Render profile image, username and action component
    return (
        <span>
            <Image roundedCircle src={user.image} width={50} />
            {user.username}
            {getActionComponent()}
        </span>
    )
}

export default User;