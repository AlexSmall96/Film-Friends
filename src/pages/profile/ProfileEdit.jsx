import React, { useEffect, useState } from 'react';
import { useParams, useHistory  } from 'react-router-dom/cjs/react-router-dom.min';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import {Form, Button} from 'react-bootstrap';
import { Spinner } from 'react-bootstrap';

const ProfileEdit = () => {
    // Hooks
    const { id } = useParams();
    const history = useHistory()

    // Initalize state variables
    const [profile, setProfile] = useState({})
    const [imageBase64, setImageBase64] = useState("");
    const [errors, setErrors] = useState({})
    const [success, setSuccess] = useState('')
    const [hasLoaded, setHasLoaded] = useState(false)

    // Contexts
    const { currentUser } = useCurrentUser()

    // Get profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axiosReq.get(`/users/${id}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                setProfile(response.data.profile)
                setHasLoaded(true)
            } catch (err) {
                console.log(err)
            }
        }
        fetchProfile()
    }, [id, currentUser.token])

    // Handle form submit with sign up details
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await axiosReq.patch('/users/me', {
                image: imageBase64 || null,
                username: profile.username,
                email: profile.email,
                age: profile.age,
                password: profile.password
            }, {headers: {'Authorization': `Bearer ${currentUser.token}`}});
            setSuccess('Details updated successfully')
        } catch (err) {
            if (!err.response){
                return console.log(err)
            }
            // Validation errors
            if (err.response.data.errors){
                setErrors(err.response.data.errors)
            }
            // Username/email already taken errors
            if (err.response.data.errorResponse){
                if (err.response.data.errorResponse.keyValue.username){
                    setErrors({username: 'Username taken.'})
                }
                if (err.response.data.errorResponse.keyValue.email){
                    setErrors({email: 'Email address taken.'})
                }
            }
        }
    };
    
    // Handle form data change
    const handleChange = (event) => {
      setProfile({
        ...profile, 
        [event.target.name]: event.target.value
      });
    };

    // receive file from form
    const handleImage = (e) => {
        const maxSize =  1024 * 1024
        const uploadedImage = e.target.files[0]
        if (!uploadedImage.name.match(/\.(jpg|jpeg|png|gif)$/)){
            return setErrors({image:"Please upload a valid image" , ...errors})
        }
        if (uploadedImage.size > maxSize){
            return setErrors({image:"File size must be less than 2 MB" , ...errors})
        }
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setImageBase64(reader.result);
          }
    };

    return (
        <>
        {hasLoaded? (
            <>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>Username:</Form.Label>
                        <Form.Control type='text' name='username' value={profile.username || ''} onChange={handleChange}/>
                    </Form.Group>
                    {errors.username? (errors.username.message? (<p>{errors.username.message}</p>):(<p>{errors.username}</p>)):('')}
                    <Form.Group>
                        <Form.Label>Email:</Form.Label>
                        <Form.Control type='text' name='email' value={profile.email || ''} onChange={handleChange}/>
                    </Form.Group>
                    {errors.email? (errors.email.message? (<p>{errors.email.message}</p>):(<p>{errors.email}</p>)):('')}
                    <Form.Group>
                        <Form.Label>Age:</Form.Label>
                        <Form.Control type='number' name='age' value={profile.age || ''} onChange={handleChange}/>
                    </Form.Group>
                    {errors.age? (<p>{errors.age.message}</p>):('')}
                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>Profile Picture:<img height={200} width={200} src={profile.image || 'https://res.cloudinary.com/dojzptdbc/image/upload/v1687104476/default_profile_k3tfhd.jpg'} alt={`Profile picture for ${profile.username}`} /></Form.Label>
                        <Form.Control 
                        type="file"
                        onChange={handleImage} />
                    </Form.Group>
                        <p>{errors.image || ''}</p>
                    <Button variant='outline-secondary' type='submit'>Update Details</Button>
                </Form>
                <p>{success || ''}</p>
                <Button variant='outline-secondary'>Reset password</Button>
                <Button variant='outline-secondary' onClick={() => history.goBack()}>Back to my profile</Button>
                <Button variant='outline-secondary' onClick={() => history.push(`/profile/delete/${id}`)}>Delete my account</Button>
            </>
        ):(<Spinner animation='border' />)}
        </>
    )
}

export default ProfileEdit