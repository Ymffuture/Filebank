import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import {SnackbarProvider} from 'notistack';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>  
  <GoogleOAuthProvider clientId="815421801782-jkj6h92h24uo1nhe03hvqfhctebhnaht.apps.googleusercontent.com">
<SnackbarProvider>
  <App />
</SnackbarProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
