import React, { useState, useEffect } from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useCurrentUser } from '../../contexts/CurrentUserContext'
import { Button, Form, Image } from 'react-bootstrap';
import styles from '../../styles/Login.module.css'
import appStyles from '../../App.module.css'

// Login page
const Login = () => {
    // Declare hooks
    const history = useHistory()
    const { setCurrentUser  } = useCurrentUser()
    // Initialize state variables
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [disabled, setDisabled] = useState(true)

    // Handle change when user inputs data
    const handleChange = (event) => {
        setLoginData({
            ...loginData,
            [event.target.name]: event.target.value,
        });
        setError('')
    };

    // Make login button disabled if a field is left blank
    useEffect(() => {
        const { email, password } = loginData
        setDisabled(email === '' || password === '')
    }, [loginData])

    // Handle form submit with login details
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
          const response = await axiosReq.post('/users/login', loginData);
          setCurrentUser({user:response.data.user, token: response.data.token})
          history.push('/')
        } catch (err) {
            if (err.status === 400) {
                setError('Incorrect username or password.')
            } else {
                setError('Currently unable to login. Please try again later.')
            }
        }
    };

    return (
        <>
            <Image width={300} src='https://res.cloudinary.com/dojzptdbc/image/upload/v1730298790/loginImage_tpvqcy.png' alt='A film take board' />
            <Form onSubmit={handleSubmit} className={styles.form}>
                {/* EMAIL */}   
                <Form.Group className="mb-3">
                    <Form.Label id='email-lbl'>Email address</Form.Label>
                    <Form.Control onChange={handleChange} type="email" name='email' placeholder="Email" aria-labelledby='email-lbl' />
                </Form.Group>
                {/* PASSWORD */}
                <Form.Group className="mb-3">
                    <Form.Label id='password-lbl'>Password</Form.Label>
                    <Form.Control onChange={handleChange} type="password" name='password' placeholder="Password" aria-labelledby='password-lbl' />
                </Form.Group>
                
                {/* ERROR */}
                {error? (<p>{error}</p>):('')}
                <Button variant="outline-secondary" disabled={disabled} className={appStyles.roundButton} type="submit">
                    Login
                </Button>
                <p>
                    <Button variant='link' onClick={() => history.push('/resetPassword/sendOTP/')}>Forgotten password?</Button>
                </p>
                {/* SIGN UP LINK */}
                <p>Don't have an account?<Button variant='link' onClick={() => history.push('/signup')}>Sign up</Button></p>
            </Form>
        </>
    )
}
export default Login;