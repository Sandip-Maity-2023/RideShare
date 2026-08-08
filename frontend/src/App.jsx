import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Core Pages
import Navbar from './components/Navbar';
import SplashScreen from './pages/SplashScreen';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import FindRide from './pages/FindRide';
import OfferRide from './pages/OfferRide';
import RouteConfirmation from './pages/RouteConfirmation';
import LiveTracking from './pages/LiveTracking';
import MyTrips from './pages/MyTrips';
import Wallet from './pages/Wallet';
import ReportsAnalytics from './pages/ReportAnalytics';

// Admin Tabs Container Page
import EmployeesTab from './pages/AdminDashboard/EmployeesTab';
import VehiclesTab from './pages/AdminDashboard/VehiclesTab';
import SettingsTab from './pages/AdminDashboard/SettingsTab';

const AdminContainer = () => {
  const [activeTab, setActiveTab] = useState('employees');

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Company Admin Dashboard</h1>
        {/* Tab Switcher Navigation Bar */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'employees' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            Employees
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'vehicles' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            Vehicles
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {activeTab === 'employees' && <EmployeesTab />}
      {activeTab === 'vehicles' && <VehiclesTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
};

function App() {
  const [user, setUser] = useState({
    _id: 'usr01',
    name: 'Dero Addict',
    email: 'admin@company.com',
    role: 'CompanyAdmin',
  });

  const registeredVehiclesSample = [
    {
      _id: 'veh01',
      registrationNumber: 'GJ01AB1234',
      model: 'Swift Dzire',
      seatingCapacity: 4,
      status: 'Active',
    },
    {
      _id: 'veh02',
      registrationNumber: 'GJ01CD5678',
      model: 'Honda City',
      seatingCapacity: 4,
      status: 'Active',
    },
  ];

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        {user && <Navbar user={user} onLogout={handleLogout} />}

        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<Login onLoginSuccess={setUser} />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Employee Module Routes */}
          <Route path="/find-ride" element={<FindRide />} />
          <Route
            path="/offer-ride"
            element={<OfferRide registeredVehicles={registeredVehiclesSample} />}
          />
          <Route path="/route-confirmation" element={<RouteConfirmation />} />
          <Route path="/live-tracking" element={<LiveTracking />} />
          <Route path="/my-trips" element={<MyTrips />} />
          <Route path="/my-vehicles" element={<AdminContainer />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/ride-history" element={<ReportsAnalytics />} />

          {/* Admin Dashboard Tabbed View */}
          <Route path="/admin" element={<AdminContainer />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;