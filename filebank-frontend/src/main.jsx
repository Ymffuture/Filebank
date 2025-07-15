import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import {SnackbarProvider} from 'notistack';
import 'antd/dist/reset.css';  // optional reset
import { ConfigProvider } from 'antd';
import theme from './theme';
// import { AuthProvider } from './context/AuthContext';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.error('Service Worker error:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>  
  <GoogleOAuthProvider clientId="815421801782-jkj6h92h24uo1nhe03hvqfhctebhnaht.apps.googleusercontent.com">
<SnackbarProvider>
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: theme.colors.primary,
        colorSuccess: theme.colors.success,
        colorWarning: theme.colors.warning,
        colorError: theme.colors.danger,
        borderRadius: theme.borderRadius.md,
      }
    }}
  >
    
    <App />
  
  </ConfigProvider>
</SnackbarProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
