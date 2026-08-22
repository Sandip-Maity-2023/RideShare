import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./RideHistory.css";

const RideHistory = () => {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch ride history directly from backend
  useEffect(() => {
    const fetchRideHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Attach auth token if present in localStorage
        const token = localStorage.getItem("token");
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const res = await axios.get("http://localhost:5000/api/rides/history", config);

        if (res.data && Array.isArray(res.data)) {
          setHistoryList(res.data);
        } else if (res.data && Array.isArray(res.data.history)) {
          setHistoryList(res.data.history);
        } else {
          setHistoryList([]);
        }
      } catch (err) {
        console.error("Error fetching ride history from backend:", err);
        setError("Failed to load ride history from server.");
        setHistoryList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRideHistory();
  }, []);

  return (
    <div className="ride-history-wrapper">
      {/* MAIN LAYOUT BODY */}
      <div className="main-layout-body">
        {/* LEFT SIDEBAR */}
        <aside className="left-sidebar">
          <div className="sidebar-menu-item active">Ride History</div>
        </aside>

        {/* RIGHT CONTENT PANEL */}
        <main className="content-panel">
          {/* BREADCRUMB / BACK BUTTON BAR */}
          <div className="content-header-bar">
            <button className="back-arrow-btn" onClick={() => navigate(-1)}>
              &lt;
            </button>
            <h2 className="header-title">Rides History</h2>
          </div>

          {/* RIDE HISTORY TABLE */}
          <div className="table-wrapper">
            {loading ? (
              <div className="status-state">Loading history records...</div>
            ) : error ? (
              <div className="status-state error">{error}</div>
            ) : historyList.length === 0 ? (
              <div className="status-state">No completed rides found in database.</div>
            ) : (
              <table className="ride-history-table">
                <tbody>
                  {historyList.map((ride) => {
                    const driver =
                      ride.driverName ||
                      ride.driver?.name ||
                      ride.user?.name ||
                      "Driver";

                    const route =
                      ride.route ||
                      `${ride.pickupLocation || ride.startLocation || "Pickup"} to ${
                        ride.dropLocation || ride.destination || "Destination"
                      }`;

                    const plate =
                      ride.plateNumber ||
                      ride.vehicleNumber ||
                      ride.vehicle?.plateNumber ||
                      ride.carDetails?.plateNumber ||
                      "N/A";

                    const formattedTime =
                      ride.dateTime ||
                      ride.time ||
                      (ride.createdAt
                        ? new Date(ride.createdAt).toLocaleString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A");

                    return (
                      <tr key={ride._id || ride.id || Math.random()} className="history-row">
                        {/* Driver Info */}
                        <td className="col-driver">
                          <div className="driver-cell">
                            <div className="user-icon-circle">👤</div>
                            <span className="driver-name">{driver}</span>
                          </div>
                        </td>

                        {/* Route Info */}
                        <td className="col-route">
                          <div className="route-cell">
                            <span className="pin-icon">📍</span>
                            <span className="route-text">{route}</span>
                          </div>
                        </td>

                        {/* Vehicle Plate Info */}
                        <td className="col-plate">
                          <div className="plate-cell">
                            <span className="car-icon">🚗</span>
                            <span className="plate-text">{plate}</span>
                          </div>
                        </td>

                        {/* Date & Time Info */}
                        <td className="col-time">
                          <span className="time-text">{formattedTime}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RideHistory;