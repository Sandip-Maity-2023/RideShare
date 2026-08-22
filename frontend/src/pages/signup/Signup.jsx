import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Dispatch custom event to notify App.jsx and Navbar.jsx of state change
        window.dispatchEvent(new Event('auth-change'));

        navigate('/home');
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      alert('Unable to connect to server');
    }
  };

  return (
    <div className="signup-wrapper">
      <h1 className="signup-page-title">Sign UP</h1>

      {/* Wireframe Container Box */}
      <div className="signup-card">
        {/* Header Bar */}
        <header className="card-header">
          <span className="brand-logo">Carpooling</span>
          <div className="user-profile-welcome">
            <span>Welcome</span>
            <div className="profile-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </header>

        {/* Card Body */}
        <div className="card-body">
          {/* Left Sidebar */}
          <aside className="left-sidebar">
            <h2>Sign Up</h2>
          </aside>

          {/* Right Main Form Section */}
          <main className="form-section">
            <div className="form-header-area">
              <p className="sub-heading">&lt;----- Create Account</p>
              
              {/* Profile Photo Upload Section */}
              <div className="avatar-upload-container">
                <label htmlFor="avatar-input" className="avatar-label">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile Preview" className="avatar-preview" />
                  ) : (
                    <div className="avatar-placeholder">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  )}
                </label>
                <input 
                  id="avatar-input" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  style={{ display: 'none' }} 
                />
                <span className="upload-text">Upload</span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="signup-form">
              {/* Name Input */}
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Phone Input */}
              <div className="input-group">
                <input
                  type="tel"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              {/* Email / Mobile Input */}
              <div className="input-group icon-input">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="Email / Mobile"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="input-group icon-input">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Confirm Password Input */}
              <div className="input-group icon-input">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="signup-submit-btn">
                Sign Up
              </button>

              <p className="login-redirect-text">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Signup;