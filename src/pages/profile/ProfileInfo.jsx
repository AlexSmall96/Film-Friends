import React, { useEffect, useState } from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import { useHistory  } from 'react-router-dom/cjs/react-router-dom.min';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import {Container, Row, Col, Image} from 'react-bootstrap'

const ProfileInfo = ({setUpdated, updated}) => {
    const { currentUser, setCurrentUser, updateStoredUser } = useCurrentUser()
    const [message, setMessage] = useState({})
    const [username, setUsername] = useState('')

    useEffect(() => {
        setUsername(currentUser.user.username)
    }, [])

    const handleUsernameChange = (event) => {
        setUsername(event.target.value)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            const response = await axiosReq.patch('/users/me', {username}, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            setUpdated(!updated)
            setMessage({username: 'Username updated successfully'})
            setCurrentUser({user:response.data.user, token: response.data.token})
            localStorage.setItem('storedUser', JSON.stringify({user:response.data.user, token: response.data.token}));
        } catch (err) {
            if (err?.response?.data?.errorResponse){
                setMessage({username: 'Username taken. Please select a different username'})
            } else {
                setMessage({password:'Currently unable to change username due to system issues. Please try again later.'})
            }
        }
    }

    return(
        <Container>
            <form onSubmit={handleSubmit}>
                <Row>
                    <p>Username</p>
                    <p>
                        <input type='text' name='username' value={username || ''} onChange={handleUsernameChange} />
                        <button type='submit'>Save</button>
                        {message.username || ''}
                    </p>
                </Row>
                <Row>
                <p>Picture</p>
                    <Col md={6}>
                    Image Preview
                        <Image src='https://res.cloudinary.com/dojzptdbc/image/upload/v1687104476/default_profile_k3tfhd.jpg' width={150} />                    
                    </Col>
                    <Col md={6}>
                        <input type='file' name='picture' />
                        <button type='submit'>Save</button>
                    </Col>
                </Row>
            </form>
        </Container>
    )
}

export default ProfileInfo