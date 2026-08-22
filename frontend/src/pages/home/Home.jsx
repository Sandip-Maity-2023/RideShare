import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  // Helper for datetime input
  const getCurrentLocalDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // =========================================
  // FORM & LOCATION STATES
  // =========================================
  const [activeTab, setActiveTab] = useState("find");

  const [startQuery, setStartQuery] = useState("");
  const [destQuery, setDestQuery] = useState("");

  const [startCoords, setStartCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);

  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);

  const [startLoading, setStartLoading] = useState(false);
  const [destLoading, setDestLoading] = useState(false);

  const [dateTime, setDateTime] = useState(getCurrentLocalDateTime());
  const [seats, setSeats] = useState("4");
  const [farePerSeat, setFarePerSeat] = useState("120");

  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState(["Mo", "Tu", "We", "Th", "Fr"]);
  const [publishing, setPublishing] = useState(false);

  // =========================================
  // BACKEND GEOCODING SEARCH
  // =========================================
  const searchLocation = async (query, type) => {
    if (!query || query.trim().length < 3) {
      if (type === "start") setStartSuggestions([]);
      else setDestSuggestions([]);
      return;
    }

    try {
      if (type === "start") setStartLoading(true);
      else setDestLoading(true);

      const response = await axios.get("http://localhost:5000/api/geocode/search", {
        params: { q: query.trim() },
      });

      const places = Array.isArray(response.data) ? response.data : [];

      if (type === "start") setStartSuggestions(places);
      else setDestSuggestions(places);
    } catch (error) {
      console.error("Geocoding search error:", error);
      if (type === "start") setStartSuggestions([]);
      else setDestSuggestions([]);
    } finally {
      if (type === "start") setStartLoading(false);
      else setDestLoading(false);
    }
  };

  // Debounce Start Search
  useEffect(() => {
    if (!startQuery || startQuery.trim().length < 3) {
      setStartSuggestions([]);
      return;
    }

    if (startCoords && startQuery === startCoords.displayName) return;

    const timer = setTimeout(() => {
      searchLocation(startQuery, "start");
    }, 600);

    return () => clearTimeout(timer);
  }, [startQuery]);

  // Debounce Destination Search
  useEffect(() => {
    if (!destQuery || destQuery.trim().length < 3) {
      setDestSuggestions([]);
      return;
    }

    if (destCoords && destQuery === destCoords.displayName) return;

    const timer = setTimeout(() => {
      searchLocation(destQuery, "dest");
    }, 600);

    return () => clearTimeout(timer);
  }, [destQuery]);

  // Handle Location Selection from Dropdown
  const handleSelectLocation = (place, type) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      console.error("Invalid coordinates:", place);
      return;
    }

    const coords = { lat, lng, displayName: place.display_name };

    if (type === "start") {
      setStartQuery(place.display_name);
      setStartCoords(coords);
      setStartSuggestions([]);
    } else {
      setDestQuery(place.display_name);
      setDestCoords(coords);
      setDestSuggestions([]);
    }
  };

  // Swap Locations
  const handleSwapLocations = () => {
    const tempQuery = startQuery;
    const tempCoords = startCoords;

    setStartQuery(destQuery);
    setStartCoords(destCoords);

    setDestQuery(tempQuery);
    setDestCoords(tempCoords);
  };

  const handleDayToggle = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Form Submission
  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (!startQuery.trim() || !destQuery.trim()) {
      alert("Please enter both Start and Destination locations.");
      return;
    }

    // Retrieve logged-in employee/driver details from localStorage
    const userStr = localStorage.getItem("user");
    const loggedInUser = userStr ? JSON.parse(userStr) : {};

    // Format selected date and time exactly as chosen
    const selectedDateObj = new Date(dateTime);
    const exactDate = selectedDateObj.toISOString().split("T")[0];
    const exactTime = selectedDateObj.toTimeString().slice(0, 5);

    const routeData = {
      driverId: loggedInUser._id || loggedInUser.id,
      driverName: loggedInUser.name || "Suman Mondal",
      employeeId: loggedInUser.employeeId || loggedInUser.empId,
      vehicleId: loggedInUser.vehicleId || loggedInUser.carId || null,
      carDetails: {
        model: loggedInUser.carModel || loggedInUser.carName || "Standard Sedan",
        number: loggedInUser.carNumber || loggedInUser.vehicleNumber || "N/A",
      },
      pickupLocation: startQuery,
      dropLocation: destQuery,
      destination: destQuery,
      startCoords: startCoords,
      destCoords: destCoords,
      dateTime,
      date: exactDate,
      time: exactTime,
      timeDate: selectedDateObj.toLocaleString(),
      seats: Number(seats),
      availableSeats: Number(seats),
      price: Number(farePerSeat),
      fare: Number(farePerSeat),
      isRecurring,
      selectedDays: isRecurring ? selectedDays : []
    };

    if (activeTab === "offer") {
      try {
        setPublishing(true);

        // Save directly to backend MongoDB
        await axios.post("http://localhost:5000/api/rides/publish", routeData);

        alert("Ride published successfully!");

        // Reset form inputs back to default state
        setStartQuery("");
        setDestQuery("");
        setStartCoords(null);
        setDestCoords(null);
        setDateTime(getCurrentLocalDateTime());
        setSeats("4");
        setFarePerSeat("120");

        // Redirect/stay on Home page
        navigate("/home");
      } catch (err) {
        console.error("Error publishing ride:", err);
        alert("Failed to publish ride to database. Make sure your server is running.");
      } finally {
        setPublishing(false);
      }
    } else {
      // Find Ride Mode -> Go to Route Confirmation screen
      navigate("/route-confirmation", { state: { routeData } });
    }
  };

  return (
    <div className="home-container">
      <main className="home-content">
        <aside className="sidebar-brand-section">
          <h2 className="sidebar-title">Carpooling</h2>
        </aside>

        <section className="ride-booking-card">
          <div className="mode-toggle-bar">
            <button
              type="button"
              className={`mode-btn ${activeTab === "find" ? "active" : ""}`}
              onClick={() => setActiveTab("find")}
            >
              Find Ride
            </button>
            <button
              type="button"
              className={`mode-btn ${activeTab === "offer" ? "active" : ""}`}
              onClick={() => setActiveTab("offer")}
            >
              Offer Ride
            </button>
          </div>

          <form className="booking-form" onSubmit={handleSearchSubmit}>
            <div className="locations-wrapper">
              <div className="location-fields-col">
                {/* START LOCATION FIELD */}
                <div className="field-group">
                  <label className="field-label">Start Location</label>
                  <div className="input-with-icon">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Enter Your location"
                      value={startQuery}
                      onChange={(e) => {
                        setStartQuery(e.target.value);
                        if (startCoords) setStartCoords(null);
                      }}
                      required
                    />
                    {startLoading && <span className="search-loading">...</span>}
                  </div>

                  {startSuggestions.length > 0 && (
                    <ul className="home-suggestions-dropdown">
                      {startSuggestions.map((place) => (
                        <li
                          key={place.place_id}
                          onClick={() => handleSelectLocation(place, "start")}
                        >
                          <span className="suggestion-icon">📍</span>
                          <span className="suggestion-text">{place.display_name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* DESTINATION LOCATION FIELD */}
                <div className="field-group">
                  <label className="field-label">Destination Location</label>
                  <div className="input-with-icon">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Enter Drop location"
                      value={destQuery}
                      onChange={(e) => {
                        setDestQuery(e.target.value);
                        if (destCoords) setDestCoords(null);
                      }}
                      required
                    />
                    {destLoading && <span className="search-loading">...</span>}
                  </div>

                  {destSuggestions.length > 0 && (
                    <ul className="home-suggestions-dropdown">
                      {destSuggestions.map((place) => (
                        <li
                          key={place.place_id}
                          onClick={() => handleSelectLocation(place, "dest")}
                        >
                          <span className="suggestion-icon">📍</span>
                          <span className="suggestion-text">{place.display_name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="swap-locations-btn"
                onClick={handleSwapLocations}
                title="Swap Locations"
              >
                ⇅
              </button>
            </div>

            <div className="datetime-seats-row">
              <div className="datetime-picker-box">
                <span className="picker-icon">🕒</span>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="datetime-input"
                />
              </div>

              <div className="seat-picker-box">
                <span className="picker-icon">🪑</span>
                <select
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  className="seat-select"
                >
                  <option value="1">Seat 1</option>
                  <option value="2">Seat 2</option>
                  <option value="3">Seat 3</option>
                  <option value="4">Seat 4</option>
                </select>
              </div>
            </div>

            {activeTab === "offer" ? (
              <div className="fare-offer-row">
                <div className="fare-input-box">
                  <span className="currency-symbol">₹</span>
                  <input
                    type="number"
                    value={farePerSeat}
                    onChange={(e) => setFarePerSeat(e.target.value)}
                    className="fare-input"
                    placeholder="120"
                    min="0"
                  />
                  <span className="fare-label-text">
                    / Seat ({seats} Available)
                  </span>
                </div>
              </div>
            ) : (
              <div className="recurring-section">
                <div className="recurring-left">
                  <span className="recurring-title">Recurring Ride</span>
                  <span className="recurring-separator">-</span>
                  <div className="days-chip-list">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                      <button
                        type="button"
                        key={day}
                        className={`day-chip ${
                          selectedDays.includes(day) ? "selected" : ""
                        }`}
                        onClick={() => handleDayToggle(day)}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            )}

            <button type="submit" className="find-ride-btn" disabled={publishing}>
              {publishing
                ? "Publishing..."
                : activeTab === "find"
                ? "Find Ride"
                : "Publish Ride"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Home;