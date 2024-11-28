import axios from 'axios';

// Set base url
// axios.defaults.baseURL = 'http://localhost:3001/data';
axios.defaults.baseURL = 'https://film-friends.onrender.com/data';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.withCredentials = false;

// Export
export const axiosReq = axios.create();