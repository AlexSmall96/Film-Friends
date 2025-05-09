import React, { useEffect, useState } from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { Button, Container,   Image, Nav, Tab, Row, Col} from 'react-bootstrap';
import appStyles from '../../App.module.css'
import styles from '../../styles/Profile.module.css'
import AccountSecurity from './AccountSecurity';
import ProfileEdit from './ProfileEdit';
import { useRedirect } from '../../hooks/useRedirect';
import useWindowDimensions from '../../hooks/useWindowDimensions';

// Displays users image along with tabs containing different sections of profile data: username, image, account security and delete account.
const Profile = ({activeKey}) => {
    // Hooks
	const { width } = useWindowDimensions()
    useRedirect()
    // Contexts
    const { currentUser, setCurrentUser, setAccountDeleted } = useCurrentUser()
    // Initialize state variables
    const [profile, setProfile] = useState({})
	const [username, setUsername] = useState('')
    const [updated, setUpdated] = useState(false)
	const [hasLoaded, setHasLoaded] = useState(false)
    // Handle Delete function
    const handleDelete = async () => {
        try {
            await axiosReq.delete('/users/me', {headers: {'Authorization': `Bearer ${currentUser?.token}`}})
            localStorage.clear()
			setAccountDeleted(true)
            setCurrentUser(null)
        } catch (err) {
            // console.log(err)
        }
    }

    useEffect(() => {
        // Get the users profile data
        const fetchProfile = async () => {
            try {
                const response = await axiosReq.get(`/users/${currentUser?.user._id}`, {headers: {'Authorization': `Bearer ${currentUser?.token}`}})
				const profileReponse = response.data.profile
				setProfile(profileReponse)
				const usernameResponse = profileReponse.username
				const image = profileReponse.image
				setCurrentUser({ ...currentUser, user: {...currentUser.user, username: usernameResponse, image}})
				setUsername(usernameResponse)
				setHasLoaded(true)
            } catch (err) {
                console.log(err)
            }
        }
        fetchProfile()
    }, [currentUser?.token, updated, setCurrentUser])

    return (
		<>
			{ width < 360 ? <h5 className={`${appStyles.verticalMargin} ${appStyles.headingFont}`}>{profile.username}</h5>: ''}
				<Container className={styles.profileBox}>
					{/* TABS TO NAVIGATE BETWEEN SECTIONS */}
					<Tab.Container defaultActiveKey={activeKey}>
						<Row>
							<Col md={3} sm={4} xs={12} className={`${appStyles.noPadding} ${styles.underline}`}>
								<Row>
									<Col sm={12} xs={5} className={styles.imageMobile} >
										<Image src={profile.image} fluid />
									</Col>
									<Col sm={12} xs={7} className={styles.navMobile}>
									{ width >= 380 ? <h5 className={`${appStyles.verticalMargin} ${appStyles.headingFont}`}>{profile.username}</h5>: ''}
										<Nav variant="pills" className={`flex-column ${styles.profileNav} ${appStyles.smallFont}`}>
											<Nav.Item className={styles.navItem}>
												<Nav.Link eventKey="first"><i className="fa-solid fa-user"></i> Edit Profile</Nav.Link>
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
									{/* PROFILE EDIT */}
									<Tab.Pane eventKey="first">
										<ProfileEdit 
											setUpdated={setUpdated} 
											hasLoaded={hasLoaded} 
											setHasLoaded={setHasLoaded}
											username={username}
											setUsername={setUsername} />
									</Tab.Pane>
									{/* ACCOUNT SECURITY */}
									<Tab.Pane eventKey="second">
										<AccountSecurity profile={profile} />
									</Tab.Pane>
									<Tab.Pane eventKey="third">            
										{/* CONFIRM MESSAGE */}
										<h5 className={`${appStyles.verticalMargin} ${appStyles.headingFont}`}>Delete Account</h5>
										<div className={styles.deleteImage}>
											<Image src='https://res.cloudinary.com/dojzptdbc/image/upload/v1744292137/delete_xxsq7c.png' fluid />
										</div>
										<p><span className={appStyles.warning}>Warning:</span> If you delete your account, your data will be deleted and cannot be recovered.</p>
										{/* YES / GO BACK BUTTONS */}
											<Button variant='warning' onClick={handleDelete}>Delete Account</Button>
									</Tab.Pane>
								</Tab.Content>
							</Col>
						</Row>
					</Tab.Container>
				</Container>
			</>
    )
}
export default Profile;