import React, { createContext, useState, useContext } from "react";

/* Used for password resets. Stores (in local storage) the email chosen by user to recover password. */
export const RecoveryDataContext = createContext()

// Check if email has been saved in local storage
export const RecoveryDataProvider = ({ children }) => {
    const getStoredEmail = () => {
        const storedEmail = localStorage.getItem('recoveryEmail')
        return storedEmail ? JSON.parse(storedEmail): null
    }
    const [recoveryEmail, setRecoveryEmail] = useState(getStoredEmail() || null)

    return (
        <RecoveryDataContext.Provider value={{recoveryEmail, setRecoveryEmail}}>
            {children}
        </RecoveryDataContext.Provider>
    )
}

export const useRecoveryData = () => useContext(RecoveryDataContext)