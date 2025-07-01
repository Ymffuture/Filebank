import axios from 'axios';
// import { useSnackbar } from 'notistack';
// Create a shared Axios instance
const api = axios.create({
  // baseURL: 'http://localhost:5000/api',

     baseURL: 'https://filebankserver.onrender.com/api',


});
// const {enqueueSnackbar} = useSnackbar()
// Request interceptor: Attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('filebankToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized or expired token, clearing storage...');
      localStorage.removeItem('filebankToken');
      localStorage.removeItem('filebankUser');

      // Optional: Trigger a reload or navigate
      window.location.href = '/';  // You could navigate programmatically if in a React component
//  enqueueSnackbar('somothing went wrong.',{variant:'error'});
      // Or optionally show a message (if you're inside a React context)
      // message.error('Session expired, please log in again');
    }
    return Promise.reject(error);
  }
);

export default api;
