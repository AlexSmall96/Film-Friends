import React, {useState} from 'react';
import { Form, Button, Spinner, Image, ButtonGroup, Container } from 'react-bootstrap';
import { axiosReq } from '../../api/axiosDefaults';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useRecoveryData } from '../../contexts/RecoveryDataContext';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import styles from '../../styles/Profile.module.css'
import appStyles from '../../App.module.css'
/* 
Sends a OTP passcode to the email address provide by the user and verifies OTP. 
Is used to reset password, or update email address. 
The one time passcode functionality in this component was inspired by the below article
https://www.makeuseof.com/password-reset-forgot-react-node-how-handle/
*/

const SendOTP = ({resetPassword}) => {
    // Hooks
    const history = useHistory()
    // Initialize state variables
    const [formData, setFormData] = useState({
        email: '', OTP: ''
    })
    const [error, setError] = useState('')
    const [responseMessage, setResponseMessage] = useState('')
    const [generatedOTP, setGeneratedOTP] = useState(0)
    const [startTime, setStartTime] = useState(0)
    const [hasLoaded, setHasLoaded] = useState(true)
    const [verified, setVerified] = useState(false)
    const [expired, setExpired] = useState(false)
    // Contexts
    const { currentUser } = useCurrentUser()
    const { setRecoveryEmail  } = useRecoveryData()
    // Initial prompt to fill in form data
    const prompt = resetPassword? 
            'Enter the email address associated with your account. We will send you a one time passcode to reset your password'
        :
            'Please enter the new email address you want to use. We will send you a one time passcode to confirm the address.'

    // Checks if email address is valid and sends OTP to provided address
    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            // Reset variables and calculate new elapsed time
            setHasLoaded(false)
            setExpired(false)
            setStartTime(new Date().getTime() / 1000)
            // Generate new passcode
            const passcode = Math.floor(Math.random() * 900000 + 1000)
            setGeneratedOTP(passcode)
            // Attempt to send passcode
            const { email } = formData
            const response = await axiosReq.post('/users/sendEmail', {email, OTP: passcode, resetPassword})
            setResponseMessage(response.data.message)
            setError('')
            setRecoveryEmail(email)
            localStorage.setItem('recoveryEmail', JSON.stringify( email ))
            setHasLoaded(true)
        } catch (err) {
            // console.log(err)
            setError(err.response.data.error)
            setHasLoaded(true)
        }
    }

    const checkPasscode = async () => {
        // Calculate time elapsed since passcode was sent
        const currentTime = new Date().getTime() / 1000
        const elapsedTime = currentTime - startTime
        const timeLimit = 600 // Passcode expires after 10 minutes
        // Check if passcode has expired
        if (elapsedTime >= timeLimit){
            setExpired(true)
            return setResponseMessage('Passcode expired. Please resend to try again.')
        }
        // Assuming passcode not expired, check if match
        const { email, OTP } = formData
        const correctOTP = parseInt(OTP) === generatedOTP
        if (correctOTP && resetPassword) {
            // If page being used for password reset, push to resetPassword page
            return history.push('/resetPassword')
        }
        // Otherwise, page is being used to change email address 
        if (correctOTP){
            setVerified(true)
            // Update users email using verified address
            try {
                await axiosReq.patch('/users/me', {email}, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                setResponseMessage('OTP correct. Your email address has been updated.')
            } catch (err) {
                // console.log(err)
            }
        } else {
            setResponseMessage('Passcode incorrect. Please try again.')
        }
    }
    
    // Handle change for form data - email address and entered passcode
    const handleChange = (event) => {
        setFormData({
			...formData, [event.target.name]: event.target.value
		})
    }

    return (
        <Container>
            <div className={styles.otpImage}>
                <Image src='https://res.cloudinary.com/dojzptdbc/image/upload/v1744206272/shield1_zsajlz.png' fluid/>
            </div>
        <Form onSubmit={handleSubmit}>
            {hasLoaded?
                responseMessage?(
                    <>
                        {!verified?
                            <Form.Group>
                                <Form.Label className={appStyles.horizMargin}>{responseMessage}</Form.Label>
                                <Form.Control onChange={handleChange} value={formData.OTP} className={styles.passcodeInput} name='OTP' type='text' placeholder='* * * * * *' maxLength='6'/>
                                {!expired?
                                    <>
                                        <Button onClick={checkPasscode} variant='outline-secondary' className={`${appStyles.roundButton} ${appStyles.verticalMargin}`} type='button'>Verify</Button>
                                        <br />                             
                                    </> 
                                :''}
                                <br />
                                <ButtonGroup>
                                {!resetPassword?<Button variant='outline-secondary' className={appStyles.roundButton} onClick={() => history.goBack()}  type='button'><i className="fa-solid fa-user"></i> Back to Profile</Button> : ''}
                                    <Button type='submit' variant='outline-secondary' className={`${appStyles.roundButton}`}><i className="fa-solid fa-paper-plane"></i> Resend</Button>
                                </ButtonGroup>
                            </Form.Group>  
                        :''}
                        {verified? responseMessage : ''}
                        {!resetPassword && verified?
                        <>
                            <br />
                            <Button variant='outline-secondary' className={`${appStyles.roundButton} ${appStyles.verticalMargin}`} onClick={() => history.goBack()}  type='button'><i className="fa-solid fa-user"></i> Back to Profile</Button>
                        </>:''}
                    </>
                ):(
                    <>
                        <Form.Group>
                            <Form.Label>{prompt}</Form.Label>
                            <Form.Control onChange={handleChange} value={formData.email} className={styles.form} name='email' type='email' placeholder='youremail'/>
                        </Form.Group>
                        <p className={`${appStyles.verticalMargin} ${appStyles.smallFont}`}>{error || ''}</p>
                        <ButtonGroup>
                        {!resetPassword && !verified?<Button variant='outline-secondary' className={appStyles.roundButton} onClick={() => history.goBack()}  type='button'><i className="fa-solid fa-user"></i> Back to Profile</Button> : ''}
                            <Button variant='outline-secondary' className={appStyles.roundButton} type='submit'><i className="fa-solid fa-paper-plane"></i> Send</Button>
                        </ButtonGroup>
                    </>
                )
            : (<Spinner />)
            }
        </Form>
        </Container>
    )
}

export default SendOTP