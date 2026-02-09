import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
/* 
Current user context. Sets current user on log in and updates local storage when current user is changed.
The code to get user from local storage was taken from the below article
https://www.freecodecamp.org/news/how-to-use-localstorage-with-react-hooks-to-set-and-get-items/
*/

export const CurrentUserContext = createContext()

export const CurrentUserProvider = ({ children }) => {

    // Check if a user is saved in local storage
    const getStoredUser = () => {
        const storedUser = localStorage.getItem('storedUser')
        return storedUser ? JSON.parse(storedUser): null
    }

    const getStoredGuest = () => {
        const storedGuest = localStorage.getItem('isGuest')
        return storedGuest ? JSON.parse(storedGuest) : false
    }

    const [isGuest, setIsGuest] = useState(getStoredGuest())

    // Make HTTP request to check if token is still valid
    const checkToken = async (token) => {
        try {
            const response = axios.get('/users/token', {headers: {'Authorization': `Bearer ${token}`}})
            if (response.status === 200){
                return true
            }
        } catch(err) {
            localStorage.removeItem('storedUser')
            return false
        }
    }

    const storedUser = getStoredUser()

    const tokenIsValid = storedUser?.token ? (checkToken(storedUser.token)):(false)

    const [currentUser, setCurrentUser] = useState(
        storedUser && tokenIsValid ? (storedUser):(null)
    )

    // Update local storage whenever current user is updated
    useEffect(() => {
        if (currentUser){
            localStorage.setItem('storedUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('storedUser')
        }
    }, [currentUser])

    useEffect(() => {
        localStorage.setItem('isGuest', JSON.stringify(isGuest))
    }, [isGuest])
    
    // Define accountDeleted bool var to display message on home screen after deletion
    const [accountDeleted, setAccountDeleted] = useState(false)

    return (
        <CurrentUserContext.Provider value={{currentUser, setCurrentUser, accountDeleted, setAccountDeleted, isGuest, setIsGuest}}>
            {children}
        </CurrentUserContext.Provider>
    )
}

export const useCurrentUser = () => useContext(CurrentUserContext)

