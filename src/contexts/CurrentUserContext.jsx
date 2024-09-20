import React, { createContext, useState, useContext } from "react";
import axios from "axios";
/* 
The code to get user from local storage was taken from the below article
https://www.freecodecamp.org/news/how-to-use-localstorage-with-react-hooks-to-set-and-get-items/
*/

export const CurrentUserContext = createContext()

export const CurrentUserProvider = ({ children }) => {

    const getStoredUser = () => {
        const storedUser = localStorage.getItem('storedUser')
        return storedUser ? JSON.parse(storedUser): null
    }

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

    return (
        <CurrentUserContext.Provider value={{currentUser, setCurrentUser}}>
            {children}
        </CurrentUserContext.Provider>
    )
}

export const useCurrentUser = () => useContext(CurrentUserContext)

