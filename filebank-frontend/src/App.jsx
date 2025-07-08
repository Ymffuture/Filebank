import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSnackbar } from 'notistack';
// import { SnackbarProvider } from 'notistack';
import Profile from './pages/Profile';
import NotFound from './components/NotFound';

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

  React.useEffect(() => {
    const showError = (msg) => {
      enqueueSnackbar(
  <Alert
    severity="warning"
    icon={<WarningAmberIcon fontSize="inherit" />}
    sx={{ width: '100%' }}
  >
    <AlertTitle>Heads Up!</AlertTitle>
    This action is restricted.
  </Alert>,
  { variant: 'default' }  // use 'default' so it accepts JSX
);
      });
    };



    

    const handleContextMenu = (e) => {
      e.preventDefault();
     // showError("Right-click is disabled.");
    };

    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && ["c", "u", "p", "s"].includes(e.key.toLowerCase())) ||
        e.key === "F12"
      ) {
        e.preventDefault();
      //  showError("Copy/inspect is disabled.");
      }
    };

    let touchStartTime = 0;
    const handleTouchStart = () => { touchStartTime = Date.now(); };
    const handleTouchEnd = () => {
      if (Date.now() - touchStartTime > 500) {
        showError("Long press is disabled.");
      }
    };

    let lastTap = 0;
    const handleDoubleTap = () => {
      const now = Date.now();
      if (now - lastTap < 300) showError("Double tap is disabled.");
      lastTap = now;
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchstart", handleDoubleTap);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchstart", handleDoubleTap);
    };
  }, [enqueueSnackbar]);
}

useEffect(() => {
  const handleBlur = () => {
    document.body.style.filter = 'blur(10px)';
  };
  const handleFocus = () => {
    document.body.style.filter = 'none';
  };

  window.addEventListener('blur', handleBlur);
  window.addEventListener('focus', handleFocus);

  return () => {
    window.removeEventListener('blur', handleBlur);
    window.removeEventListener('focus', handleFocus);
  };
}, []);


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
