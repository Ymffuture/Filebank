import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Profile from './pages/Profile';
import NotFound from './components/NotFound';
import VerifyEmail from './pages/VerifyEmail';
import RequestReset from './pages/RequestReset';
import ResetPassword from './pages/ResetPassword';
import useContentLock from './hooks/useContentLock';
import useNetworkStatus from './hooks/useNetworkStatus';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
// #0B3D91 #1E90FF
const Loader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#fff'
  }}>
  <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ratGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B3D91" />
      <stop offset="50%" stop-color="transparent" />
      <stop offset="100%" stop-color="#1E90FF" />
    </linearGradient>
  </defs>
  <circle
    cx="50"
    cy="50"
    r="35"
    stroke="url(#ratGradient)"
    stroke-width="6"
    fill="none"
    stroke-linecap="round"
    stroke-dasharray="280"
    stroke-dashoffset="650"
  >
    <animateTransform
      attributeName="transform"
      type="rotate"
      values="0 50 50; 360 50 50; 0 50 50; -360 50 50; 0 50 50"
      keyTimes="0; 0.25; 0.5; 0.75; 1"
      dur="10s"
      repeatCount="indefinite"
    />
    <animate
      attributeName="stroke-dashoffset"
      values="210;0;210"
      dur="1.8s"
      repeatCount="indefinite"
    />
  </circle>
</svg>
  </div>
);


function AppContent() {
  useContentLock();
useNetworkStatus() 
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
      <ToastContainer
        position="bottom-left"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        draggable={false}
        pauseOnHover
        theme="colored"
      />
    </Router>
  );
}

