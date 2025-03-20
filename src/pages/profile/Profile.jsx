import React, { useEffect, useState } from 'react';
import { useParams, useHistory  } from 'react-router-dom/cjs/react-router-dom.min';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { Spinner, Button, OverlayTrigger, Tooltip, Image, Card, Nav, ProgressBar, Container, Row, Col, Form, Tabs, Tab} from 'react-bootstrap';
import appStyles from '../../App.module.css'
import AccountSecurity from './AccountSecurity';
import ProfileInfo from './ProfileInfo';
import { useRedirect } from '../../hooks/useRedirect';
const Profile = () => {
    // Hooks

    const history = useHistory()
    useRedirect()
    // Contexts
    const { currentUser, setCurrentUser } = useCurrentUser()
    // Initialize state variables
    const [profile, setProfile] = useState({})
    const [updated, setUpdated] = useState(false)
    // Initialise a state variable to determie button text
    const [deleted, setDeleted] = useState(false)
    const [edited, setEdited] = useState(false)

    // Handle Delete function
    const handleDelete = async () => {
        try {
            await axiosReq.delete('/users/me', {headers: {'Authorization': `Bearer ${currentUser?.token}`}})
            localStorage.clear()
            setCurrentUser(null)
            setDeleted(true)
        } catch (err) {
            // console.log(err)
        }
    }

    useEffect(() => {
        // Get the users profile data
        const fetchProfile = async () => {
            try {
                const response = await axiosReq.get(`/users/${currentUser?.user._id}`, {headers: {'Authorization': `Bearer ${currentUser?.token}`}})
                setProfile(response.data.profile)
            } catch (err) {
                // console.log(err)
            }
        }
        if (!deleted){
          fetchProfile()
        }
    }, [currentUser?.token, updated])

    return (
    <>
    {!deleted?
        <Tab.Container id="left-tabs-example" defaultActiveKey="first">
        <Row>
          <Col sm={3}>
          <Image src={profile.image} width={150}/>
			<h5>{profile.username}</h5>
            <Nav className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="first">Profile Info</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link href={`/films/${currentUser?.user._id}`}>Go to your Watchlist</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="second">Account Security</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="third">Delete Account</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          <Col sm={7}>
          
            <Tab.Content>
              <Tab.Pane eventKey="first">
				<ProfileInfo updated={updated} setUpdated={setUpdated} profile={profile} setProfile={setProfile} />
			  </Tab.Pane>
              <Tab.Pane eventKey="second">
				<AccountSecurity profile={profile} />
              </Tab.Pane>
              <Tab.Pane eventKey="third">            
                {/* CONFIRM MESSAGE */}
                          <h5>{!deleted? `Are you sure you want to delete your account for username ${currentUser?.user.username}?`: 'Your account has been deleted.'}</h5>
                          {/* YES / GO BACK BUTTONS */}
                          {!deleted?(
                             <>
                                  <Button variant='outline-secondary' onClick={handleDelete}>Yes</Button>
                             </> 
                          ):(
                              <>
                                   {/* LINK TO HOME PAGE ONCE ACCOUNT IS DELETED */}
                                   <Button onClick={() => history.push('/')}>Continue browsing films</Button> 
                              </>
                          )}
                </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container> :<>Your account has been deleted. Continue browsing films <Button onClick={() => history.push('/')} variant='link'>here</Button></>
    }
    </>

    )
}
export default Profile;