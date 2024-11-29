import React, {useState} from 'react';
import { Button, Col, Image, Row, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useFriendData } from '../contexts/FriendDataContext';
/* 
Component used in friends page
Displays username, profile image
*/
const User = ({searchResult}) => {
    const history = useHistory()
    const { user } = useFriendData()
    // Render profile image, username
    return (
        <Row onClick={() => history.push(`/profile/${user._id}`)}>
            <Col md={searchResult? 3 : 3}><Image roundedCircle src={user.image} width={searchResult? 40: 60} height={searchResult? 40: 60} /></Col>
            <Col md={searchResult? 6 : 9} style={{textAlign:'left', paddingTop: searchResult? '3%':'7%'}} >{user.username}</Col>
        </Row>
    )
}

export default User;