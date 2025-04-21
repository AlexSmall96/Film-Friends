import React, { useState } from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import { useHistory  } from 'react-router-dom/cjs/react-router-dom.min';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import {Container, Form, Button, InputGroup} from 'react-bootstrap'
import appStyles from '../../App.module.css'

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
        setMessage({})
	}

    return(
        <Container>
        <h5 className={`${appStyles.verticalMargin} ${appStyles.headingFont}`}>Account Security</h5>
            <span className={`${appStyles.leftAlign} ${appStyles.smallFont}`}>Email:</span>
            <InputGroup className="mb-3">
                <Form.Control
                        type="text"
                        name='email' value={profile.email || ''}
                        disabled
                />
                <Button type='button' variant='outline-secondary' onClick={() => history.push('/changeEmail/sendOTP')}><i className="fa-solid fa-pen"></i></Button>
            </InputGroup>
        <Form onSubmit={handleSubmitPassword}>
            <span className={`${appStyles.leftAlign} ${appStyles.smallFont}`}>Password:</span>
            <Form.Group>
                <Form.Control
                    name='password0'
                    type="password"
                    value={formData.password0 || ''}
                    placeholder='Enter current password'
                    onChange={handleChangePassword}
                />
                <Form.Control
                    name='password1'
                    type="password"
                    value={formData.password1 || ''}
                    placeholder='Enter new password'
                    onChange={handleChangePassword}
                />
                <Form.Control
                    name='password2'
                    type="password"
                    value={formData.password2 || ''}
                    placeholder='Confirm new password'
                    onChange={handleChangePassword}
                />
                <Form.Text muted>{message.password || ''}</Form.Text>
            </Form.Group>
            <Button disabled={disabled} variant='outline-secondary' className={`${appStyles.roundButton} ${appStyles.verticalMargin}`} type='submit'>Change Password</Button>
         </Form>
        </Container>

    ) 
}

export default AccountSecurity