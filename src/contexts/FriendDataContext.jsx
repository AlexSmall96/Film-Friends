import React, { createContext, useContext } from "react";

/* 
Provides the id of a friend request and the user data associated with it
Wraps around the search results list and friends list in Friends.jsx
*/ 
export const FriendDataContext = createContext()

export const FriendDataProvider = ({ user, requestId, children }) => {

    return (
        <FriendDataContext.Provider value={{user, requestId}}>
            {children}
        </FriendDataContext.Provider>
    )
}

export const useFriendData = () => useContext(FriendDataContext)