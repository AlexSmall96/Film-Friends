import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { axiosReq } from './api/axiosDefaults';

/* 
The code to get user from local storage was taken from the below article
https://www.freecodecamp.org/news/how-to-use-localstorage-with-react-hooks-to-set-and-get-items/
*/
// Check if a user is saved in local storage and if token is still valid
let currentUser
const storedUser = JSON.parse(localStorage.getItem('currentUser'))
    if (storedUser) {
      try {
        await axiosReq.get('/users/token', {headers: {'Authorization': `Bearer ${storedUser.token}`}})
        currentUser = storedUser
      } catch (err) {
        localStorage.removeItem('currentUser')
        currentUser = null
      }
    } else {
        currentUser = null
    }
  
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App currentUser={currentUser} />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

