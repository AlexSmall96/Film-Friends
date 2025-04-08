import React, { createContext, useState, useContext } from "react";
import { useCurrentUser } from "./CurrentUserContext";
import { axiosReq } from "../api/axiosDefaults";
/* 
Provides functions to send, update or delete friend requests
Stores an boolean 'updated' variable to re-trigger useEffect in Friends.jsx
*/ 
export const FriendActionContext = createContext()

export const FriendActionProvider = ({ children }) => {
    
    // Boolean variable to trigger useEffect
    const [updatedFriends, setUpdatedFriends] = useState(false)
    // Get current user for token in below functions
    const {currentUser} = useCurrentUser()

    // Current user can delete a friend request 
    const deleteRequest = async (id) => {
        try {
            await axiosReq.delete(`/requests/${id}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            setUpdatedFriends(!updatedFriends)
        } catch (err) {
            console.log(err)
        }
    }

    // Updates the status of the friend request to accepted or declined
    const updateRequest = async (accepted, id) => {
        const update = accepted? {accepted: true} : {declined: true}
        try {
            await axiosReq.patch(`/requests/${id}`, update, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            setUpdatedFriends(!updatedFriends)
        } catch (err) {
            console.log(err)
        }
    }

    // Takes in id and uses requests array to determine status of friend request
    const getStatus = (id, requestIds, requests) => {
        if (!requestIds.includes(id)) {
            return {accepted: false, sent: false, recieved: false}
        }
        const sentFromId = requests.filter(request => request.sender._id === id)
        const sentToId = requests.filter(request => request.reciever._id === id)
        const request = sentFromId.length? sentFromId[0]: sentToId[0]
        return {
            accepted: request?.accepted || false,
            sent: sentToId.length,
            recieved: !sentToId.length
        }
    }

    return (
        <FriendActionContext.Provider value={{updatedFriends, setUpdatedFriends, updateRequest, getStatus, deleteRequest}}>
            {children}
        </FriendActionContext.Provider>
    )
}

export const useFriendAction = () => useContext(FriendActionContext)

