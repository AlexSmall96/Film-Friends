import React, { useEffect, useState } from 'react';
import { useParams, useHistory  } from 'react-router-dom/cjs/react-router-dom.min';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { Spinner, Button } from 'react-bootstrap';

const Profile = () => {
    // Hooks
    const { id } = useParams();
    const history = useHistory()

    // Contexts
    const { currentUser } = useCurrentUser()
    // Initialize state variables
    const [profile, setProfile] = useState({})
    const [similarity, setSimilarity] = useState(0)
    const [hasLoaded, setHasLoaded] = useState(true)
    const [isFriend, setIsFriend] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [updated, setUpdated] = useState(false)

    useEffect(() => {
        // Get the users profile data and films on watchlist
        const fetchProfile = async () => {
            try {
                const response = await axiosReq.get(`/users/${id}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                setProfile(response.data.profile)
                setSimilarity(parseFloat(100 * response.data.similarity).toFixed(0)+"%")
                // setSimilarity(response.data.similarity)
            } catch (err) {
                console.log(err)
            }
        }
        // Get the users publics films to calculate similarity score
        // Gets the ids of the users who are friends with owner of profile
        const fetchUsersFriendIds = async () => {
            try {
                const response = await axiosReq.get('/requests/', {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                const acceptedRequests = response.data.filter(request => request.accepted)
                const friendIds = acceptedRequests.map(request => request.reciever._id).concat(acceptedRequests.map(request => request.sender._id))
                // Check if current users accepted friend requests contain the profile owner, must be friends to view link to owners film list
                setIsFriend(friendIds.includes(id))
                const pendingRequests = response.data.filter(request => !request.accepted)
                const pendingIds = pendingRequests.map(request => request.reciever._id).concat(pendingRequests.map(request => request.sender._id))
                // Check if current users pending requests contain the profile owner
                setIsPending(pendingIds.includes(id))
            } catch (err) {
                console.log(err)
            }
        }
        fetchProfile()
        fetchUsersFriendIds()
    }, [currentUser.token, updated])

    // Sends a friend request to owner of profile
    const sendRequest = async () => {
        try {
            await axiosReq.post('/requests', {reciever: id}, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            setUpdated(!updated)
        } catch (err) {
            console.log(err)
        }
    }

    // Check if current user is owner of profile
    const isOwner = currentUser.user._id === id
    
    return (
        <>  
            {/* HEADER */}
            {hasLoaded? (
                <>
                <h3>{profile.username}</h3>
                    {/* PUBLIC PROFILE INFO */}
                    <p>{`Username: ${profile.username}, Age: ${profile.age}`}</p>
                    {!isOwner && isFriend? (<p>{similarity}</p>):('')}
                    <img src={profile.image} height={200} width={200} alt={`Profile picture for ${profile.username}`}  />
                    {/* EMAIL AND EDIT BUTTON IF USER IS OWNER OF PROFILE */}
                    {isOwner? 
                        (
                            <>
                                <p>{`Email: ${profile.email}`}</p>
                                <Button variant='outline-secondary' onClick={() => history.push(`/profile/edit/${currentUser.user._id}`)}>Edit Profile</Button>
                                <Button variant='outline-secondary' onClick={() => history.push(`/films/${id}`)}>Go to your watchlist</Button>
                            </>
                        ):(
                            isFriend? 
                                (
                                    <Button variant='outline-secondary' onClick={() => history.push(`/films/${id}`)}>{`Go to ${profile.username}'s watchlist`}</Button>
                                ):(
                                    isPending ? 
                                        (
                                            <><p>Friend Request Sent</p><Button variant='outline-secondary' onClick={() => history.push('/friends')}>Go to your friends list</Button></>
                                            
                                        ):(
                                            <Button variant='outline-secondary' onClick={sendRequest}>Send friend request</Button>
                                        )
                                )
                        )
                    }
                </>
            ):(
                <>
                    {/* SPINNER ANIMATION WHILE LOADING */}
                    <Spinner animation='border' />
                </>)}
        </>
    )
}
export default Profile;