import React, { useState } from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

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
            <h1>Sign up</h1>
            <form data-testid='signup-form' onSubmit={handleSubmit} >
                {/* USERNAME */}
                <label htmlFor='username' id='username-lbl'>Username:</label>
                <input type='text' name='username' aria-labelledby='username-lbl' onChange={handleChange}></input>
                {/* USERNAME ERROR */}
                {errors.username? (errors.username.message? (<p>{errors.username.message}</p>):(<p>{errors.username}</p>)):('')}
                {/* EMAIL */}   
                <label htmlFor='email' id='email-lbl'>Email:</label>
                <input type='text' name='email' aria-labelledby='email-lbl' onChange={handleChange}></input>
                {/* EMAIL ERROR */}
                {errors.email? (errors.email.message? (<p>{errors.email.message}</p>):(<p>{errors.email}</p>)):('')}
                {/* PASSWORD */}
                <label id='password-lbl' htmlFor='password'>Password:</label>
                <input type='password' aria-labelledby='password-lbl' name='password' onChange={handleChange}></input>
                {/* PASSWORD ERROR */}
                {errors.password? (<p>{errors.password.message}</p>):('')}
                <button type='submit'>Sign Up</button>
            </form>
        </>
    )
}
export default Signup;