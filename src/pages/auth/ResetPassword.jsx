import React, {useState} from 'react';
import { Form, Button } from 'react-bootstrap';
import { axiosReq } from '../../api/axiosDefaults';
import { useRecoveryEmail } from '../../contexts/RecoveryEmailContext';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const ResetPassword = () => {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { recoveryEmail } = useRecoveryEmail()
    const { currentUser } = useCurrentUser()
    const history = useHistory()
    const [success, setSuccess] = useState(false)
    const handleChange = async (event) => {
        setPassword(event.target.value)
    } 

    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            await axiosReq.patch('/users/resetPassword', {email: recoveryEmail || currentUser?.user.email, password})
            localStorage.removeItem('recoveryEmail')
            setSuccess(true)
        } catch (err) {
            setError(err.response.data.errors.password.message)
        }
    }

    return (
        <>
            {!success?
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>Enter new password:</Form.Label>
                        <Form.Control onChange={handleChange} value={password} type='password' placeholder='password'/>
                    </Form.Group>
                    <p>{error || ''}</p>
                    <Button type='submit'>Update Password</Button> 
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
