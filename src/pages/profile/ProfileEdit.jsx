import React, { useState } from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import {Button, Container, Row, Form, Spinner} from 'react-bootstrap'
import appStyles from '../../App.module.css'
import styles from '../../styles/ProfileInfo.module.css'
import Avatar from '../../components/Avatar';

const ProfileEdit = ({setUpdated, hasLoaded, setHasLoaded, username, setUsername}) => {

    const { currentUser } = useCurrentUser()
    const [message, setMessage] = useState({})
    const [usernameChanged, setUsernameChanged] = useState(false)
    const [imageBase64, setImageBase64] = useState("");
    const defaultImage = 'https://res.cloudinary.com/dojzptdbc/image/upload/v1744367162/defaultProfile_wpgqrx.png'
    const [file, setFile] = useState(defaultImage)
    const [disabled, setDisabled] = useState(true)

    const handleUsernameChange = (event) => {
        setUsername(event.target.value)
        setDisabled(event.target.value === '' || event.target.value === currentUser.user.username)
        setMessage({})
        setUsernameChanged(event.target.value !== '' && event.target.value !== currentUser.user.username)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        const imageUploaded = imageBase64 !== ""
        setHasLoaded(false)
        setMessage({})
        try {
            let update = {}
            if (imageUploaded){
                update.image = imageBase64
            }
            if (usernameChanged){
                update.username = username
            }
            const response = await axiosReq.patch('/users/me', update, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            setUpdated(current => !current)
            setMessage({username: usernameChanged ? 'Username updated successfully' : '', image: imageUploaded ? 'Profile Picture updated successfully':''})
            setUsernameChanged(false)
            setFile(defaultImage)
            setImageBase64('')
            setDisabled(true)
            localStorage.setItem('storedUser', JSON.stringify({user:response.data.user, token: response.data.token}));
            setHasLoaded(true)
        } catch (err) {
            setHasLoaded(true)
            if (err?.response?.data?.errorResponse){
                setMessage({username: 'Username taken. Please select a different username'})
            } else {
                setMessage({password:'Currently unable to change username due to system issues. Please try again later.'})
            }
        }
    }

    // The code to convert an image to base 64 was taken from https://dev.to/njong_emy/how-to-store-images-in-mongodb-using-cloudinary-mern-stack-imo
    // The code to set the preview file was taken from https://www.geeksforgeeks.org/how-to-upload-image-and-preview-it-using-reactjs/
    const handleImage = (event) => {
        const maxSize =  1024 * 1024
        const uploadedImage = event.target.files[0]
        setMessage({})
        if (!uploadedImage.name.match(/\.(jpg|jpeg|png|gif)$/)){
            return setMessage({image:"Please upload a valid image"})
        }
        if (uploadedImage.size > maxSize){
            return setMessage({image:"File size must be less than 2 MB"})
        }
        setDisabled(false)
        setFile(URL.createObjectURL(event.target.files[0]));
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setImageBase64(reader.result);
        }
    };

    return(
        <Container>
            {hasLoaded?
                <div className={styles.wrapper}>
                    <h5 className={`${appStyles.verticalMargin} ${appStyles.headingFont}`}>Edit Profile</h5>
                    <Form onSubmit={handleSubmit}>
                        <Row >    
                            <Form.Group className={appStyles.noPadding}>
                                <span className={`${appStyles.leftAlign} ${appStyles.smallFont}`}>Username:</span>
                                    <Form.Control
                                        type="text"
                                        name='username' value={username || ''}
                                        onChange={handleUsernameChange}
                                    />
                                <Form.Text  muted>{message.username || ''}</Form.Text>
                            </Form.Group>
                        </Row>
                        <Row>
                        <span className={`${appStyles.leftAlign} ${appStyles.smallFont} ${appStyles.verticalMargin} ${appStyles.noPadding}`}>Profile Picture:</span>
                            <div className={styles.imageBox}>
                                <Avatar src={file || 'https://res.cloudinary.com/dojzptdbc/image/upload/v1744367162/defaultProfile_wpgqrx.png'} height={180} />
                            </div>
                        </Row>
                        <Row>
                            <Form.Group className={`${appStyles.noPadding}`}>
                                <Form.Label className={appStyles.smallFont}>Image Preview</Form.Label>
                                <Form.Control className={appStyles.smallFont} type='file' name='picture' onChange={handleImage} />
                                <Form.Text muted>{message.image || ''}</Form.Text>
                            </Form.Group>
                                <Button disabled={disabled} variant='outline-secondary' className={`${appStyles.roundButton} ${appStyles.verticalMargin}`} type='submit'>Save</Button> 
                        </Row>
                    </Form>
                </div>
            :<Spinner className={appStyles.bigVerticalMargin} />}
        </Container>
    )
}

export default ProfileEdit