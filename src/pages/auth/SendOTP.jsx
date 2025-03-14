import React, {useState} from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { axiosReq } from '../../api/axiosDefaults';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useRecoveryEmail } from '../../contexts/RecoveryEmailContext';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
/* 
The one time passcode functionality in this component was inspired by the below article
https://www.makeuseof.com/password-reset-forgot-react-node-how-handle/
*/
const SendOTP = ({changeEmail}) => {
    const history = useHistory()
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [buttonText, setButtonText] = useState('Send')
    const [OTP, setOTP] = useState('')
    const [generatedOTP, setGeneratedOTP] = useState(Math.floor(Math.random() * 900000 + 1000))
    const { setRecoveryEmail  } = useRecoveryEmail()
    const [hasLoaded, setHasLoaded] = useState(true)
    const [verified, setVerified] = useState(false)
    const { currentUser, setCurrentUser } = useCurrentUser()

    const handleSubmit = async (event) => {
        event.preventDefault()
        setHasLoaded(false)
        // Check if email address belongs to an account
        try {
            const response = await axiosReq.post('/users/sendEmail', {email, OTP: generatedOTP, resetPassword: !changeEmail})
            setMessage(response.data.message)
            setError('')
            setRecoveryEmail(email)
            localStorage.setItem('recoveryEmail', JSON.stringify({email}))
            setError('')
            setHasLoaded(true)
        } catch (err) {
            setError(err.response.data.error)
            setHasLoaded(true)
        }
    }

    const checkPasscode = async () => {
        if (parseInt(OTP) === generatedOTP) {
            if (changeEmail){
                setVerified(true)
                
                // Make request to update email adress
                try {
                    const response = await axiosReq.patch('/users/me', {email}, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                    setMessage('OTP correct. Your email address has been updated.')
                } catch (err) {
                    console.log(err)
                }
            } else {
                history.push('/resetPassword')
            }
        } else {
            setMessage('Passcode incorrect. Please try again.')
        }
    }
    
    const handleChange = (event) => {
        setEmail(event.target.value)
    }

    const handleOTPChange = (event) => {
        setOTP(event.target.value)
    }

    return (
        <Form onSubmit={handleSubmit}>
            {hasLoaded?
                message?(
                    <>
                        {!verified?
                            <Form.Group>
                                <Form.Label>{message}</Form.Label>
                                <Form.Control onChange={handleOTPChange} value={OTP} type='text' placeholder='your passcode'/>
                                <Button onClick={checkPasscode} type='button'>Verify</Button> 
                            </Form.Group>  : ''               
                        }
                        {verified? message :''}
                        {changeEmail? <Button onClick={() => history.goBack()} type='button'>Back to Profile</Button> : ''}
                      
                    </>
                ):(
                    <>
                    <Form.Group>
                        <Form.Label>
                            {changeEmail? 
                            'Please enter the new email address you want to use. We will send you a one time passcode to confirm the address.'
                            :
                            'Enter the email address associated with your account. We will send you a one time passcode to reset your password'}
                        </Form.Label>
                        <Form.Control onChange={handleChange} value={email} type='email' placeholder='youremail'/>
                    </Form.Group>
                    <p>
                        {error || ''}
                    </p>
                    {changeEmail? <Button onClick={() => history.goBack()}  type='button'>Back to Profile</Button> : ''}
                    <Button type='submit'>{buttonText}</Button>
                </>
                )
            : (<Spinner />)
            }
        </Form>
    )
}

export default SendOTP