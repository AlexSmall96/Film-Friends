import React, {useState} from 'react';
import { Form, Button, Image } from 'react-bootstrap';
import { axiosReq } from '../../api/axiosDefaults';
import { useRecoveryData} from '../../contexts/RecoveryDataContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import styles from '../../styles/ResetPassword.module.css'
import appStyles from '../../App.module.css'

/* 
Reset password page. User can recover password via email. 
If email address matches and one time passcode is correct, user is redirected to this page to change password.
*/ 
const ResetPassword = () => {
    // Initialise state variables
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    // Get recovery email from context
    const { recoveryEmail } = useRecoveryData()
    // Use history
    const history = useHistory()

    // Handle password change
    const handleChange = async (event) => {
        setPassword(event.target.value)
    } 

    // Submit new password
    const handleSubmit = async (event) => {
        event.preventDefault()
        console.log(recoveryEmail)
        try {
            await axiosReq.patch('/users/resetPassword', {password, email: recoveryEmail})
            localStorage.removeItem('recoveryEmail')
            setSuccess(true)
        } catch (err) {
            setError(err?.response?.data?.errors?.password?.message)
        }
    }

    return (
        <>   
            {/* IMAGE */}         
            <div className={styles.otpImage}>
                <Image src='https://res.cloudinary.com/dojzptdbc/image/upload/v1744208978/shield2_la4qcz.png' fluid/>
            </div>
            {/* FORM */}
            {!success?
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>OTP passcode correct. Enter new password:</Form.Label>
                        <Form.Control className={styles.form} onChange={handleChange} value={password} type='password' placeholder='password'/>
                    </Form.Group>
                    <p>{error || ''}</p>
                    <Button variant='outline-secondary' className={appStyles.roundButton} type='submit'>Update Password</Button> 
                </Form>
            :
                <p>Password updated <Button variant='link' onClick={() => history.push('/login')}>Click here to login</Button></p>
            }
        </>    
    )
    
}

export default ResetPassword
