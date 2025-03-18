import { useEffect } from 'react';
import { useHistory} from 'react-router';

export const useRedirect = () => {
  
const history = useHistory()
  useEffect(() => {
    const checkUser = () => {
        if (!localStorage.getItem('storedUser')){
            history.push('/')
        }
    }
    checkUser();
  }, [history]);
};