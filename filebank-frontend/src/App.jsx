import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Alert, AlertTitle } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Profile from './pages/Profile';
import NotFound from './components/NotFound';
import VerifyEmail from './pages/VerifyEmail';
import RequestReset from './pages/RequestReset';
import ResetPassword from './pages/ResetPassword';

const Help     = lazy(() => import('./components/Help'));
const FileList = lazy(() => import('./components/FileList'));
const Footer   = lazy(() => import('./components/Footer'));
const Feedback = lazy(() => import('./components/Feedback'));
const Home     = lazy(() => import('./pages/Home'));
const Admin    = lazy(() => import('./components/Admin'));
const Hero     = lazy(() => import('./pages/Hero'));
const Privacy  = lazy(() => import('./pages/Privacy'));
const Terms    = lazy(() => import('./pages/Terms'));
const AboutUs  = lazy(() => import('./pages/AboutUs'));
const AIScreen = lazy(() => import('./components/AIScreen'));

const Loader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#fff'
  }}>
    <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="40" cy="40" r="35"
        stroke="#1E90FF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="165"
        strokeDashoffset="120"
        fill="none"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 40 40"
          to="360 40 40"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  </div>
);

function useContentLock() {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const showError = (msg) => {
      enqueueSnackbar(
        <Alert
          severity="warning"
          icon={<WarningAmberIcon fontSize="inherit" />}
          sx={{ width: '100%' }}
        >
          <AlertTitle>Heads Up!</AlertTitle>
          {msg}
        </Alert>,
        {
          variant: 'default',
          anchorOrigin: { vertical: 'center', horizontal: 'center' }
        }
      );
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      // showError("Right-click is disabled on this site.");
    };

    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && ["c", "u", "p", "s"].includes(e.key.toLowerCase())) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        // showError("Copying or inspecting is disabled.");
      }
    };

    let touchStartTime = 0;
    const handleTouchStart = () => { touchStartTime = Date.now(); };
    const handleTouchEnd = () => {
      if (Date.now() - touchStartTime > 500) {
        // showError("Long press is disabled.");
      }
    };

    let lastTap = 0;
    const handleDoubleTap = () => {
      const now = Date.now();
      if (now - lastTap < 300) {
       // showError('This action is restricted.');
      }
      lastTap = now;
    };

    const handleBlur = () => {
      // if Google login popup is open, skip blur
      const googleIframe = document.querySelector('iframe[src*="accounts.google.com"]');
      if (!googleIframe) {
        document.body.style.transition = 'filter 0.3s ease-in-out';
        document.body.style.filter = 'blur(10px)';
      }
    };

    const handleFocus = () => {
      document.body.style.transition = 'filter 0.3s ease-in-out';
      document.body.style.filter = 'none';
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchstart", handleDoubleTap);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchstart", handleDoubleTap);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [enqueueSnackbar]);
}

function AppContent() {
  useContentLock();

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/dashboard" element={<Home />} />
        <Route path="/files"     element={<FileList />} />
        <Route path="/profile"   element={<Profile />} />
        <Route path="/"          element={<Hero />} />
        <Route path="/terms"     element={<Terms />} />
        <Route path="/privacy"   element={<Privacy />} />
        <Route path="/admin"     element={<Admin />} />
        <Route path="/about-us"  element={<AboutUs />} />
        <Route path="/help"      element={<Help />} />
        <Route path="/feedback"  element={<Feedback />} />
        <Route path="*"          element={<NotFound />} />
        <Route path="/full-screen-ai"          element={<AIScreen />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
<Route path="/request-reset" element={<RequestReset />} />
<Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      <Footer />
    </Suspense>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

