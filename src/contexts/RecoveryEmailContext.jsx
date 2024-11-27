import React, { createContext, useState, useContext } from "react";

export const RecoveryEmailContext = createContext()

export const RecoveryEmailProvider = ({ children }) => {
    const getStoredEmail = () => {
        const storedEmail = localStorage.getItem('recoveryEmail')
        return storedEmail ? JSON.parse(storedEmail): null
    }
    const [recoveryEmail, setRecoveryEmail] = useState(getStoredEmail() || null)

    return (
        <RecoveryEmailContext.Provider value={{recoveryEmail, setRecoveryEmail}}>
            {children}
        </RecoveryEmailContext.Provider>
    )
}

export const useRecoveryEmail = () => useContext(RecoveryEmailContext)