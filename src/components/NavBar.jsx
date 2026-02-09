import React, {useEffect, useState} from 'react';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { Navbar, Nav, Image, NavDropdown, Offcanvas, Col, Container, Row, Card} from 'react-bootstrap'
import { Link } from 'react-router-dom/cjs/react-router-dom';
import appStyles from '../App.module.css'
import styles from '../styles/NavBar.module.css'
import useWindowDimensions from '../hooks/useWindowDimensions';
import Avatar from './Avatar';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const NavBar = () => {
    // Contexts
    const { currentUser, setCurrentUser, setIsGuest, isGuest } = useCurrentUser()
    // Hooks
    const { width } = useWindowDimensions();
    const history = useHistory()
    // Initialize state variables
    const [expanded, setExpanded] = useState(false)
    // Handle logout
    const handleLogout = async () => {
        localStorage.clear()
        try {
            await axiosReq.post('/users/logout', {}, {headers: {'Authorization': `Bearer ${currentUser?.token}`}})
            setCurrentUser(null)
            setExpanded(false)
        } catch(err) {
            console.log(err)
        }
    }

    // Handle login to guest account
    const handleGuestLogin = async () => {
        try {
            const response = await axiosReq.post('/users/guest-login')
            setCurrentUser({user:response.data.user, token: response.data.token})
            setIsGuest(true)
            history.push('/')
        } catch (err){
            console.log(err)
        }
    }
    
    useEffect(() => {
        if (width > 767){
            setExpanded(false)
        }
    }, [width])

    // Ensure nav bar is collapsed when user clicks another part of screen
    document.addEventListener('mouseup', (event) => {
        if (!event.target.classList.contains('offcanvas-body')){
            setExpanded(false) 
        }
    })

    const handleClick = () => {
        setExpanded(false)
    }

    const linkTextAndActions = [
        {
            href:'/profile/', 
            text: 'Profile', 
            icon: 'fa-solid fa-user', 
            onClick: handleClick,
            disabled: false
        }, {
            href:'/account/security', 
            text: 'Account Security', 
            icon: 'fa-solid fa-shield-halved', 
            onClick: handleClick,
            disabled: false
        },{
            href:'/', 
            text: 'Logout', 
            icon: 'fa-solid fa-right-from-bracket', 
            onClick: handleLogout,
            disabled: false
        },{
            href:'/account/delete', 
            text: isGuest ? " Cannot delete account as guest" : " Delete Account", 
            icon: 'fa-solid fa-trash-can', 
            onClick: isGuest? null : handleClick, 
            disabled: isGuest
        }
    ]

    // Logged in icons: films, friends, reccomendations, user dropdown
    const loggedInIcons = 
    <>  
        {width <= 767? 
            <Nav.Link href='/' onClick={handleClick}> 
                <i className="fa-solid fa-home"></i> Home
            </Nav.Link>
        :''}
        <Nav.Link href={`/films/${currentUser?.user._id}`} onClick={handleClick}>
            <i className="fa-solid fa-clapperboard"></i> My Films
        </Nav.Link>
        <Nav.Link href='/friends' onClick={handleClick}>
            <i className="fa-solid fa-users"></i> Friends
        </Nav.Link>
        <Nav.Link href='/reccomendations' onClick={handleClick} className={width <= 767? styles.underlineSection:''}>
            <i className="fa-solid fa-envelope"></i> Reccomendations
        </Nav.Link>

        {/* MOBILE VIEW */}
        {width <= 767?(
            <div className={styles.underlineSection}>
                {linkTextAndActions.map((link, index) => (
                    <Nav.Link key={index} href={link.href} onClick={link.onClick} disabled={link.disabled} className={link.disabled? appStyles.grey: ''}>
                        <i className={link.icon}></i> {link.text}
                    </Nav.Link>                    
                ))}
            </div>
        ):(
            <NavDropdown title={<Avatar src={currentUser?.user.image} />} id="basic-nav-dropdown" drop='start'>
                {linkTextAndActions.map((link, index) => (
                    <NavDropdown.Item key={index} href={link.href} onClick={link.onClick} disabled={link.disabled}>
                        <i className={link.icon}></i> {link.text}
                    </NavDropdown.Item>                    
                ))}
            </NavDropdown>
        )}

    </>

    // Logged out icons: sign up and log in
    const loggedOutIcons = 
    <>
        <Nav.Link href='/signup' onClick={handleClick}>
            <i className="fa-solid fa-user-plus"></i> Sign up
            </Nav.Link> 
        <Nav.Link href='/login' onClick={handleClick}>
            <i className="fa-solid fa-right-to-bracket"></i> Login
        </Nav.Link>   
        <Nav.Link onClick={handleGuestLogin}>
            <i className="fa-solid fa-person-circle-question"></i> Continue as Guest
        </Nav.Link>
    </>

    return (
        <Navbar expand={'md'} expanded={expanded} sticky='top' className={`${styles.darkBackground} ${styles.navBar}`}>
            {/* LOGO */}
            <Navbar.Brand href="/">
                <h3 className={`${appStyles.bold} ${appStyles.headingFont} ${appStyles.horizMargin}`}>
                    FILM
                        <Image alt='A bag of popcorn' className={appStyles.negHorizMargin} width={70} src='https://res.cloudinary.com/dojzptdbc/image/upload/v1729082084/popcorn_hzmb1v.png' />
                    FRIENDS
                </h3>
            </Navbar.Brand>
            {/* HAMBURGER MENU TO EXPAND/COLLAPSE */}
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-md`} className={`${appStyles.horizMargin}`} onClick={() => setExpanded(true)}/>
            <Navbar.Offcanvas
                id={`offcanvasNavbar-expand-md`}
                aria-labelledby={`offcanvasNavbarLabel-expand-md`}
                placement="end"
            >
                <Offcanvas.Header closeButton className={currentUser? styles.underlineSection: ''}>
                <Container>
                    {/* USERNAME, IMAGE, AND EMAIL ADDRESS */}
                    {currentUser? 
                        <Row>
                            <Col sm={2} xs={2}>
                                <Avatar />
                            </Col>
                            <Col sm={10} xs={10}>
                            <Card border='light' className={`${appStyles.noBorder} ${appStyles.horizMargin}`}>
                                <Card.Title>
                                <Link to={`/profile/`}>
                                    {currentUser?.user.username}
                                </Link>
                                </Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">{currentUser?.user.email}</Card.Subtitle>
                            </Card>
                            </Col>
                        </Row>
                    :''}
                </Container>
                </Offcanvas.Header>
                {/* REMAINING ICONS */}
                <Offcanvas.Body className={styles.navBar}>
                    <Nav className={`${appStyles.headingFont} justify-content-end flex-grow-1 pe-3`}>
                        {currentUser? loggedInIcons: loggedOutIcons}
                    </Nav>
                </Offcanvas.Body>
            </Navbar.Offcanvas>
      	</Navbar>
    )
}

export default NavBar;