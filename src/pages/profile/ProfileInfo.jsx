import React, { useEffect, useState } from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import { useHistory  } from 'react-router-dom/cjs/react-router-dom.min';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import {Container, Row, Col, Image} from 'react-bootstrap'

const ProfileInfo = ({setUpdated, updated}) => {
    const { currentUser, setCurrentUser, updateStoredUser } = useCurrentUser()
    const [message, setMessage] = useState({})
    const [username, setUsername] = useState('')
    const [imageBase64, setImageBase64] = useState("");
    const [file, setFile] = useState('https://res.cloudinary.com/dojzptdbc/image/upload/v1687104476/default_profile_k3tfhd.jpg')

    useEffect(() => {
        setUsername(currentUser.user.username)
    }, [])

    const handleUsernameChange = (event) => {
        setUsername(event.target.value)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        const imageUploaded = imageBase64 !== ""
        const usernameChanged = username !== currentUser.user.username
        try {
            let update = {}
            if (imageUploaded){
                update.image = imageBase64
            }
            if (usernameChanged){
                update.username = username
            }
            const response = await axiosReq.patch('/users/me', update, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            setUpdated(!updated)
            setMessage({username: usernameChanged ? 'Username updated successfully' : '', image: imageUploaded ? 'Profile Picture updated successfully':''})
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

    // The code to convert an image to base 64 was taken from https://dev.to/njong_emy/how-to-store-images-in-mongodb-using-cloudinary-mern-stack-imo
    // The code to set the preview file was taken from https://www.geeksforgeeks.org/how-to-upload-image-and-preview-it-using-reactjs/
    const handleImage = (e) => {
        const maxSize =  1024 * 1024
        const uploadedImage = e.target.files[0]
        if (!uploadedImage.name.match(/\.(jpg|jpeg|png|gif)$/)){
            return setMessage({image:"Please upload a valid image"})
        }
        if (uploadedImage.size > maxSize){
            return setMessage({image:"File size must be less than 2 MB"})
        }
        setMessage({...message, image: ''})
        setFile(URL.createObjectURL(e.target.files[0]));
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setImageBase64(reader.result);
        }
    };

    return(
        <Container>
            <form onSubmit={handleSubmit}>
                <Row>
                    <p>Username</p>
                    <p>
                        <input type='text' name='username' value={username || ''} onChange={handleUsernameChange} />
                        {message.username || ''}
                    </p>
                </Row>
                <Row>
                    <p>Picture</p>
                    <Col md={6}>
                    Image Preview
                        <Image roundedCircle src={file || 'https://res.cloudinary.com/dojzptdbc/image/upload/v1687104476/default_profile_k3tfhd.jpg'} fluid width={150} />                    
                    </Col>
                    <Col md={6}>
                        <input type='file' name='picture' onChange={handleImage}/>
                        {message.image || ''}
                        <button type='submit'>Save</button>
                    </Col>
                </Row>
            </form>

            
        </Container>
    )
}

export default ProfileInfo