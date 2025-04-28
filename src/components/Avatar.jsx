import React from 'react';
import styles from '../styles/Avatar.module.css'
import { useCurrentUser } from '../contexts/CurrentUserContext';

/* Customizable profile image component */
const Avatar = ({src, height=45, square, alt}) => {

    // Use currentUser as default image if no src is provided
    const { currentUser } = useCurrentUser()
    
    return (
        <img 
            className={square? styles.squareAvatar : styles.avatar} 
            src={src || currentUser?.user.image }
            height={height}
            width={height} 
            alt={alt || "avatar"}
        />
    );
  };

export default Avatar