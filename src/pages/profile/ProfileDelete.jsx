import React, {useState} from 'react';
import { useHistory  } from 'react-router-dom/cjs/react-router-dom.min';
import { Button } from 'react-bootstrap';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';

// Page to confirm deletion of profile
const ProfileDelete = () => {
    const history = useHistory()
    // Use current user context to get clear current user on deletion
    const { currentUser, setCurrentUser  } = useCurrentUser()
    // Initialise a state variable to determie button text
    const [deleted, setDeleted] = useState(false)

    // Handle Delete function
    const handleDelete = async () => {
        try {
            await axiosReq.delete('/users/me', {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            localStorage.clear()
            setCurrentUser(null)
            setDeleted(true)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <>
            {/* CONFIRM MESSAGE */}
            <h5>{!deleted? `Are you sure you want to delete your account for username ${currentUser.user.username}?`: 'Your account has been deleted.'}</h5>
            {/* YES / GO BACK BUTTONS */}
            {!deleted?(
               <>
                    <Button variant='outline-secondary' onClick={handleDelete}>Yes</Button>
                    <Button variant='outline-secondary' onClick={() => history.goBack()}>Go back</Button> 
               </> 
            ):(
                <>
                     {/* LINK TO HOME PAGE ONCE ACCOUNT IS DELETED */}
                     <Button onClick={() => history.push('/')}>Continue browsing films</Button> 
                </>
            )}

        </>

    )
}

export default ProfileDelete