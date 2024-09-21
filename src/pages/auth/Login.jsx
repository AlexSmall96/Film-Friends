import React, { useState } from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useCurrentUser } from '../../contexts/CurrentUserContext'

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

    // Handle change when user inputs data
    const handleChange = (event) => {
        setLoginData({
            ...loginData,
            [event.target.name]: event.target.value,
        });
    };

    // Handle form submit with login details
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
          const response = await axiosReq.post('/users/login', loginData);
          setCurrentUser({user:response.data.user, token: response.data.token})
          localStorage.setItem('storedUser', JSON.stringify({user:response.data.user, token: response.data.token}));
          history.push('/')
        } catch (err) {
            if (err.status === 400) {
                setError('Incorrect username or password')
            } else {
                setError('Currently unable to login. Please try again later.')
            }
        }
    };
    // Render login page
    return (
        <>
            <h1>Login</h1>
            <form onSubmit={handleSubmit} >
                {/* EMAIL */}
                <label htmlFor='email' id='email-lbl'>Email:</label>
                <input type='text' name='email' aria-labelledby='email-lbl' onChange={handleChange}></input>
                {/* PASSWORD */}
                <label htmlFor='password' id='password-lbl'>Password:</label>
                <input type='password' aria-labelledby='password-lbl' name='password' onChange={handleChange}></input>
                <button type='submit'>Login</button>
                {/* ERROR */}
                {error? (<p>{error}</p>):('')} 
            </form>
        </>
    )
}
export default Login;