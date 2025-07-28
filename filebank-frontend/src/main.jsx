import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { GoogleOAuthProvider } from '@react-oauth/google';
import {SnackbarProvider} from 'notistack';
import 'antd/dist/reset.css';  // optional reset

const theme = createTheme({
  components: {
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: '#000',
          color: '#fff',
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>  
  <GoogleOAuthProvider clientId="815421801782-jkj6h92h24uo1nhe03hvqfhctebhnaht.apps.googleusercontent.com">
    <ThemeProvider theme={theme}>
<SnackbarProvider
maxSnack={3}
  autoHideDuration={3000}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
> 
    
    <App />
  
</SnackbarProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
