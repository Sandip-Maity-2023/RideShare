import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AvailableRides.css";

const AvailableRides = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeData = location.state?.routeData || {};

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to check if a ride's scheduled time has already passed
  const isRideExpired = (ride) => {
    if (!ride.date || !ride.time) return false;
    const rideDateTime = new Date(`${ride.date}T${ride.time}`);
    return rideDateTime < new Date();
  };

  const fetchAvailableRides = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch rides using route parameters if present, or fetch all published rides
      const response = await axios.post("http://localhost:5000/api/rides/search", {
        pickupLocation: routeData.pickupLocation || "",
        dropLocation: routeData.dropLocation || routeData.destination || "",
        startCoords: routeData.startCoords,
        destCoords: routeData.destCoords,
      });

      // Filter out any ride that has exceeded its scheduled time
      const activeRides = (response.data || []).filter(
        (ride) => !isRideExpired(ride)
      );

      setRides(activeRides);
    } catch (err) {
      console.error("Error fetching available rides:", err);
      // Fallback to GET endpoint if search query fails
      try {
        const fallbackRes = await axios.get("http://localhost:5000/api/rides");
        const activeRides = (fallbackRes.data || []).filter(
          (ride) => !isRideExpired(ride)
        );
        setRides(activeRides);
      } catch (fallbackErr) {
        setError("Failed to load available rides. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableRides();
  }, [location.state]);

  const handleBookNow = (ride) => {
    navigate("/live-tracking", {
      state: {
        rideData: ride,
        routeData: routeData,
      },
    });
  };

  // Helper to extract clean location names
  const formatLocation = (loc) => {
    if (!loc) return "";
    return loc.split(",")[0];
  };

  // Helper to format date and time dynamically
  const formatRideDateTime = (ride) => {
    if (ride.time && ride.date) {
      return `${ride.time} | ${ride.date}`;
    }
    return ride.timeDate || "Scheduled";
  };

  // Helper function to resolve vehicle details cleanly with strict non-null object checks
  const getVehicleDetails = (ride) => {
    const v = ride?.vehicle && typeof ride.vehicle === "object" ? ride.vehicle : {};
    const c = ride?.carDetails && typeof ride.carDetails === "object" ? ride.carDetails : {};

    const brand =
      v.brand ||
      v.make ||
      v.company ||
      c.brand ||
      c.make ||
      ride?.vehicleBrand ||
      ride?.brand ||
      "";

    const model =
      v.model ||
      v.name ||
      v.vehicleName ||
      c.model ||
      c.name ||
      ride?.vehicleModel ||
      ride?.model ||
      (typeof ride?.carDetails === "string" ? ride.carDetails : "") ||
      (typeof ride?.vehicle === "string" ? ride.vehicle : "") ||
      "Vehicle";

    const regNumber =
      v.plateNumber ||
      v.registrationNumber ||
      v.number ||
      v.vehicleNumber ||
      c.plateNumber ||
      c.registrationNumber ||
      c.number ||
      c.vehicleNumber ||
      ride?.plateNumber ||
      ride?.vehicleNumber ||
      ride?.carNumber ||
      "";

    return { brand, model, regNumber };
  };

  return (
    <div className="available-rides-container">
      {/* HEADER NAVIGATION */}
      <div className="rides-sub-header">
        <button className="back-link-btn" onClick={() => navigate("/home")}>
          &lt; Back to Home
        </button>
      </div>

      {/* RIDES LIST AREA */}
      <div className="rides-content">
        {loading && <div className="status-indicator">Loading rides...</div>}

        {error && <div className="status-indicator error-text">{error}</div>}

        {!loading && !error && rides.length === 0 && (
          <div className="no-rides-box">
            No active drivers found for this route. Try clicking Refresh or adjusting your search.
          </div>
        )}

        {!loading &&
          !error &&
          rides.map((ride, index) => {
            const driverName =
              ride.driver?.name || ride.driverName || "Driver";

            const { brand, model, regNumber } = getVehicleDetails(ride);

            const pickup =
              formatLocation(ride.pickupLocation) ||
              formatLocation(routeData.pickupLocation) ||
              "Start Location";
            const destination =
              formatLocation(ride.destination || ride.dropLocation) ||
              formatLocation(routeData.dropLocation) ||
              "Destination";

            return (
              <div key={ride._id || ride.id || index} className="ride-card-item">
                <div className="card-top-row">
                  <div className="driver-profile-group">
                    <div className="avatar-circle">
                      {ride.driverAvatar ? (
                        <img src={ride.driverAvatar} alt={driverName} />
                      ) : (
                        <span className="default-avatar-icon">👤</span>
                      )}
                    </div>
                    <div className="driver-meta">
                      <span className="driver-name-title">{driverName}</span>
                      <div className="vehicle-badge-info">
                        🚗 <strong>{[brand, model].filter(Boolean).join(" ")}</strong>
                        {regNumber && (
                          <span className="reg-number-tag"> [{regNumber}]</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="time-date-badge">
                    🕒 {formatRideDateTime(ride)}
                    <button className="more-options-btn">⋮</button>
                  </div>
                </div>

                <div className="card-bottom-row">
                  <div className="route-path-text">
                    📍 {pickup} ➔ {destination}
                  </div>

                  <div className="price-seat-info">
                    ₹ {ride.fare || ride.price || 120} / Seat (
                    {ride.availableSeats !== undefined ? ride.availableSeats : 1} Available)
                  </div>

                  <button
                    className="book-now-btn"
                    onClick={() => handleBookNow(ride)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            );
          })}

        {/* BOTTOM REFRESH BUTTON */}
        <button
          className="refresh-bottom-btn"
          onClick={fetchAvailableRides}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>
  );
};

export default AvailableRides;