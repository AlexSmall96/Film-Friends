import React from 'react';
import { NavLink } from 'react-router-dom';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from '../contexts/CurrentUserContext';

const NavBar = () => {
    const { currentUser, setCurrentUser  } = useCurrentUser()
    const handleLogout = async () => {
        try {
            await axiosReq.post('/users/logout', {}, {
                headers: {'Authorization': `Bearer ${currentUser?.token}`}
            })
            localStorage.removeItem('storedUser')
            setCurrentUser(null)
        } catch(err) {
            console.log(err)
        }
    }
    const loggedInIcons = 
    <>
        <li> <NavLink to='/myfilms'>My Films</NavLink></li>
        <li> <NavLink to={`/profile/${currentUser?.user._id}`}>Profile</NavLink></li>
        <li> <NavLink to='/friends'>Friends</NavLink></li>
        <li> <NavLink to='/reccomendations'>Reccomendations</NavLink></li>
        <li> <NavLink to='/' onClick={handleLogout}>Logout</NavLink></li>
    </>
    const loggedOutIcons = 
    <>
        <li> <NavLink to='/signup'>Sign up</NavLink></li>
        <li> <NavLink to='/login'>Login</NavLink></li>
    </>
    return (
        <div>
            <NavLink to='/'><h1>Film Friends</h1></NavLink>
            <ul>
                {currentUser ? loggedInIcons : loggedOutIcons}
            </ul>
            <form >
                <label htmlFor='friend-search' id='friend-lbl'>Find your friends</label>
                <input type='search' name='friend-search' aria-labelledby='friend-lbl'></input>
            </form>
        </div>
    )
}

export default NavBar;