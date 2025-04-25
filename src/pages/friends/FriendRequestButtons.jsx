import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import DeleteModal from '../../components/DeleteModal';
import ShareModal from './ShareModal';
import { useFriendAction } from '../../contexts/FriendActionContext';
import { useFriendData } from '../../contexts/FriendDataContext';
import { FilmPreviewProvider } from '../../contexts/FilmPreviewContext';
import appStyles from '../../App.module.css'
/* 
Component used in friends page
Displays appropriate text and buttons, dependent on status of friend request
Changes what is displayed depending on wether the component is being used in search results or friends list
*/
const FriendRequestButtons = () => {

    // Contexts
    const { request } = useFriendData()
    const { accepted, isSender, reciever } = request
    const { acceptRequest, deleteRequest } = useFriendAction()

    return (
        <>
            {
                accepted || isSender?
                    <>  {/* SHOW TEXT IF FRIENDS OR USER HAS SENT REQUEST */}
                        <p>
                            {accepted? 
                                <>
                                    <i className="fa-solid fa-user-group"></i> Friends
                                </>
                            : 
                                <>
                                    <i className="fa-solid fa-envelope-circle-check"></i> Friend request pending
                                </>
                            }
                        </p>
                        {/* IF REQUEST ACCEPTED - SHARE MODAL TO SHARE FILMS */}
                        {/* ALSO INCLUDE DELETE MODDAL TO REMOVE FRIEND */}
                        <ButtonGroup>
                            {accepted? 
                                <ShareModal /> 
                            : ''}
                            <FilmPreviewProvider>
                                <DeleteModal message={`Are you sure you want to remove ${reciever.username} as a friend?`} />
                            </FilmPreviewProvider>
                        </ButtonGroup>
                    </>
                :   
                    <>
                        {/* ACCEPT/DECLINE BUTTONS IF USER HAS RECIEVED REQUEST */}
                        <p><i className="fa-solid fa-envelope-open"></i> Wants to be friends</p>
                        <ButtonGroup>
                            <Button onClick={() => acceptRequest(request._id)} variant='outline-secondary' size='sm' className={appStyles.roundButton}><i className="fa-solid fa-check"></i> Accept</Button>
                            <Button onClick={() => deleteRequest(request._id)} variant='outline-secondary' size='sm' className={appStyles.roundButton}><i className="fa-solid fa-xmark"></i> Decline</Button>  
                        </ButtonGroup>
                    </>
                  
            }   
        </>
    )
}

export default FriendRequestButtons