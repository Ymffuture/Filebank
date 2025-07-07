import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Profile from'./pages/Profile';
import NotFound from './components/NotFound' ;
// Lazy-loaded components
const Help = lazy(() => import('./components/Help'));
const FileList = lazy(() => import('./components/FileList'));
const Footer = lazy(() => import('./components/Footer'));
const Feedback = lazy(() => import('./components/Feedback'));
const Home = lazy(() => import('./pages/Home'));
const Admin = lazy(() => import('./components/Admin'));
const Hero = lazy(() => import('./pages/Hero'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
// SVG loader
const Loader = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #1E90FF 0%, #FFD700 40%, #32CD32 80%)',
    }}
  >
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      {/* Outer ring */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.6))' }}
      >
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="#FFD700"
          strokeWidth="8"
          strokeDasharray="90 90"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 60 60;360 60 60"
            dur="1.2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* Inner ring */}
      <svg
        width="90"
        height="90"
        viewBox="0 0 90 90"
        style={{ position: 'absolute', top: '15px', left: '15px', filter: 'drop-shadow(0 0 8px rgba(50,205,50,0.5))' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="45"
          cy="45"
          r="35"
          stroke="#32CD32"
          strokeWidth="6"
          strokeDasharray="60 60"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="360 45 45;0 45 45"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* Center dot */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(50% - 8px)',
          left: 'calc(50% - 8px)',
          width: 16,
          height: 16,
          background: '#1E90FF',
          borderRadius: '50%',
          boxShadow: '0 0 12px #1E90FF',
        }}
      />
    </div>
  </div>
);


export default function App() {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/files" element={<FileList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Hero />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/help" element={<Help />} />
        <Route path="/feedback" element={<Feedback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </Suspense>
    </Router>
  );
}
