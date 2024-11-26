import React, {useState, useEffect, useRef} from 'react';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { Container, Navbar, Nav, Image, Row, Form, Dropdown, Toast,  ToastContainer, Button, Overlay, NavDropdown} from 'react-bootstrap'
import User from './User';

const NavBar = () => {
    const [searchResults, setSearchResults] = useState([])
    const { currentUser, setCurrentUser  } = useCurrentUser()
    const [search, setSearch] = useState('')
    const [showMenu, setShowMenu] = useState(false);
    const target = useRef(null)

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
        <Nav.Link href='/friends'>Friends</Nav.Link>
        <Nav.Link href='/reccomendations'>Reccomendations</Nav.Link>
        <NavDropdown title={<Image src={currentUser?.user.image} width={50} roundedCircle/>} id="basic-nav-dropdown">
            <NavDropdown.Item href={`/profile/${currentUser?.user._id}`}><i className="fa-solid fa-user"></i> Profile</NavDropdown.Item>
            <NavDropdown.Item href={`/profile/edit/${currentUser?.user._id}`}><i className="fa-solid fa-pen-to-square"></i> Edit Profile</NavDropdown.Item>
            <NavDropdown.Item onClick={handleLogout} href="/"><i className="fa-solid fa-right-from-bracket"></i> Logout</NavDropdown.Item>
            <NavDropdown.Item href={`/profile/delete/${currentUser?.user._id}`}><i className="fa-solid fa-trash-can"></i> Delete Account</NavDropdown.Item>
        </NavDropdown>
    </>

    const loggedOutIcons = 
    <>
        <Nav.Link href='/signup'>Sign up</Nav.Link>
        <Nav.Link href='/login'>Login</Nav.Link>
    </>

    return (
        <Navbar bg="light" data-bs-theme="light">
          	<Container>
            	<Navbar.Brand href="/">
                    <h3>Film
                        <Image alt='A bag of popcorn' style={{marginLeft: '-13px', marginRight: '-13px'}} width={70} src='https://res.cloudinary.com/dojzptdbc/image/upload/v1729082084/popcorn_hzmb1v.png' />
                    Friends
                    </h3>
                </Navbar.Brand>
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