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
      background: '#fff'
    }}
  >
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="40"
        cy="40"
        r="35"
        stroke="#1E90FF"   // Blue
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
