import React, { useEffect, useState } from 'react';
import { useHistory  } from 'react-router-dom/cjs/react-router-dom.min';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { Button, Container,   Image, Nav, Tab, Row, Col} from 'react-bootstrap';
import appStyles from '../../App.module.css'
import styles from '../../styles/Profile.module.css'
import AccountSecurity from './AccountSecurity';
import ProfileInfo from './ProfileInfo';
import { useRedirect } from '../../hooks/useRedirect';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const Profile = ({activeKey}) => {
    // Hooks
    const history = useHistory()
	const { width } = useWindowDimensions()
    useRedirect()
    // Contexts
    const { currentUser, setCurrentUser } = useCurrentUser()
    // Initialize state variables
    const [profile, setProfile] = useState({})
    const [updated, setUpdated] = useState(false)
    // Initialise a state variable to determie button text
    const [deleted, setDeleted] = useState(false)

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
			<>	{ width < 360 ? <h5 className={`${appStyles.verticalMargin} ${appStyles.headingFont}`}>{profile.username}</h5>: ''}
				<Container className={styles.profileBox}>
					<Tab.Container defaultActiveKey={activeKey}>
						<Row>
							<Col md={3} sm={4} xs={12} className={`${appStyles.noPadding} ${styles.underline}`}>
								<Row>
									<Col sm={12} xs={5} className={styles.imageMobile} >
										<Image src={profile.image} fluid />
									</Col>
									<Col sm={12} xs={7} className={styles.navMobile}>
									{ width >= 360 ? <h5 className={`${appStyles.verticalMargin} ${appStyles.headingFont}`}>{profile.username}</h5>: ''}
										<Nav variant="pills" className={`flex-column ${styles.profileNav} ${appStyles.smallFont}`}>
											<Nav.Item className={styles.navItem}>
												<Nav.Link eventKey="first"><i className="fa-solid fa-user"></i> Profile Info</Nav.Link>
											</Nav.Item>
											<Nav.Item>
												<Nav.Link href={`/films/${currentUser?.user._id}`}><i className="fa-solid fa-clapperboard"></i> Your Watchlist</Nav.Link>
											</Nav.Item>
											<Nav.Item>
												<Nav.Link eventKey="second"><i className="fa-solid fa-shield-halved"></i> Account Security</Nav.Link>
											</Nav.Item>
											<Nav.Item>
												<Nav.Link eventKey="third"><i className="fa-solid fa-trash-can"></i> Delete Account</Nav.Link>
											</Nav.Item>
										</Nav>
									</Col>
								</Row>
							</Col>
							<Col md={9} sm={8} xs={12} className={styles.mainSection}>
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
					</Tab.Container>
				</Container>
			</>
			:
				<>
					Your account has been deleted. Continue browsing films 
					<Button onClick={() => history.push('/')} variant='link'>here</Button>
				</>

			}
		</>
    )
}
export default Profile;