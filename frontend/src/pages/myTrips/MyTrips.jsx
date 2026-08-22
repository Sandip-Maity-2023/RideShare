import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./MyTrips.css";

// Environment variable safety check (supports Vite & CRA)
const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000";

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [activeMenuTripId, setActiveMenuTripId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  // Helper to read locally saved completed trip IDs (persists across refreshes even if backend fails)
  const getLocallyCompletedTrips = () => {
    try {
      const stored = localStorage.getItem("completedTripIds");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const markTripLocallyCompleted = (tripId) => {
    try {
      const current = getLocallyCompletedTrips();
      if (!current.includes(String(tripId))) {
        current.push(String(tripId));
        localStorage.setItem("completedTripIds", JSON.stringify(current));
      }
    } catch (e) {
      console.error("Failed to save local trip status:", e);
    }
  };

  const markTripLocallyActive = (tripId) => {
    try {
      const current = getLocallyCompletedTrips();
      const updated = current.filter((id) => id !== String(tripId));
      localStorage.setItem("completedTripIds", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to update local trip status:", e);
    }
  };

  // Safely get logged-in user and token
  const getUserData = () => {
    try {
      const storedUser = localStorage.getItem("user");
      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken");

      let parsedUser = {};
      if (storedUser) {
        parsedUser = JSON.parse(storedUser);
      }

      const userId =
        parsedUser._id ||
        parsedUser.id ||
        parsedUser.userId ||
        parsedUser.user?._id ||
        parsedUser.user?.id;

      return { user: parsedUser, userId, token };
    } catch (error) {
      console.error(
        "Error reading authentication data from localStorage:",
        error
      );
      return { user: {}, userId: null, token: null };
    }
  };

  const { userId, token } = getUserData();

  // Close options menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuTripId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --------------------------------------------------
  // FORMAT DATE/TIME
  // --------------------------------------------------
  const formatDateTime = (rawDate) => {
    if (!rawDate) return "--";
    const dateObj = new Date(rawDate);
    if (Number.isNaN(dateObj.getTime())) return "--";

    const timeStr = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = dateObj.toLocaleString("en-US", { month: "short" });
    const year = dateObj.getFullYear().toString().slice(-2);

    return `${timeStr} ${day}/${month}/${year}`;
  };

  // --------------------------------------------------
  // CHECK PAYMENT & COMPLETION STATUS
  // --------------------------------------------------
  const checkIsPaid = (trip) => {
    if (!trip) return false;
    return (
      trip.isPaid === true ||
      trip.isPaid === "true" ||
      trip.paid === true ||
      trip.paid === "true" ||
      trip.paymentStatus === "completed" ||
      trip.paymentStatus === "paid"
    );
  };

  const checkIsCompleted = (trip) => {
    if (!trip) return false;
    const tripId = String(trip._id || trip.id);
    const localCompleted = getLocallyCompletedTrips();

    return (
      trip.status === "completed" ||
      trip.status === "paid" ||
      checkIsPaid(trip) ||
      localCompleted.includes(tripId)
    );
  };

  // --------------------------------------------------
  // FETCH USER TRIPS
  // --------------------------------------------------
  const fetchTrips = useCallback(async () => {
    if (!userId) {
      console.warn("⚠️ No user ID found in localStorage. Unable to fetch trips.");
      setTrips([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(
        `${API_BASE_URL}/api/rides/my-trips/${userId}`,
        { method: "GET", headers }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch trips: ${response.status}`);
      }

      const data = await response.json();

      const fetchedTrips = Array.isArray(data)
        ? data
        : Array.isArray(data.trips)
        ? data.trips
        : Array.isArray(data.data)
        ? data.data
        : [];

      // Merge backend status with local completion storage
      const localCompleted = getLocallyCompletedTrips();
      const mergedTrips = fetchedTrips.map((trip) => {
        const id = String(trip._id || trip.id);
        if (localCompleted.includes(id)) {
          return { ...trip, status: "completed" };
        }
        return trip;
      });

      setTrips(mergedTrips);
    } catch (error) {
      console.error("❌ Error fetching trips from server:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // --------------------------------------------------
  // HANDLE PAYMENT SUCCESS RETURN
  // --------------------------------------------------
  useEffect(() => {
    const paymentSuccess = location.state?.paymentSuccess;
    const paymentTripId = location.state?.tripId;

    if (!paymentSuccess || !paymentTripId) return;

    const paymentTimestamp = location.state?.paidAt || new Date().toISOString();

    markTripLocallyCompleted(paymentTripId);

    setTrips((prevTrips) =>
      prevTrips.map((trip) => {
        const currentId = trip._id || trip.id;
        if (String(currentId) !== String(paymentTripId)) return trip;

        return {
          ...trip,
          isPaid: true,
          paid: true,
          paymentStatus: "paid",
          paidAt: paymentTimestamp,
          status: "completed",
          completedAt: trip.completedAt || paymentTimestamp,
        };
      })
    );

    setActiveTab("completed");
    navigate("/my-trips", { replace: true, state: {} });
  }, [location.state, navigate]);

  // --------------------------------------------------
  // COMPLETE TRIP (PERSIST TO BACKEND + LOCAL STORAGE)
  // --------------------------------------------------
  const handleCompleteTrip = async (tripId) => {
    if (!tripId) {
      alert("Trip ID not available.");
      return;
    }

    const completedTimestamp = new Date().toISOString();
    const payload = { status: "completed", completedAt: completedTimestamp };
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    let syncSuccess = false;

    // Persist to local storage immediately so page refresh keeps it completed
    markTripLocallyCompleted(tripId);

    // Endpoints to attempt sequentially
    const endpoints = [
      { url: `${API_BASE_URL}/api/rides/complete-trip/${tripId}`, method: "PATCH" },
      { url: `${API_BASE_URL}/api/rides/update-status/${tripId}`, method: "PATCH" },
      { url: `${API_BASE_URL}/api/rides/status/${tripId}`, method: "PATCH" },
      { url: `${API_BASE_URL}/api/rides/${tripId}`, method: "PUT" },
      { url: `${API_BASE_URL}/api/rides/${tripId}`, method: "PATCH" },
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep.url, {
          method: ep.method,
          headers,
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          syncSuccess = true;
          break;
        }
      } catch (e) {
        // Continue to next endpoint attempt
      }
    }

    if (!syncSuccess) {
      console.warn(
        "Backend update could not be confirmed. Trip is preserved as completed in local session."
      );
    }

    // Update state & switch tab
    setTrips((prevTrips) =>
      prevTrips.map((trip) => {
        const currentId = trip._id || trip.id;
        if (String(currentId) !== String(tripId)) return trip;
        return {
          ...trip,
          status: "completed",
          completedAt: completedTimestamp,
        };
      })
    );

    setActiveTab("completed");
  };

  // --------------------------------------------------
  // REVERT TO ACTIVE
  // --------------------------------------------------
  const handleRevertToActive = async (tripId) => {
    if (!tripId) return;

    markTripLocallyActive(tripId);

    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      await fetch(`${API_BASE_URL}/api/rides/update-status/${tripId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: "active" }),
      });
    } catch (err) {
      console.warn("Failed to revert status on server:", err);
    }

    setTrips((prevTrips) =>
      prevTrips.map((trip) => {
        const currentId = trip._id || trip.id;
        if (String(currentId) !== String(tripId)) return trip;
        return { ...trip, status: "active" };
      })
    );

    setActiveTab("active");
  };

  // --------------------------------------------------
  // CANCEL TRIP
  // --------------------------------------------------
  const handleCancelTrip = async (tripId) => {
    if (!tripId) return;
    if (!window.confirm("Are you sure you want to cancel this trip?")) return;

    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${API_BASE_URL}/api/rides/cancel-trip/${tripId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: "cancelled" }),
      });
    } catch (error) {
      console.warn("Backend cancel call error, updating locally:", error);
    }

    setTrips((prev) =>
      prev.map((t) =>
        (t._id || t.id) === tripId ? { ...t, status: "cancelled" } : t
      )
    );
    setActiveMenuTripId(null);
  };

  // --------------------------------------------------
  // DOWNLOAD RECEIPT
  // --------------------------------------------------
  const handleDownloadReceipt = (trip) => {
    const tripId = trip._id || trip.id;
    const isPaid = checkIsPaid(trip);
    const receiptText = `
========================================
              TRIP RECEIPT              
========================================
Trip ID:        ${tripId}
Driver Name:    ${trip.driver?.name || trip.driverName || "Driver"}
Route:          ${trip.pickupLocation || trip.startLocation || "Pickup"} -> ${
      trip.destination || trip.destinationLocation || "Destination"
    }
Vehicle:        ${trip.vehicle?.name || trip.vehicleName || "Vehicle"} (${
      trip.vehicle?.number || trip.vehicleNumber || "N/A"
    })
Total Fare:     ₹${trip.fare || trip.price || 0}
Payment Status: ${isPaid ? "PAID" : "UNPAID"}
Date/Time:      ${formatDateTime(trip.createdAt || trip.bookingTime)}
========================================
Thank you for riding with us!
    `;

    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Receipt_Trip_${tripId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setActiveMenuTripId(null);
  };

  const handleCallDriver = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      alert("Driver phone number not available.");
    }
  };

  const handleChatDriver = (trip) => {
    navigate("/chat", { state: { trip, driver: trip.driver || null } });
  };

  const handlePayNow = (trip) => {
    if (!trip) return;
    if (checkIsPaid(trip)) {
      alert("Payment for this trip has already been completed.");
      return;
    }
    const tripId = trip._id || trip.id;
    const fare = Number(trip.fare) || Number(trip.price) || 120;

    navigate("/payment", { state: { trip, tripId, fare } });
  };

  const handleHeaderBack = () => {
    if (activeTab === "completed") {
      setActiveTab("active");
    } else {
      navigate(-1);
    }
  };

  // --------------------------------------------------
  // FILTER TRIPS
  // --------------------------------------------------
  const filteredTrips = trips.filter((trip) => {
    const isCompleted = checkIsCompleted(trip);

    if (activeTab === "active") {
      return !isCompleted && trip.status !== "cancelled";
    }
    if (activeTab === "completed") {
      return isCompleted;
    }
    return true;
  });

  const menuContainerStyle = {
    position: "relative",
    display: "inline-block",
  };

  const menuDropdownStyle = {
    position: "absolute",
    right: 0,
    top: "100%",
    backgroundColor: "#ffffff",
    border: "1px solid #ddd",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
    borderRadius: "8px",
    zIndex: 999,
    minWidth: "160px",
    display: "flex",
    flexDirection: "column",
    padding: "6px 0",
  };

  const menuItemStyle = {
    background: "none",
    border: "none",
    padding: "10px 16px",
    textAlign: "left",
    fontSize: "14px",
    cursor: "pointer",
    width: "100%",
    color: "#333",
  };

  return (
    <div className="my-trips-page">
      <aside className="trips-sidebar">
        <h2 className="sidebar-title">My Trips</h2>
      </aside>

      <main className="trips-main-content">
        <div className="trip-detail-header">
          <div className="header-navigation">
            <span className="back-link" onClick={handleHeaderBack}>
              &lt; {activeTab === "completed" ? "Trip Finish" : "Trip Detail"}
            </span>

            <div className="trip-tabs">
              <button
                type="button"
                className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
                onClick={() => setActiveTab("active")}
              >
                Active
              </button>
              <button
                type="button"
                className={`tab-btn ${
                  activeTab === "completed" ? "active" : ""
                }`}
                onClick={() => setActiveTab("completed")}
              >
                Trip Finish
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="loading-text">Loading your trips...</p>
        ) : filteredTrips.length === 0 ? (
          <div className="no-trips-box">
            <p>
              No{" "}
              {activeTab !== "all"
                ? activeTab === "completed"
                  ? "completed"
                  : activeTab
                : ""}{" "}
              trips found.
            </p>
          </div>
        ) : (
          <div className="trips-list">
            {filteredTrips.map((trip) => {
              const tripId = trip._id || trip.id;
              const isPaid = checkIsPaid(trip);
              const isCompleted = checkIsCompleted(trip);

              const driverName =
                trip.driver?.name || trip.driverName || "Driver";
              const driverPhone =
                trip.driver?.phone || trip.driverPhone || "";
              const vehicleName =
                trip.vehicle?.name || trip.vehicleName || "Vehicle";
              const vehicleNumber =
                trip.vehicle?.number || trip.vehicleNumber || "";
              const pickup =
                trip.pickupLocation || trip.startLocation || "Pickup";
              const drop =
                trip.destination || trip.destinationLocation || "Destination";
              const fare = trip.fare || trip.price || 0;
              const seats = trip.seats || 1;

              const bookedTimeDisplay = formatDateTime(
                trip.createdAt || trip.bookingTime
              );
              const completedTimeDisplay = formatDateTime(
                trip.completedAt || trip.paidAt || trip.createdAt
              );

              /* ================= FINISHED TRIP CARD ================= */
              if (isCompleted) {
                return (
                  <div
                    key={tripId}
                    className="trip-detail-card light-blue-card"
                  >
                    <div className="card-top-row">
                      <div className="driver-profile-info">
                        <div className="driver-avatar">
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <h3 className="route-heading-large">
                          {pickup} to {drop}
                        </h3>
                      </div>

                      <div className="card-top-right">
                        <span className="trip-schedule">
                          {completedTimeDisplay}
                        </span>

                        <div
                          className="options-menu-container"
                          style={menuContainerStyle}
                          ref={activeMenuTripId === tripId ? menuRef : null}
                        >
                          <button
                            type="button"
                            className="menu-options-btn"
                            onClick={() =>
                              setActiveMenuTripId(
                                activeMenuTripId === tripId ? null : tripId
                              )
                            }
                          >
                            ⋮
                          </button>

                          {activeMenuTripId === tripId && (
                            <div
                              className="dropdown-menu"
                              style={menuDropdownStyle}
                            >
                              <button
                                type="button"
                                style={menuItemStyle}
                                onClick={() => handleDownloadReceipt(trip)}
                              >
                                📄 Download Receipt
                              </button>
                              <button
                                type="button"
                                style={menuItemStyle}
                                onClick={() => {
                                  alert("Issue reported successfully.");
                                  setActiveMenuTripId(null);
                                }}
                              >
                                ⚠️ Report Issue
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="finish-card-body">
                      <div className="finish-locations-group">
                        <div className="loc-item">
                          <span className="loc-pin-red">📍</span>
                          <div className="loc-text">
                            <span className="block-label">Pick UP Point</span>
                            <strong>{pickup}</strong>
                          </div>
                        </div>
                        <div className="loc-item">
                          <span className="loc-pin-red">📍</span>
                          <div className="loc-text">
                            <span className="block-label">Drop Point</span>
                            <strong>{drop}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="finish-fare-large">
                        <span className="currency-symbol">₹</span>
                        <span className="fare-number">{fare}</span>
                      </div>
                    </div>

                    <div className="finish-card-action-group">
                      <button
                        type="button"
                        className="back-to-active-btn"
                        onClick={() => handleRevertToActive(tripId)}
                      >
                        ← Back to Trip Details
                      </button>

                      <button
                        type="button"
                        className={`pay-now-btn ${
                          isPaid ? "disabled-pay-btn" : ""
                        }`}
                        disabled={isPaid}
                        onClick={() => handlePayNow(trip)}
                      >
                        {isPaid ? "Paid ✓" : "Pay Now"}
                      </button>
                    </div>
                  </div>
                );
              }

              /* ================= ACTIVE TRIP CARD ================= */
              return (
                <div
                  key={tripId}
                  className="trip-detail-card light-blue-card"
                >
                  <div className="card-top-row">
                    <div className="driver-profile-info">
                      <div className="driver-avatar">
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>

                      <div className="driver-name-route">
                        <h4 className="driver-name">{driverName}</h4>
                        <span className="route-subtitle">
                          {pickup} to {drop}
                        </span>
                      </div>
                    </div>

                    <div className="card-top-right">
                      <span className="trip-schedule">
                        {bookedTimeDisplay}
                      </span>

                      <div
                        className="options-menu-container"
                        style={menuContainerStyle}
                        ref={activeMenuTripId === tripId ? menuRef : null}
                      >
                        <button
                          type="button"
                          className="menu-options-btn"
                          onClick={() =>
                            setActiveMenuTripId(
                              activeMenuTripId === tripId ? null : tripId
                            )
                          }
                        >
                          ⋮
                        </button>

                        {activeMenuTripId === tripId && (
                          <div
                            className="dropdown-menu"
                            style={menuDropdownStyle}
                          >
                            <button
                              type="button"
                              style={menuItemStyle}
                              onClick={() => handleCancelTrip(tripId)}
                            >
                              ❌ Cancel Trip
                            </button>
                            <button
                              type="button"
                              style={menuItemStyle}
                              onClick={() => handleDownloadReceipt(trip)}
                            >
                              📄 Download Receipt
                            </button>
                            <button
                              type="button"
                              style={menuItemStyle}
                              onClick={() => {
                                alert("Issue reported successfully.");
                                setActiveMenuTripId(null);
                              }}
                            >
                              ⚠️ Report Issue
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="card-middle-row">
                    <div className="info-block vehicle-block">
                      <span className="block-label">Vehicle</span>
                      <div className="block-content">
                        <span className="vehicle-icon">🚗</span>
                        <div className="vehicle-text">
                          <strong>{vehicleName}</strong>
                          <small>{vehicleNumber}</small>
                        </div>
                      </div>
                    </div>

                    <div className="info-block location-block">
                      <div className="loc-item">
                        <span className="loc-pin-red">📍</span>
                        <div className="loc-text">
                          <span className="block-label">Pick UP Point</span>
                          <strong>{pickup}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="info-block location-block">
                      <div className="loc-item">
                        <span className="loc-pin-red">📍</span>
                        <div className="loc-text">
                          <span className="block-label">Drop Point</span>
                          <strong>{drop}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-bottom-row">
                    <div className="action-buttons-group">
                      <button
                        type="button"
                        className="action-btn chat-btn"
                        onClick={() => handleChatDriver(trip)}
                      >
                        💬 Chat with Driver
                      </button>

                      <button
                        type="button"
                        className="action-btn call-btn"
                        onClick={() => handleCallDriver(driverPhone)}
                      >
                        📞 Call To Driver
                      </button>

                      <button
                        type="button"
                        className="action-btn track-btn"
                        onClick={() =>
                          navigate("/live-tracking", {
                            state: { trip },
                          })
                        }
                      >
                        🗺️ Live Tracking
                      </button>

                      <button
                        type="button"
                        className="action-btn finish-trigger-btn"
                        onClick={() => handleCompleteTrip(tripId)}
                      >
                        🏁 Complete Trip
                      </button>
                    </div>

                    <div className="fare-display">
                      <span className="fare-amount">
                        ₹ {fare} / Seat {seats}
                      </span>

                      <button
                        type="button"
                        className={`pay-now-btn active-card-pay-btn ${
                          isPaid ? "disabled-pay-btn" : ""
                        }`}
                        disabled={isPaid}
                        onClick={() => handlePayNow(trip)}
                      >
                        {isPaid ? "Paid ✓" : "Pay Now"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTrips;