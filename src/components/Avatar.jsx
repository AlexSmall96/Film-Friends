import React from 'react';
import appStyles from '../App.module.css'

/* Customizable profile image component */
const Avatar = ({src, height=45, square}) => {
    return (
        <img 
            className={square? appStyles.squareAvatar : appStyles.avatar} 
            src={src}
            height={height}
            width={height} 
            alt="avatar" 
        />
    );
  };

export default Avatar