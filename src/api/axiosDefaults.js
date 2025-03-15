import axios from 'axios';
const DEV = process.env.DEV

// Set base url
axios.defaults.baseURL = DEV ? 'http://localhost:3001/data' : 'https://film-friends.onrender.com/data'
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.withCredentials = false;

// Export
export const axiosReq = axios.create();