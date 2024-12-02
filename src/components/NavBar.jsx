import React, {useState, useEffect, useRef} from 'react';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { Button, Container, Navbar, Nav, Image, Tooltip, Row, OverlayTrigger, NavDropdown} from 'react-bootstrap'
import { Link } from 'react-router-dom/cjs/react-router-dom';
import User from './User';
import useWindowDimensions from '../hooks/useWindowDimensions';

const NavBar = () => {
    // Contexts
    const { currentUser, setCurrentUser  } = useCurrentUser()
    // Hooks
    const { mobile } = useWindowDimensions();
    
    // Handle logout
    const handleLogout = async () => {
        localStorage.clear()
        try {
            await axiosReq.post('/users/logout', {}, {
                headers: {'Authorization': `Bearer ${currentUser?.token}`}
            })
            setCurrentUser(null)
            
        } catch(err) {
            console.log(err)
        }
    }

    // Tooltip for mobile icons
    const renderTooltip = (page) => (
        <Tooltip id="button-tooltip">
            {page}
        </Tooltip>
    );

    // Logged in icons: films, friends, reccomendations, user dropdown
    const loggedInIcons = 
    <>
        <Link to={`/films/${currentUser?.user._id}`} style={{marginTop: '10px'}}>
            {mobile? 
                <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 250, hide: 200 }}
                    overlay={renderTooltip('My Films')}
                >
                    <Button variant='outline-secondary' style={{ padding: '6px', width: '40px', height: '40px'}}>
                        <i className="fa-xl fa-solid fa-clapperboard"></i> 
                    </Button>
                </OverlayTrigger>
            : 'My Films'}
        </Link>
        <Link to='/friends' style={{marginTop: '10px'}}>
            {mobile?
                <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 250, hide: 200 }}
                    overlay={renderTooltip('Friends')}
                >
                    <Button variant='outline-secondary' style={{ padding: '6px', width: '40px', height: '40px'}}>
                        <i className="fa-xl fa-solid fa-users"></i> 
                    </Button>
                </OverlayTrigger>
            : 'Friends'}
        </Link>
        <Link to='/reccomendations' style={{marginTop: '10px'}}>
            {mobile? 
                <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 250, hide: 200 }}
                    overlay={renderTooltip('Reccomendations')}
                >                
                    <Button variant='outline-secondary' style={{ padding: '6px', width: '40px', height: '40px'}}>
                        <i className="fa-xl fa-solid fa-envelope"></i> 
                    </Button>
                </OverlayTrigger>
            : 'Reccomendations'
            }
        </Link>
        <NavDropdown title={<Image src={currentUser?.user.image} width={40} height={40} roundedCircle/>} id="basic-nav-dropdown" drop='start'>
            <NavDropdown.Item>
                <Link to={`/profile/${currentUser?.user._id}`}>
                    <i className="fa-solid fa-user"></i> Profile
                </Link>
            </NavDropdown.Item>
            <NavDropdown.Item>
                <Link to={`/profile/edit/${currentUser?.user._id}`}>
                    <i className="fa-solid fa-pen-to-square"></i> Edit Profile
                </Link>
            </NavDropdown.Item>
            <NavDropdown.Item>
                <Link onClick={handleLogout} to={'/'}>
                    <i className="fa-solid fa-right-from-bracket"></i> Logout
                </Link>
            </NavDropdown.Item>
            <NavDropdown.Item>
                <Link to={`/profile/delete/${currentUser?.user._id}`}>
                    <i className="fa-solid fa-trash-can"></i> Delete Account
                </Link>
            </NavDropdown.Item>
        </NavDropdown>
    </>

    // Logged out icons: sign up and log in
    const loggedOutIcons = 
    <>
        <Link to='/signup'>Sign up</Link>
        <Link to='/login'>Login</Link>
    </>

    return (
        <Navbar bg="light" data-bs-theme="light" className="justify-content-between">
            <Navbar.Brand href="/" style={{marginLeft: '10px'}}>
                <h3>Film
                    <Image alt='A bag of popcorn' style={{marginLeft: '-13px', marginRight: '-13px'}} width={70} src='https://res.cloudinary.com/dojzptdbc/image/upload/v1729082084/popcorn_hzmb1v.png' />
                Friends
                </h3>
            </Navbar.Brand>
            <Nav>
                {currentUser? loggedInIcons: loggedOutIcons}
            </Nav>
      	</Navbar>
    )
}

export default NavBar;