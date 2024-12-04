import React from 'react';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { Navbar, Nav, Image, NavDropdown, Offcanvas} from 'react-bootstrap'
import { Link } from 'react-router-dom/cjs/react-router-dom';
import appStyles from '../App.module.css'
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

    // Logged in icons: films, friends, reccomendations, user dropdown
    const loggedInIcons = 
    <>  <Nav.Link>
            <Link to={`/films/${currentUser?.user._id}`}>
                <i className="fa-solid fa-clapperboard"></i> My Films
            </Link>
        </Nav.Link>
        <Nav.Link>
            <Link to='/friends'>
                <i className="fa-solid fa-users"></i> Friends
            </Link>
        </Nav.Link>
        <Nav.Link>
            <Link to='/reccomendations'>
                <i className="fa-solid fa-envelope"></i> Reccomendations
            </Link>
        </Nav.Link>
        {mobile?(
            <>
            <Nav.Link>
                <Link to={`/profile/${currentUser?.user._id}`}>
                    <i className="fa-solid fa-user"></i> Profile
                </Link>
            </Nav.Link>
            <Nav.Link>
                <Link to={`/profile/edit/${currentUser?.user._id}`}>
                    <i className="fa-solid fa-pen-to-square"></i> Edit Profile
                </Link>
            </Nav.Link>
            <Nav.Link>
                <Link onClick={handleLogout} to={'/'}>
                        <i className="fa-solid fa-right-from-bracket"></i> Logout
                </Link>
            </Nav.Link>
            <Nav.Link>
                <Link to={`/profile/delete/${currentUser?.user._id}`}>
                        <i className="fa-solid fa-trash-can"></i> Delete Account
                </Link>
            </Nav.Link>
            </>
        ):(
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
        )}

    </>

    // Logged out icons: sign up and log in
    const loggedOutIcons = 
    <>
        <Link to='/signup'><i className="fa-solid fa-user-plus"></i> Sign up</Link>
        <Link to='/login'><i className="fa-solid fa-right-to-bracket"></i> Login</Link>
    </>

    return (
        <Navbar expand={'md'} sticky='top' className={`${appStyles.darkBackground}`}>
            <Navbar.Brand href="/">
                <h3 className={`${appStyles.bold} ${appStyles.headingFont} ${appStyles.horizMargin}`}>
                    FILM
                        <Image alt='A bag of popcorn' className={appStyles.negHorizMargin} width={70} src='https://res.cloudinary.com/dojzptdbc/image/upload/v1729082084/popcorn_hzmb1v.png' />
                    FRIENDS
                </h3>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-md`} className={`${appStyles.horizMargin}`}/>
            <Navbar.Offcanvas
              id={`offcanvasNavbar-expand-md`}
              aria-labelledby={`offcanvasNavbarLabel-expand-md`}
              placement="end"
            >
                <Offcanvas.Header closeButton></Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className={`${appStyles.headingFont} justify-content-end flex-grow-1 pe-3`}>
                        {currentUser? loggedInIcons: loggedOutIcons}
                    </Nav>
                </Offcanvas.Body>
            </Navbar.Offcanvas>
      	</Navbar>
    )
}

export default NavBar;