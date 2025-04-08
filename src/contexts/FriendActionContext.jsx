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

    return (
        <FriendActionContext.Provider value={{updatedFriends, setUpdatedFriends, updateRequest, deleteRequest}}>
            {children}
        </FriendActionContext.Provider>
    )
}

export const useFriendAction = () => useContext(FriendActionContext)

