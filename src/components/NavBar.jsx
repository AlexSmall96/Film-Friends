import React, {useEffect, useState} from 'react';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { Navbar, Nav, Image, NavDropdown, Offcanvas, Col, Container, Row, Card} from 'react-bootstrap'
import { Link } from 'react-router-dom/cjs/react-router-dom';
import appStyles from '../App.module.css'
import styles from '../styles/NavBar.module.css'
import useWindowDimensions from '../hooks/useWindowDimensions';
import Avatar from './Avatar';

const NavBar = () => {
    // Contexts
    const { currentUser, setCurrentUser  } = useCurrentUser()
    // Hooks
    const { width } = useWindowDimensions();
    // Initialize state variables
    const [expanded, setExpanded] = useState(false)
    // Handle logout
    const handleLogout = async () => {
        localStorage.clear()
        try {
            await axiosReq.post('/users/logout', {}, {
                headers: {'Authorization': `Bearer ${currentUser?.token}`}
            })
            setCurrentUser(null)
            setExpanded(false)
        } catch(err) {
            console.log(err)
        }
    }

    useEffect(() => {
        if (width > 767){
            setExpanded(false)
        }
    }, [width])

    document.addEventListener('mouseup', (event) => {
        if (!event.target.classList.contains('offcanvas-body')){
            setExpanded(false) 
        }
    })

    const handleClick = () => {
        setExpanded(false)
    }
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
        {width <= 767?(
            <div className={styles.underlineSection}>
                <Nav.Link href={`/profile/info`} onClick={handleClick}>
                    <i className="fa-solid fa-user"></i> Profile
                </Nav.Link>
                <Nav.Link href={`/account/security`} onClick={handleClick}>
                    <i className="fa-solid fa-shield-halved"></i> Acount Security
                </Nav.Link>
                <Nav.Link href='/' onClick={handleLogout}  >
                    <i className="fa-solid fa-right-from-bracket"></i> Logout
                </Nav.Link>
                <Nav.Link href={`/account/delete`} onClick={handleClick}>
                    <i className="fa-solid fa-trash-can"></i> Delete Account 
                </Nav.Link>
            </div>
        ):(
            <NavDropdown title={<Avatar src={currentUser?.user.image} />} id="basic-nav-dropdown" drop='start'>
                <NavDropdown.Item href={`/profile/info`}>
                    <i className="fa-solid fa-user"></i> Profile
                </NavDropdown.Item>
                <NavDropdown.Item href={`/account/security`}>
                    <i className="fa-solid fa-shield-halved"></i> Acount Security
                </NavDropdown.Item>
                <NavDropdown.Item href='/' onClick={handleLogout}>
                    <i className="fa-solid fa-right-from-bracket"></i> Logout
                </NavDropdown.Item>
                <NavDropdown.Item href={`/account/delete`}>
                    <i className="fa-solid fa-trash-can"></i> Delete Account
                </NavDropdown.Item>
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
    </>

    return (
        <Navbar expand={'md'} expanded={expanded} sticky='top' className={`${appStyles.darkBackground}`}>
            <Navbar.Brand href="/">
                <h3 className={`${appStyles.bold} ${appStyles.headingFont} ${appStyles.horizMargin}`}>
                    FILM
                        <Image alt='A bag of popcorn' className={appStyles.negHorizMargin} width={70} src='https://res.cloudinary.com/dojzptdbc/image/upload/v1729082084/popcorn_hzmb1v.png' />
                    FRIENDS
                </h3>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-md`} className={`${appStyles.horizMargin}`} onClick={() => setExpanded(true)}/>
            <Navbar.Offcanvas
                id={`offcanvasNavbar-expand-md`}
                aria-labelledby={`offcanvasNavbarLabel-expand-md`}
                placement="end"
            >
                <Offcanvas.Header closeButton className={currentUser? styles.underlineSection: ''}>
                <Container>
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