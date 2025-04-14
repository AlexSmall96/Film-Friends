import React from 'react';
import appStyles from '../App.module.css'
import { useCurrentUser } from '../contexts/CurrentUserContext';

/* Customizable profile image component */
const Avatar = ({src, height=45, square}) => {
    const { currentUser } = useCurrentUser()
    return (
        <img 
            className={square? appStyles.squareAvatar : appStyles.avatar} 
            src={src || currentUser?.user.image }
            height={height}
            width={height} 
            alt="avatar" 
        />
    );
  };

export default Avatar