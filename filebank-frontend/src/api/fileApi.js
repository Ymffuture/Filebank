import React from 'react';
import axios from 'axios';
import { Alert, AlertTitle } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const api = axios.create({
  baseURL: 'https://filebankserver.onrender.com/api',
});

export function setupInterceptors(enqueueSnackbar, navigate) {
  // Attach token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('filebankToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (err) => Promise.reject(err)
  );

  // Handle responses
  api.interceptors.response.use(
    (res) => res,
    (error) => {
      const { response } = error;

      // Helper to show MUI Alert in notistack
      const showAlert = (title, msg, severity = 'error') => {
        const content = React.createElement(
          Alert,
          { severity, icon: React.createElement(WarningAmberIcon, { fontSize: 'inherit' }), sx: { width: '100%' } },
          React.createElement(AlertTitle, null, title),
          msg
        );
        enqueueSnackbar(content, {
          variant: 'default',
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
        });
      };

      if (!response) {
        showAlert('Network Error', 'Could not connect to server.', 'error');
      } else if (response.status === 401) {
        localStorage.removeItem('filebankToken');
        localStorage.removeItem('filebankUser');
        showAlert('Session Expired', 'Please log in again.', 'warning');
        if (navigate) navigate('/');
      } else {
        const msg = response.data?.message || 'An error occurred.';
        showAlert(`Error ${response.status}`, msg, 'error');
      }

      return Promise.reject(error);
    }
  );
}

export default api;

