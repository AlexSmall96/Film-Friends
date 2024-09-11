import React from 'react';
import { NavLink } from 'react-router-dom';


const NavBar = ({currentUser}) => {
    const loggedInIcons = 
    <>
        <li> <NavLink to='/myfilms'>My Films</NavLink></li>
        <li> <NavLink to={`/profile/${currentUser?.user._id}`}>Profile</NavLink></li>
        <li> <NavLink to='/friends'>Friends</NavLink></li>
        <li> <NavLink to='/reccomendations'>Reccomendations</NavLink></li>
        <li> Logout</li>
    </>
    const loggedOutIcons = <>
        <li> <NavLink to='/signup'>Sign up</NavLink></li>
        <li> <NavLink to='/login'>Login</NavLink></li>
    </>
    return (
        <div data-testid='nav-bar'>
            <NavLink to='/'><h1 data-testid='logo'>Film Friends</h1></NavLink>
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