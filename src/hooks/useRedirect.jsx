import { useEffect } from 'react';
import { useHistory} from 'react-router';
import { useCurrentUser } from '../contexts/CurrentUserContext';

// Used in logged in only pages to redirect user to home page when no current User detected
export const useRedirect = () => {
    const history = useHistory()
  	const { currentUser } = useCurrentUser()

    useEffect(() => {
        if (!currentUser) {
            history.push('/')
        }
    }, [currentUser])
};