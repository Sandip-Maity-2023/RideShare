import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./MyVehicle.css";

const MyVehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [model, setModel] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState(4);
  const [role, setRole] = useState("Driver");

  const navigate = useNavigate();

  // Safely retrieve user from localStorage
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch (error) {
      console.error("Error reading user from localStorage:", error);
      return {};
    }
  };

  const user = getUser();
  const userId = user.id || user._id;

  // --------------------------------------------------
  // FETCH VEHICLES
  // --------------------------------------------------
  const fetchVehicles = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/vehicles/${userId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch vehicles");
      }
      const data = await response.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // --------------------------------------------------
  // ADD VEHICLE
  // --------------------------------------------------
  const handleAddVehicle = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("User session not found. Please log in again.");
      return;
    }

    const newVehicleData = {
      driverId: userId,
      model,
      registrationNumber,
      seatingCapacity: Number(seatingCapacity),
      role,
    };

    try {
      const res = await fetch("http://localhost:5000/api/vehicles/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVehicleData),
      });

      if (res.ok) {
        const addedVehicle = await res.json();
        setVehicles((prev) => [...prev, addedVehicle]);
        setModel("");
        setRegistrationNumber("");
        setSeatingCapacity(4);
        setShowAddModal(false);
      } else {
        alert("Failed to register vehicle. Please try again.");
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert("Server connection error while adding vehicle.");
    }
  };

  // --------------------------------------------------
  // DELETE / REMOVE VEHICLE
  // --------------------------------------------------
  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to remove this vehicle?")) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/vehicles/${vehicleId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        setVehicles((prev) =>
          prev.filter((v) => (v._id || v.id) !== vehicleId)
        );
      } else {
        // Fallback UI update if backend delete endpoint varies
        setVehicles((prev) =>
          prev.filter((v) => (v._id || v.id) !== vehicleId)
        );
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      setVehicles((prev) =>
        prev.filter((v) => (v._id || v.id) !== vehicleId)
      );
    }
  };

  return (
    <div className="my-vehicle-page">
      {/* Sidebar */}
      <aside className="vehicle-sidebar">
        <h2 className="sidebar-title">My Vehicle</h2>
      </aside>

      {/* Main Content Area */}
      <main className="vehicle-main-content">
        {/* Header */}
        <div className="vehicle-detail-header">
          <div className="header-navigation">
            <span className="back-link" onClick={() => navigate(-1)}>
              &lt; My Vehicle
            </span>
          </div>

          <button
            type="button"
            className="add-vehicle-btn"
            onClick={() => setShowAddModal(true)}
          >
            + Add Vehicle
          </button>
        </div>

        {/* Modal / Form for Add Vehicle */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3>Register New Vehicle</h3>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  ✕
                </button>
              </div>

              <form className="vehicle-form" onSubmit={handleAddVehicle}>
                <div className="form-group">
                  <label>Vehicle Model</label>
                  <input
                    type="text"
                    placeholder="e.g., Swift Dzire, Alto 800"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Registration Number</label>
                  <input
                    type="text"
                    placeholder="e.g., GJ01AB1234"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Seating Capacity</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={seatingCapacity}
                      onChange={(e) => setSeatingCapacity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Assigned Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="Driver">Driver</option>
                      <option value="Owner">Owner</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Register Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Vehicles List */}
        {loading ? (
          <p className="loading-text">Loading your vehicles...</p>
        ) : vehicles.length === 0 ? (
          <div className="no-vehicles-box">
            <p>No vehicles registered yet. Click "Add Vehicle" to register one.</p>
          </div>
        ) : (
          <div className="vehicle-list">
            {vehicles.map((v) => {
              const vehicleId = v._id || v.id;
              const vehicleModel = v.model || v.name || "Unknown Vehicle";
              const regNo = v.registrationNumber || v.number || "--";
              const vehicleRole = v.role || "Driver";
              const seats = v.seatingCapacity || 4;

              return (
                <div key={vehicleId} className="vehicle-row-card">
                  <div className="vehicle-info-left">
                    <div className="car-icon-wrapper">
                      🚗
                    </div>
                    <div className="vehicle-model-name">
                      <h3>{vehicleModel}</h3>
                      <small>{seats} Seats</small>
                    </div>
                  </div>

                  <div className="vehicle-reg-number">
                    <span>{regNo}</span>
                  </div>

                  <div className="vehicle-driver-info">
                    <div className="driver-user-icon">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="driver-role-text">{vehicleRole}</span>
                  </div>

                  <button
                    type="button"
                    className="remove-vehicle-btn"
                    title="Remove Vehicle"
                    onClick={() => handleDeleteVehicle(vehicleId)}
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyVehicle;