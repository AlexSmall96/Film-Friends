import axios from 'axios';

// Set base url
axios.defaults.baseURL = process.env.REACT_APP_PUBLIC_API_URL
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.withCredentials = false;

// Export
export const axiosReq = axios.create();