import React, { createContext, useState, useContext } from "react";

export const RecoveryDataContext = createContext()

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