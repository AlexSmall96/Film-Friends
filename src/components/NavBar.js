import React from 'react';
import { NavLink } from 'react-router-dom';

const NavBar = () => {
    return (
        <div data-testid='nav-bar'>
            <NavLink to='/'><h1 data-testid='logo'>Film Friends</h1></NavLink>
            <ul>
                <li><NavLink to='/films'>My Films</NavLink></li>
                <li> <NavLink to='/profile'>Profile</NavLink></li>
                <li> <NavLink to='/friends'>Friends</NavLink></li>
                <li> <NavLink to='/reccomendations'>Reccomendations</NavLink></li>
                <li> <NavLink to='/signup'>Sign up</NavLink></li>
                <li> <NavLink to='/login'>Login</NavLink></li>
                <li> Logout</li>
            </ul>
            <form >
                <label>Find your friends</label>
                <input type='search' data-testid='friend-search'></input>
            </form>
        </div>
    )
}

export default NavBar;