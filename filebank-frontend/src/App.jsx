import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Profile from'./pages/Profile';
// Lazy-loaded components
const FileList = lazy(() => import('./components/FileList'));
const Footer = lazy(() => import('./components/Footer'));
const Home = lazy(() => import('./pages/Home'));
const Admin = lazy(() => import('./components/Admin'));
const Hero = lazy(() => import('./pages/Hero'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
// SVG loader
const Loader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'radial-gradient(circle, #1E90FF 0%, #FFD700 40%, #32CD32 70%)'
  }}>
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="60" cy="60" r="50" stroke="#FFD700" strokeWidth="10" strokeDasharray="80 80" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 60 60;360 60 60"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="60" cy="60" r="30" stroke="#32CD32" strokeWidth="6" strokeDasharray="40 40" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="360 60 60;0 60 60"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
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
        </Routes>
        <Footer />
      </Suspense>
    </Router>
  );
}
