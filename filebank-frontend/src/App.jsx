import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar';
import FileList from './components/FileList';
import Footer from './components/Footer';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Hero from './pages/Hero';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

export default function App() {
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/dashboard" element={<Home />} />
        <Route path="/files" element={<FileList />} />
        {/* You can add more routes like Profile, Dashboard, Admin etc */}
        <Route path="/profile" element={<Profile />} />
        <Route path='/' element={<Hero/>} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

      </Routes>
      <Footer />
    </Router>
  );
}
