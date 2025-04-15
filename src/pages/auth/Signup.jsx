import React, { useState } from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { Button, Form, Image } from 'react-bootstrap';
import styles from '../../styles/Signup.module.css';

const Signup = () => {
    // Declare hooks
    const history = useHistory()

    // Initialize state variables
    const [signUpData, setSignUpData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password:''
    });

    // Handle change when user inputs data
    const handleChange = (event) => {
        setSignUpData({
            ...signUpData,
            [event.target.name]: event.target.value,
        });
    };

    // Handle form submit with sign up details
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
          await axiosReq.post('/users', signUpData);
          history.push('/login')
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

    // Render signup page
    return (
        <>
            <Image width={300} src='https://res.cloudinary.com/dojzptdbc/image/upload/v1730293188/signupImage_ohgj8z.png' alt='A roll of film tape'></Image>
            <Form onSubmit={handleSubmit} className={styles.form}>
                {/* EMAIL */}
                <Form.Group className="mb-3">
                    <Form.Label id='email-lbl'>Email address</Form.Label>
                    <Form.Control onChange={handleChange} type="email" name='email' placeholder="Email" aria-labelledby='email-lbl' />
                </Form.Group>
                {/* EMAIL ERROR */}
                {errors.email? (errors.email.message? (<p>{errors.email.message}</p>):(<p>{errors.email}</p>)):('')}
                {/* USERNAME */}
                <Form.Group className="mb-3">
                    <Form.Label id='username-lbl'>Username</Form.Label>
                    <Form.Control onChange={handleChange} type="text" name='username' placeholder="Username" aria-labelledby='username-lbl'/>
                </Form.Group>
                {/* USERNAME ERROR */}
                {errors.username? (errors.username.message? (<p>{errors.username.message}</p>):(<p>{errors.username}</p>)):('')}
                {/* PASSWORD */}
                <Form.Group className="mb-3">
                    <Form.Label id='password-lbl'>Password</Form.Label>
                    <Form.Control onChange={handleChange} type="password" name='password' placeholder="Password" aria-labelledby='password-lbl' />
                </Form.Group>
                {/* PASSWORD ERROR */}
                {errors.password? (<p>{errors.password.message}</p>):('')}
                <Button variant="secondary" type="submit">
                    Sign Up
                </Button>
                <p>Already have an account?<Button variant='link' onClick={() => history.push('/login')}>Login</Button></p>
            </Form>
        </>
    )
}
export default Signup;