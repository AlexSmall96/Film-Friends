import React from 'react';
import { Button } from 'react-bootstrap';
import DeleteModal from './DeleteModal';
import ShareModal from './ShareModal';
import { useFriendAction } from '../contexts/FriendActionContext';
import { useFriendData } from '../contexts/FriendDataContext';
/* 
Component used in friends page
Displays appropriate text and buttons, dependent on status of friend request
Changes what is displayed depending on wether the component is being used in search results or friends list
*/
const FriendRequestButtons = ({status, searchResult}) => {

    // Friend action and data contexts
    const {sendRequest, updateRequest} = useFriendAction()
    const {user, requestId} = useFriendData()
    // Desctructure status fields
    const {accepted, sent, recieved} = status

    // Determine text based on status
    // Text when component is used in friends list
    const friendsText = accepted? 'Friends': sent? 'Friend request sent': 'Wants to be friends'
    // Text when component is used in search results
    const searchResultsText = accepted? 'Friends': sent || recieved? 'Friend request pending': ''

    // Determine button to render based on status of request
    // Buttons when component is used in friends list
    const friendsButtons = accepted ? 
        <>
            <ShareModal />
            <DeleteModal message={`Are you sure you want to remove ${user.username} as a friend?`} />
        </> : 
            sent?
                <DeleteModal message={`Are you sure you want to remove your friend request to ${user.username}?`} />
            : 
                <>
                    <Button style={{marginRight: '5px'}} onClick={() => updateRequest(true, requestId)} variant='outline-secondary'><i className="fa-solid fa-check"></i> Accept</Button>
                    <Button onClick={() => updateRequest(false, requestId)} variant='outline-secondary'><i className="fa-solid fa-xmark"></i> Decline</Button>                   
                </>
    // Buttons when component is used in search results
    const searchResultsButtons = !accepted && !sent && !recieved ? 
        <>
            <Button onClick={() => sendRequest(user._id)} variant='outline-secondary'>Send Friend Request</Button>
        </> : ''

    // Render text and buttons determined above
    return (
        <div>
            <p style={{fontSize: 'small', marginBottom: '5px'}}>{searchResult? searchResultsText: friendsText}</p> 
            <p style={{fontSize: 'small', marginBottom: '5px'}}>{searchResult? searchResultsButtons: friendsButtons}</p>
        </div>
    )
}

export default FriendRequestButtons