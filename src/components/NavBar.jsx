import React from 'react';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { Container, Navbar, Nav, Form, Row, Col } from 'react-bootstrap'

const NavBar = () => {
    const { currentUser, setCurrentUser  } = useCurrentUser()
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
    const loggedInIcons = 
    <>
        <Nav.Link href={`/films/${currentUser?.user._id}`}>My Films</Nav.Link>
        <Nav.Link href={`/profile/${currentUser?.user._id}`}>Profile</Nav.Link>
        <Nav.Link href='/friends'>Friends</Nav.Link>
        <Nav.Link href='/reccomendations'>Reccomendations</Nav.Link>
        <Nav.Link href='/' onClick={handleLogout}>Logout</Nav.Link>
    </>
    const loggedOutIcons = 
    <>
        <Nav.Link href='/signup'>Sign up</Nav.Link>
        <Nav.Link href='/login'>Login</Nav.Link>
    </>
    return (
        <Navbar bg="light" data-bs-theme="light">
          	<Container>
            	<Navbar.Brand href="/">Film Friends</Navbar.Brand>
            		<Row>
              			<Nav className="me-auto">
                			{currentUser? loggedInIcons: loggedOutIcons}
              			</Nav>
            		</Row>
          	</Container>
      	</Navbar>
    )
}

export default NavBar;