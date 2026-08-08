import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, User, LogOut, ChevronDown, Bell } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Find Ride', path: '/find-ride' },
    { name: 'Offer Ride', path: '/offer-ride' },
    { name: 'My Trips', path: '/my-trips' },
    { name: 'My Vehicles', path: '/my-vehicles' },
    { name: 'Wallet', path: '/wallet' },
    { name: 'History', path: '/ride-history' },
  ];

  if (user?.role === 'CompanyAdmin') {
    navLinks.unshift({ name: 'Admin Dashboard', path: '/admin' });
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Car className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Carpooling
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1 ml-6">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Profile Menu */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 p-1 rounded-full hover:bg-gray-100 focus:outline-none"
              >
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className="h-9 w-9 rounded-full object-cover border border-gray-300"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold border border-blue-200">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.name || 'Dero Addict'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Account Settings
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
