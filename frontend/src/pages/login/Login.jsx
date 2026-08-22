import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [role, setRole] = useState('Employee'); // 'Employee' or 'Admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (token && user) {
      if (user.role === 'Admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/home');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    // FIXED CREDENTIALS FOR ADMIN LOGIN
    if (role === 'Admin') {
      const FIXED_ADMIN_EMAIL = 'admin@odoo.com';
      const FIXED_ADMIN_PASS = 'admin123';

      if (email.trim().toLowerCase() === FIXED_ADMIN_EMAIL && password === FIXED_ADMIN_PASS) {
        const adminUser = {
          name: 'Admin',
          email: FIXED_ADMIN_EMAIL,
          role: 'Admin'
        };
        
        localStorage.setItem('token', 'fixed-admin-token-12345');
        localStorage.setItem('user', JSON.stringify(adminUser));

        // Dispatch auth-change event
        window.dispatchEvent(new Event('auth-change'));

        // Direct isolated redirect to Admin Dashboard
        navigate('/admin-dashboard');
        return;
      } else {
        alert('Invalid Admin credentials!');
        return;
      }
    }

    // EMPLOYEE LOGIN WORKFLOW (Connects to Backend)
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ ...data.user, role: 'Employee' }));

        window.dispatchEvent(new Event('auth-change'));
        navigate('/home');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Unable to connect to backend server.');
    }
  };

  return (
    <div className="login-wrapper">
      <h1 className="login-page-title">Login</h1>

      <div className="login-card">
        <header className="card-header">
          <span className="brand-logo">Carpooling</span>
          <div className="user-profile-welcome">
            <span>Welcome ({role})</span>
            <div className="profile-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </header>

        <div className="card-body">
          <aside className="left-sidebar">
            <h2>Login</h2>
          </aside>

          <main className="form-section">
            <p className="sub-heading">&lt;----- Select Login Mode</p>

            {/* Toggle Between Employee and Admin */}
            <div className="role-toggle-container">
              <button
                type="button"
                className={`toggle-btn ${role === 'Employee' ? 'active' : ''}`}
                onClick={() => {
                  setRole('Employee');
                  setEmail('');
                  setPassword('');
                }}
              >
                Employee Login
              </button>
              <button
                type="button"
                className={`toggle-btn ${role === 'Admin' ? 'active' : ''}`}
                onClick={() => {
                  setRole('Admin');
                  setEmail('');
                  setPassword('');
                }}
              >
                Admin Login
              </button>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="input-group">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder={role === 'Admin' ? 'Email' : 'Email / Mobile'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  type="password"
                  placeholder={role === 'Admin' ? '••••••••' : 'Password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="login-submit-btn">
                Login as {role}
              </button>

              {role === 'Employee' && (
                <>
                  <div className="divider-container">
                    <div className="divider-line"></div>
                    <span className="divider-text">Or</span>
                    <div className="divider-line"></div>
                  </div>

                  <div className="signup-prompt">
                    <span>Create New Account</span>
                    <Link to="/signup" className="signup-btn">
                      Sign Up
                    </Link>
                  </div>
                </>
              )}
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Login;