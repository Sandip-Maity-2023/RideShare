import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('employees');

  // Real Metric State from Backend
  const [ridesThisMonth, setRidesThisMonth] = useState(0);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Profile Dropdown & Glassmorphism Modal state
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Admin Info State
  const [adminProfile, setAdminProfile] = useState({
    name: 'System Admin',
    email: 'admin@odoo.com',
    position: 'Chief Administrator',
    location: 'Ahmedabad, Gujarat',
    phone: '+91 98765 43210',
    address: 'Odoo Tower, Infocity, Gandhinagar'
  });

  // Temporary Form State for Modal Editing
  const [profileForm, setProfileForm] = useState({ ...adminProfile });

  // State - Employees
  const [employees, setEmployees] = useState([
    { _id: '1', name: 'Raj Patel', email: 'raj.patel@co.com', department: 'Engineering', manager: 'A. Shah', location: 'Ahmedabad', platformAccess: 'Granted' },
    { _id: '2', name: 'Krishna Singh', email: 'krishna.s@co.com', department: 'Sales', manager: 'R. Mehta', location: 'Ahmedabad', platformAccess: 'Granted' },
    { _id: '3', name: 'Priya Nair', email: 'priya.nair@co.com', department: 'HR', manager: 'A. Shah', location: 'Gandhinagar', platformAccess: 'Revoked' }
  ]);

  // State - Vehicles
  const [vehicles, setVehicles] = useState([
    { _id: '1', regNo: 'GJ01AB1234', model: 'Swift Dzire', capacity: 4, driver: 'Raj Patel', status: 'Active' },
    { _id: '2', regNo: 'GJ01AB503', model: 'Alto 800', capacity: 3, driver: 'Krishna Singh', status: 'Active' },
    { _id: '3', regNo: 'GJ01CD778', model: 'Innova Crysta', capacity: 6, driver: 'Priya Nair', status: 'Inactive' }
  ]);

  // State - Settings
  const [settings, setSettings] = useState({
    companyName: 'Odoo Pvt. Ltd.',
    industry: 'Software',
    address: 'Gandhinagar',
    adminContact: 'admin@odoo.com',
    fuelCost: '96.50',
    costPerKm: '8.00',
    travelCost: '2.50'
  });

  // Modals state
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  // Form states
  const [empForm, setEmpForm] = useState({ name: '', email: '', department: 'Engineering', manager: '', location: '' });
  const [vehForm, setVehForm] = useState({ regNo: '', model: '', capacity: '', driver: '' });

  /* =========================================
     FETCH REAL RIDES METRICS FROM BACKEND
  ========================================= */
  useEffect(() => {
    const fetchRideMetrics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/reports', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (response.data && response.data.success) {
          const currentMonthIdx = new Date().getMonth(); // 0 = Jan, 1 = Feb, etc.
          const financialData = response.data.financialSummary || [];

          // Find metric corresponding to the current month or aggregate total rides
          const currentMonthMetric = financialData.find(
            (item) => item.id === currentMonthIdx + 1
          );

          if (currentMonthMetric && currentMonthMetric.totalRides !== undefined) {
            setRidesThisMonth(currentMonthMetric.totalRides);
          } else {
            // Fallback: Total count across financial records or fuel efficiency array length
            const totalMonthlyRides = (response.data.fuelEfficiency || []).reduce(
              (acc, item) => acc + (item.val ? Number(item.val) : 0),
              0
            );
            setRidesThisMonth(totalMonthlyRides || response.data.fuelEfficiency?.length || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching real ride metrics:', error);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchRideMetrics();
  }, []);

  // Handlers for Profile
  const handleOpenUpdateModal = () => {
    setProfileForm({ ...adminProfile });
    setShowDropdown(false);
    setShowUpdateModal(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setAdminProfile({ ...profileForm });
    setShowUpdateModal(false);
    alert('Admin details updated successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  // Toggle Employee Access
  const handleToggleAccess = (id) => {
    setEmployees(
      employees.map((emp) =>
        emp._id === id
          ? { ...emp, platformAccess: emp.platformAccess === 'Granted' ? 'Revoked' : 'Granted' }
          : emp
      )
    );
  };

  // Add Employee
  const handleAddEmployee = (e) => {
    e.preventDefault();
    const newEmp = { ...empForm, _id: Date.now().toString(), platformAccess: 'Granted' };
    setEmployees([...employees, newEmp]);
    setShowEmployeeModal(false);
    setEmpForm({ name: '', email: '', department: 'Engineering', manager: '', location: '' });
  };

  // Toggle Vehicle Status
  const handleToggleVehicleStatus = (id) => {
    setVehicles(
      vehicles.map((v) =>
        v._id === id ? { ...v, status: v.status === 'Active' ? 'Inactive' : 'Active' } : v
      )
    );
  };

  // Add Vehicle
  const handleAddVehicle = (e) => {
    e.preventDefault();
    const newVeh = { ...vehForm, _id: Date.now().toString(), status: 'Active' };
    setVehicles([...vehicles, newVeh]);
    setShowVehicleModal(false);
    setVehForm({ regNo: '', model: '', capacity: '', driver: '' });
  };

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    alert('Organization settings saved successfully!');
  };

  return (
    <div className="admin-container">
      {/* Primary Header Card */}
      <header className="admin-header">
        <div className="brand-section">
          <div className="logo-badge">Company Logo</div>
          <span className="header-title">
            {activeTab === 'employees' && 'Admin Dashboard - Employees Tab'}
            {activeTab === 'vehicles' && 'Admin Dashboard - Vehicles Tab'}
            {activeTab === 'settings' && 'Admin Dashboard - Settings Tab'}
          </span>
        </div>

        {/* Profile Dropdown Area */}
        <div className="admin-profile-wrapper">
          <div
            className="admin-profile"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span>{adminProfile.name.split(' ')[0] || 'Admin'}</span>
            <div className="avatar-circle"></div>
            <span className={`dropdown-caret ${showDropdown ? 'open' : ''}`}>▼</span>
          </div>

          {showDropdown && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-user-info">
                <strong>{adminProfile.name}</strong>
                <small>{adminProfile.email}</small>
              </div>
              <hr className="dropdown-divider" />
              <button className="dropdown-item" onClick={handleOpenUpdateModal}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Update Profile
              </button>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Top Metrics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total Employees</p>
          <h2 className="stat-value">{employees.length}</h2>
        </div>
        <div className="stat-card">
          <p className="stat-label">Registered Vehicles</p>
          <h2 className="stat-value">{vehicles.length}</h2>
        </div>
        <div className="stat-card">
          <p className="stat-label">Rides This Month</p>
          <h2 className="stat-value">
            {loadingMetrics ? '...' : ridesThisMonth}
          </h2>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sub-tab-bar">
        <button
          className={`sub-tab ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          Employees
        </button>
        <button
          className={`sub-tab ${activeTab === 'vehicles' ? 'active' : ''}`}
          onClick={() => setActiveTab('vehicles')}
        >
          Vehicles
        </button>
        <button
          className={`sub-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* TAB 1: EMPLOYEES */}
      {activeTab === 'employees' && (
        <div className="table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Manager</th>
                <th>Location</th>
                <th>Platform Access</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td className="emp-name">{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.department}</td>
                  <td>{emp.manager}</td>
                  <td>{emp.location}</td>
                  <td>
                    <button
                      className={`access-btn ${emp.platformAccess === 'Granted' ? 'granted' : 'revoked'}`}
                      onClick={() => handleToggleAccess(emp._id)}
                    >
                      [{emp.platformAccess}]
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="action-bar">
            <button className="add-btn" onClick={() => setShowEmployeeModal(true)}>
              + Add Employee
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: VEHICLES */}
      {activeTab === 'vehicles' && (
        <div className="table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Registration Number</th>
                <th>Model</th>
                <th>Seating Capacity</th>
                <th>Driver</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((veh) => (
                <tr key={veh._id}>
                  <td className="emp-name">{veh.regNo}</td>
                  <td>{veh.model}</td>
                  <td>{veh.capacity}</td>
                  <td>{veh.driver}</td>
                  <td>
                    <button
                      className={`access-btn ${veh.status === 'Active' ? 'granted' : 'revoked'}`}
                      onClick={() => handleToggleVehicleStatus(veh._id)}
                    >
                      [{veh.status}]
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="action-bar">
            <button className="add-btn" onClick={() => setShowVehicleModal(true)}>
              + Add Vehicle
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="settings-card">
          <form onSubmit={handleSaveSettings}>
            <div className="settings-group">
              <h3 className="section-title">Company Details</h3>
              <div className="settings-grid">
                <div className="field-box">
                  <label>Company</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  />
                </div>
                <div className="field-box">
                  <label>Industry</label>
                  <input
                    type="text"
                    value={settings.industry}
                    onChange={(e) => setSettings({ ...settings, industry: e.target.value })}
                  />
                </div>
                <div className="field-box">
                  <label>Registered Address</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  />
                </div>
                <div className="field-box">
                  <label>Admin Contact</label>
                  <input
                    type="email"
                    value={settings.adminContact}
                    onChange={(e) => setSettings({ ...settings, adminContact: e.target.value })}
                  />
                </div>
                <div className="field-box">
                  <label>Registered Employees</label>
                  <input type="text" value={employees.length} disabled />
                </div>
              </div>
            </div>

            <div className="settings-group">
              <h3 className="section-title">Carpooling Configuration</h3>
              <div className="settings-grid">
                <div className="field-box">
                  <label>Fuel Cost / Liter (Rs.)</label>
                  <input
                    type="text"
                    value={settings.fuelCost}
                    onChange={(e) => setSettings({ ...settings, fuelCost: e.target.value })}
                  />
                </div>
                <div className="field-box">
                  <label>Cost Per KM (Rs.)</label>
                  <input
                    type="text"
                    value={settings.costPerKm}
                    onChange={(e) => setSettings({ ...settings, costPerKm: e.target.value })}
                  />
                </div>
                <div className="field-box">
                  <label>Travel Cost (Operational) (Rs. / KM)</label>
                  <input
                    type="text"
                    value={settings.travelCost}
                    onChange={(e) => setSettings({ ...settings, travelCost: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="action-bar">
              <button type="submit" className="add-btn">
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: UPDATE ADMIN DETAILS */}
      {showUpdateModal && (
        <div className="glass-modal-overlay">
          <div className="glass-card-modal">
            <div className="glass-modal-header">
              <h2>Update Admin Profile</h2>
              <button className="glass-close-btn" onClick={() => setShowUpdateModal(false)}>×</button>
            </div>

            <form onSubmit={handleSaveProfile} className="glass-form">
              <div className="glass-grid">
                <div className="glass-input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="glass-input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="glass-input-group">
                  <label>Position / Role</label>
                  <input
                    type="text"
                    value={profileForm.position}
                    onChange={(e) => setProfileForm({ ...profileForm, position: e.target.value })}
                    required
                  />
                </div>

                <div className="glass-input-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    required
                  />
                </div>

                <div className="glass-input-group">
                  <label>Contact Phone</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="glass-input-group full-width">
                  <label>Office Address</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="glass-modal-actions">
                <button type="button" className="glass-btn-cancel" onClick={() => setShowUpdateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="glass-btn-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Employee */}
      {showEmployeeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Employee</h3>
            <form onSubmit={handleAddEmployee} className="modal-form">
              <input type="text" placeholder="Full Name" value={empForm.name} onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })} required />
              <input type="email" placeholder="Email" value={empForm.email} onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })} required />
              <input type="text" placeholder="Department" value={empForm.department} onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })} required />
              <input type="text" placeholder="Manager" value={empForm.manager} onChange={(e) => setEmpForm({ ...empForm, manager: e.target.value })} required />
              <input type="text" placeholder="Location" value={empForm.location} onChange={(e) => setEmpForm({ ...empForm, location: e.target.value })} required />
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEmployeeModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">Save & Grant Access</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Vehicle */}
      {showVehicleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Vehicle</h3>
            <form onSubmit={handleAddVehicle} className="modal-form">
              <input type="text" placeholder="Registration Number" value={vehForm.regNo} onChange={(e) => setVehForm({ ...vehForm, regNo: e.target.value })} required />
              <input type="text" placeholder="Vehicle Model" value={vehForm.model} onChange={(e) => setVehForm({ ...vehForm, model: e.target.value })} required />
              <input type="number" placeholder="Seating Capacity" value={vehForm.capacity} onChange={(e) => setVehForm({ ...vehForm, capacity: e.target.value })} required />
              <input type="text" placeholder="Assigned Driver Name" value={vehForm.driver} onChange={(e) => setVehForm({ ...vehForm, driver: e.target.value })} required />
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowVehicleModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">Register Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;