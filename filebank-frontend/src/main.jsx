import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import {SnackbarProvider} from 'notistack';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SnackbarProvider>
    <GoogleOAuthProvider clientId="815421801782-jkj6h92h24uo1nhe03hvqfhctebhnaht.apps.googleusercontent.com">

  <App />

    </GoogleOAuthProvider>
   </SnackbarProvider>
  </React.StrictMode>
);
