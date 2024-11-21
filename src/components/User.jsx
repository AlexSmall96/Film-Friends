import React, {useState} from 'react';
import { Button, Col, Image, Row, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
/* 
Component used in friends page
Displays username, profile image
*/
const User = ({data, searchResult}) => {
    const history = useHistory()
    
    // Render profile image, username
    return (
        <Row onClick={() => history.push(`/profile/${data._id}`)}>
            <Col md={searchResult? 3 : 3}><Image roundedCircle src={data.image} width={searchResult? 50: 70} /></Col>
            <Col md={searchResult? 6 : 9} style={{textAlign:'left', paddingTop: searchResult? '3%':'7%'}} >{data.username}</Col>
        </Row>
    )
}

export default User;