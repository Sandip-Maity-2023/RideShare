import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Splash from './pages/splash/Splash';
import Login from './pages/login/Login';
import Signup from './pages/signup/Signup';
import Home from './pages/home/Home';
import RouteConfirmation from './pages/routeConfirmation/RouteConfirmation';
import AvailableRides from './pages/availableRides/AvailableRides';
import MyTrips from './pages/myTrips/MyTrips';
import LiveTracking from './pages/liveTracking/LiveTracking';
import Wallet from './pages/wallet/Wallet';
import MyVehicle from './pages/myVehicle/MyVehicle';
import AdminDashboard from './pages/adminDashboard/AdminDashboard';
import './App.css';
import PaymentMethod from "./pages/paymentMethod/PaymentMethod";
import RideHistory from "./pages/rideHistory/RideHistory";
import Settings from "./pages/settings/Settings";
import Report from "./pages/report/Report";

// Show navbar everywhere EXCEPT login, signup, and admin dashboard
const ConditionalNavbar = ({ token }) => {
  const location = useLocation();
  
  // Exclude auth screens and admin dashboard from rendering the main application navbar
  const hideOnPaths = ['/login', '/signup', '/admin-dashboard'];
  
  if (hideOnPaths.includes(location.pathname)) {
    return null;
  }

  return <Navbar />;
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  return (
    <Router>
      <div className="app-container">
        <ConditionalNavbar token={token} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route path="/home" element={token ? <Home /> : <Navigate to="/login" replace />} />
            <Route path="/route-confirmation" element={token ? <RouteConfirmation /> : <Navigate to="/login" replace />} />
            <Route path="/available-rides" element={token ? <AvailableRides /> : <Navigate to="/login" replace />} />
            <Route path="/my-trips" element={token ? <MyTrips /> : <Navigate to="/login" replace />} />
            <Route path="/live-tracking" element={token ? <LiveTracking /> : <Navigate to="/login" replace />} />
            <Route path="/wallet" element={token ? <Wallet /> : <Navigate to="/login" replace />} />
            <Route path="/my-vehicle" element={token ? <MyVehicle /> : <Navigate to="/login" replace />} />
            <Route path="/admin-dashboard" element={token ? <AdminDashboard /> : <Navigate to="/login" replace />} />
            <Route path="/payment" element={<PaymentMethod />} />
            <Route path="/ride-history" element={<RideHistory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/report" element={<Report />} />
            
            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;