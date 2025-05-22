// HeroSection.jsx
import React from 'react';
import './HeroSection.css';
import { useNavigate } from 'react-router-dom';

// Placeholder icons (replace with actual icons if available, e.g., from lucide-react or SVGs)
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);


function HeroSection() {
  const navigate = useNavigate();
  // Retrieve the authentication token from localStorage
  const isLoggedIn = !!localStorage.getItem('authToken');

  // Handler for the "Get started" button
  const handleGetStarted = () => {
    if (isLoggedIn) {
      // Navigate to the '/generate' route if the user is logged in
      navigate('/generate');
    } else {
      // Show an alert and navigate to '/signin' if the user is not logged in
      // Consider replacing alert with a more integrated UI notification
      alert('Please sign in first to continue!');
      navigate('/signin');
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>Polished presentations in seconds</h1>
        <p>
          Turn your ideas into stunning presentations instantly. Speed up creation even more by uploading documents.
        </p>
        <button onClick={handleGetStarted} className="get-started-btn">
          Get started
        </button>
      </div>

      {/* Showcase Area - inspired by the first screenshot */}
      <div className="showcase-container">
        <div className="showcase-header">
          <div className="dropdown-placeholder">
            <span>All styles</span>
            <ChevronDownIcon />
          </div>
          <div className="dropdown-placeholder">
            <span>Color</span>
            <ChevronDownIcon />
          </div>
        </div>
        <div className="showcase-main-content">
          {/* This area can be customized to show different templates or features */}
          <div className="logo-placeholder">
            <span>YOUR LOGO</span>
          </div>
          <div className="graphic-elements">
            {/* Placeholder for graphic elements shown in the screenshot */}
            <div className="graphic-circle orange"></div>
            <div className="graphic-circle dark-blue"></div>
            <div className="graphic-bar"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;