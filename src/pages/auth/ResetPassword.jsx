import React, {useState} from 'react';
import { Form, Button, Image } from 'react-bootstrap';
import { axiosReq } from '../../api/axiosDefaults';
import { useRecoveryData} from '../../contexts/RecoveryDataContext';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import styles from '../../styles/Profile.module.css'
import appStyles from '../../App.module.css'

const ResetPassword = () => {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { recoveryEmail } = useRecoveryData()
    const { currentUser } = useCurrentUser()
    const history = useHistory()
    const [success, setSuccess] = useState(false)
    const handleChange = async (event) => {
        setPassword(event.target.value)
    } 

    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            await axiosReq.patch('/users/resetPassword', {password, email: recoveryEmail.email})
            localStorage.removeItem('recoveryEmail')
            setSuccess(true)
        } catch (err) {
            setError(err?.response?.data?.errors?.password?.message)
        }
    }

    return (
        <>            
            <div className={styles.otpImage}>
                <Image src='https://res.cloudinary.com/dojzptdbc/image/upload/v1744208978/shield2_la4qcz.png' fluid/>
            </div>
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
                <>
                <p>Password updated <Button variant='link' onClick={() => history.push('/login')}>Click here to login</Button></p>
                </>
            }
        </>    
    )
    
}

export default ResetPassword
