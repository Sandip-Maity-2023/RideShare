import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Splash.css';

const Splash = () => {
  const navigate = useNavigate();

  return (
    <div className="splash-container">
      {/* Platform Branding Badge */}
      <div className="platform-branding">
        <span>Enterprise Carpooling Platform</span>
      </div>

      <div className="splash-card">
        {/* Graphic Illustration */}
        <div className="splash-illustration">
          <svg
            className="car-svg"
            viewBox="0 0 240 130"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Main Car Body Outlines */}
            <path
              d="M30 85 C30 75, 45 50, 75 45 L155 45 C185 50, 200 75, 200 85 L208 85 C215 85, 220 90, 220 96 L220 108 C220 112, 215 115, 210 115 L20 115 C15 115, 10 112, 10 108 L10 96 C10 90, 15 85, 22 85 Z"
              stroke="#0284c7"
              strokeWidth="4"
              fill="#ffffff"
            />
            {/* Windshield */}
            <path
              d="M48 78 C52 58, 70 52, 85 52 L145 52 C160 52, 178 58, 182 78 Z"
              stroke="#0284c7"
              strokeWidth="3.5"
              fill="#e0f2fe"
            />
            {/* Passengers Inside Car */}
            {/* Driver / Left Passenger */}
            <circle cx="75" cy="65" r="7" stroke="#0284c7" strokeWidth="3" fill="#ffffff" />
            <path d="M63 78 C63 72, 68 70, 75 70 C82 70, 87 72, 87 78" stroke="#0284c7" strokeWidth="3" fill="none" />
            
            {/* Center Passenger */}
            <circle cx="115" cy="63" r="7" stroke="#0284c7" strokeWidth="3" fill="#ffffff" />
            <path d="M103 78 C103 71, 108 69, 115 69 C122 69, 127 71, 127 78" stroke="#0284c7" strokeWidth="3" fill="none" />
            
            {/* Right Passenger */}
            <circle cx="155" cy="65" r="7" stroke="#0284c7" strokeWidth="3" fill="#ffffff" />
            <path d="M143 78 C143 72, 148 70, 155 70 C162 70, 167 72, 167 78" stroke="#0284c7" strokeWidth="3" fill="none" />

            {/* Headlights */}
            <rect x="22" y="92" width="16" height="8" rx="4" stroke="#0284c7" strokeWidth="3" fill="#bae6fd" />
            <rect x="192" y="92" width="16" height="8" rx="4" stroke="#0284c7" strokeWidth="3" fill="#bae6fd" />
            {/* Bumper Grille */}
            <line x1="90" y1="102" x2="140" y2="102" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        {/* Side-by-side Tagline Content */}
        <div className="splash-content">
          <h1 className="splash-title">
            Ride Together<br />Save Together
          </h1>
          <p className="splash-subtitle">Your enterprise carpooling solution</p>

          <button className="splash-btn" onClick={() => navigate('/login')}>
            Get Started
            <svg className="arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Cloud & Road Wireframe Decorative Background Elements */}
      <div className="cloud cloud-left"></div>
      <div className="cloud cloud-right"></div>
      <div className="road-perspective">
        <div className="road-grid"></div>
      </div>
    </div>
  );
};

export default Splash;