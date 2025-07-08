// src/api/fileApi.js
import axios from 'axios';
import { Alert, AlertTitle } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

/**
 * Create your axios instance (no interceptors yet)
 */
const api = axios.create({
  baseURL: 'https://filebankserver.onrender.com/api',
});

/**
 * Call this once in your App (after SnackbarProvider)
 * 
 * @param {function} enqueueSnackbar from notistack
 * @param {function} navigate optional: a function to navigate (e.g. from react-router)
 */
export function setupInterceptors(enqueueSnackbar, navigate) {
  // Request: attach token
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

  // Response: handle errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const { response } = error;
      // Network error (no response)
      if (!response) {
        enqueueSnackbar(
          <Alert severity="error" icon={<WarningAmberIcon fontSize="inherit" />}>
            <AlertTitle>Network Error</AlertTitle>
            Could not connect to server.
          </Alert>,
          { variant: 'default', anchorOrigin: { vertical: 'top', horizontal: 'center' } }
        );
      } else if (response.status === 401) {
        // Unauthorized
        localStorage.removeItem('filebankToken');
        localStorage.removeItem('filebankUser');

        enqueueSnackbar(
          <Alert severity="warning" icon={<WarningAmberIcon fontSize="inherit" />}>
            <AlertTitle>Session Expired</AlertTitle>
            Please log in again.
          </Alert>,
          { variant: 'default', anchorOrigin: { vertical: 'top', horizontal: 'center' } }
        );

        if (navigate) navigate('/');  // redirect to home/login
      } else {
        // Other HTTP errors
        const message = response.data?.message || 'An error occurred.';
        enqueueSnackbar(
          <Alert severity="error" icon={<WarningAmberIcon fontSize="inherit" />}>
            <AlertTitle>Error {response.status}</AlertTitle>
            {message}
          </Alert>,
          { variant: 'default', anchorOrigin: { vertical: 'top', horizontal: 'center' } }
        );
      }

      return Promise.reject(error);
    }
  );
}

export default api;

