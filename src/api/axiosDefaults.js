import axios from 'axios';

// Set base url
axios.defaults.baseURL =  'https://film-friends-api.onrender.com/data'
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.withCredentials = false;

// Export
export const axiosReq = axios.create();