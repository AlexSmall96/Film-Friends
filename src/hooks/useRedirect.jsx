import { useEffect } from 'react';
import { useHistory} from 'react-router';
import { useCurrentUser } from '../contexts/CurrentUserContext';

export const useRedirect = () => {
    const history = useHistory()
  	const {currentUser} = useCurrentUser()

    useEffect(() => {
        const redirect = async () => {
            history.push('/')
        }
        if (!currentUser) {
            redirect()
        }
    }, [currentUser])
};