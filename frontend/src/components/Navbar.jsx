import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const syncUser = () => {
      try {
        const stored = localStorage.getItem("user");
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("storage", syncUser);
    window.addEventListener("auth-change", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("auth-change", syncUser);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const displayName =
    user?.name ||
    user?.username ||
    (user?.email ? user.email.split("@")[0] : "suman");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    setDropdownOpen(false);
    navigate("/login");
  };

  const navItems = [
    { label: "Carpooling", path: "/home" },
    { label: "My Trips", path: "/my-trips" },
    { label: "My Vehicle", path: "/my-vehicle" },
    { label: "Ride History", path: "/ride-history" },
    { label: "Wallet", path: "/wallet" },
    { label:"Report", path: "/report" },
    { label: "Setting", path: "/settings" },
  ];

  return (
    <header className="app-navbar">
      {/* Brand */}
      <div className="nav-brand" onClick={() => navigate("/home")}>
        Carpooling
      </div>

      {/* Center Links Container */}
      <div className="nav-center-links">
        {navItems.map((item) => (
          <span
            key={item.label}
            className="nav-link-item"
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </span>
        ))}
      </div>

      {/* Right Section */}
      <div className="nav-right-user" ref={dropdownRef}>
        <div
          className="profile-trigger"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          <span className="user-name">{displayName}</span>
          
          {/* Avatar Icon */}
          <div className="user-avatar-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>

          {/* Dropdown Indicator Icon */}
          <svg
            className={`dropdown-arrow ${dropdownOpen ? "open" : ""}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        {dropdownOpen && (
          <div className="profile-dropdown-menu">
            <div className="dropdown-user-details">
              <strong>{displayName}</strong>
              <small>{user?.email || "user@example.com"}</small>
            </div>
            <hr className="dropdown-divider" />
            <button
              className="dropdown-item-btn"
              onClick={() => {
                setDropdownOpen(false);
                navigate("/settings");
              }}
            >
              Update Profile
            </button>
            <button className="dropdown-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;