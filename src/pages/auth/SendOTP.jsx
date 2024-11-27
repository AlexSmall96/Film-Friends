import React, {useState} from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { axiosReq } from '../../api/axiosDefaults';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useRecoveryEmail } from '../../contexts/RecoveryEmailContext';
/* 
The one time passcode functionality in this component was inspired by the below article
https://www.makeuseof.com/password-reset-forgot-react-node-how-handle/
*/
const SendOTP = () => {
    const history = useHistory()
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [buttonText, setButtonText] = useState('Send')
    const [OTP, setOTP] = useState('')
    const [generatedOTP, setGeneratedOTP] = useState(Math.floor(Math.random() * 9000 + 1000))
    const { setRecoveryEmail  } = useRecoveryEmail()
    const [hasLoaded, setHasLoaded] = useState(true)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setHasLoaded(false)
        // Check if email address belongs to an account
        try {
            const response = await axiosReq.post('/users/sendEmail', {email, OTP: generatedOTP})
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
            history.push('/resetPassword')
        }
        setMessage('Passcode incorrect. Please try again.')
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
                        <Form.Group>
                            <Form.Label>{message}</Form.Label>
                            <Form.Control onChange={handleOTPChange} value={OTP} type='text' placeholder='your passcode'/>
                        </Form.Group>
                        <Button onClick={checkPasscode} type='button'>Verify</Button>
                    </>
                ):(
                    <>
                    <Form.Group>
                        <Form.Label>Enter the email address associated with your account</Form.Label>
                        <Form.Control onChange={handleChange} value={email} type='email' placeholder='youremail'/>
                    </Form.Group>
                    <p>
                        {error || ''}
                    </p>
                    <Button type='submit'>{buttonText}</Button>
                </>
                )
            : (<Spinner />)
            }
        </Form>
    )
}

export default SendOTP