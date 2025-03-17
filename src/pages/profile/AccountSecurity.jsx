import React, { useState } from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import { useHistory  } from 'react-router-dom/cjs/react-router-dom.min';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import {Container, Row, Col} from 'react-bootstrap'

const AccountSecurity = ({profile}) => {
    const { currentUser } = useCurrentUser()
    const history = useHistory()
    const [formData, setFormData] = useState({
            password0: '',
            password1: '',
            password2: ''
    })
    const [message, setMessage] = useState({})
    const [disabled, setDisabled] = useState(true)
    
    const handleSubmitPassword = async (event) => {
        event.preventDefault()
        const {password0, password1, password2} = formData
      if (password1 === password2 && password1 !== ''){
          try {
              await axiosReq.patch('/users/me', {currPassword: password0, newPassword: password1}, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
              setMessage({password: 'Password updated successfully.'})
              setFormData({
                    password0: '',
                    password1: '',
                    password2: ''
                })
                setDisabled(true)
          } catch (err) {
              if (err.response.data.errors?.password?.message){
                  setMessage({password:err.response.data.errors.password.message})
              } else {
                  setMessage({password:'Currently unable to change password due to system issues. Please try again later.'})
              }
          }
      } else {
          setMessage({password: 'Passwords do not match'})
      }
    }

    const handleChangePassword = (event) => {
		setFormData({
			...formData, [event.target.name]: event.target.value
		})
        setDisabled(false)
	}

    return(
        <Container>
        <h4>Account Security</h4>
        <p>Update your email and password here:</p>
            <form onSubmit={handleSubmitPassword}>
                <Row>
                    <p>Email:</p>
                    <p>
                        <label htmlFor='email'>Current Email Address: </label>
                        <input type='text' name='email' placeholder={profile.email} disabled />
                        <button type='button' onClick={() => history.push('/changeEmail/sendOTP')}><i className="fa-solid fa-pen"></i></button>
                    </p>
                </Row>
                <p>Password:</p>
                
                <Row>
                    <input type='password' name='password0' value={formData.password0 || ''} placeholder='Enter current password' onChange={handleChangePassword} />
                </Row>
                <Row>
                    <input type='password' name='password1' value={formData.password1 || ''} placeholder='Enter new password' onChange={handleChangePassword} />
                </Row>
                <Row>
                    <input type='password' name='password2' value={formData.password2 || ''} placeholder='Confirm new password' onChange={handleChangePassword} />
                </Row>
                    {message.password || ''}
                    <button disabled={disabled} type='submit'>Change Password</button>
                

            </form>        
        </Container>

    ) 
}

export default AccountSecurity