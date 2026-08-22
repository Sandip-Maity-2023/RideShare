import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import RouteMap from "../../components/RouteMap";
import "./RouteConfirmation.css";

const RouteConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle both nested state.routeData or direct location.state payload
  const incomingData = location.state?.routeData || location.state || {};

  // =========================================
  // LOCATION SEARCH STATES
  // =========================================

  const [startQuery, setStartQuery] = useState(
    incomingData.pickupLocation || incomingData.startLocation || ""
  );
  const [destQuery, setDestQuery] = useState(
    incomingData.dropLocation || incomingData.destinationLocation || ""
  );

  const [startCoords, setStartCoords] = useState(incomingData.startCoords || null);
  const [destCoords, setDestCoords] = useState(incomingData.destCoords || null);

  // =========================================
  // SUGGESTIONS & LOADING
  // =========================================

  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);

  const [startLoading, setStartLoading] = useState(false);
  const [destLoading, setDestLoading] = useState(false);

  // =========================================
  // ROUTE INFORMATION
  // =========================================

  const [routeInfo, setRouteInfo] = useState(null);

  // Synchronize state if incoming navigation location changes
  useEffect(() => {
    const data = location.state?.routeData || location.state || {};
    if (data.pickupLocation || data.startLocation) {
      setStartQuery(data.pickupLocation || data.startLocation);
    }
    if (data.dropLocation || data.destinationLocation) {
      setDestQuery(data.dropLocation || data.destinationLocation);
    }
    if (data.startCoords) setStartCoords(data.startCoords);
    if (data.destCoords) setDestCoords(data.destCoords);
  }, [location.state]);

  // =========================================
  // SEARCH LOCATION THROUGH BACKEND
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

      const response = await axios.get(
        "http://localhost:5000/api/geocode/search",
        {
          params: { q: query.trim() },
        }
      );

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

  // =========================================
  // DEBOUNCE SEARCH
  // =========================================

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

  // =========================================
  // SELECT LOCATION
  // =========================================

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

  // =========================================
  // CONFIRM ROUTE
  // =========================================

  const handleConfirmRoute = () => {
    if (!startQuery.trim() || !destQuery.trim()) {
      alert("Please enter both Start and Destination locations.");
      return;
    }

    const payload = {
      ...incomingData,
      pickupLocation: startQuery,
      dropLocation: destQuery,
      startCoords,
      destCoords,
      durationMinutes: routeInfo?.durationMinutes || null,
      distanceKm: routeInfo?.distanceKm || null,
    };

    console.log("Route Confirmed Payload:", payload);

    // Navigates directly to /available-rides with the payload
    navigate("/available-rides", {
      state: {
        routeData: payload,
      },
    });
  };

  return (
    <div className="route-confirmation-page">
      {/* =====================================
          LEFT SIDEBAR
      ====================================== */}

      <aside className="route-sidebar">
        {/* BACK BUTTON */}
        <button
          type="button"
          className="back-link"
          onClick={() => navigate(-1)}
        >
          &lt; Trip
        </button>

        {/* START LOCATION */}
        <div className="location-input-group">
          <label className="input-label">Start Location</label>

          <div className="input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Pick up location"
              value={startQuery}
              onChange={(e) => {
                setStartQuery(e.target.value);
                if (startCoords) setStartCoords(null);
              }}
            />
            {startLoading && <span className="search-loading">...</span>}
          </div>

          {startSuggestions.length > 0 && (
            <ul className="suggestions-dropdown">
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

        {/* DESTINATION LOCATION */}
        <div className="location-input-group">
          <label className="input-label">Destination Location</label>

          <div className="input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Enter Drop location"
              value={destQuery}
              onChange={(e) => {
                setDestQuery(e.target.value);
                if (destCoords) setDestCoords(null);
              }}
            />
            {destLoading && <span className="search-loading">...</span>}
          </div>

          {destSuggestions.length > 0 && (
            <ul className="suggestions-dropdown">
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

        {/* TIME PICKER */}
        <div className="time-picker-wrapper">
          <select defaultValue="now">
            <option value="now">🕒 Pick up now</option>
            <option value="later">🕒 Schedule for later</option>
          </select>
        </div>

        {/* ROUTE DETAILS DISPLAY */}
        {routeInfo && (
          <div className="trip-summary-card">
            <div className="summary-item">
              <span className="summary-label">Distance:</span>
              <span className="summary-value">{routeInfo.distanceKm} km</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Est. Time:</span>
              <span className="summary-value">{routeInfo.durationMinutes} mins</span>
            </div>
          </div>
        )}
      </aside>

      {/* =====================================
          MAP SECTION
      ====================================== */}

      <section className="route-map-section">
        {/* ROUTE INFORMATION BADGE */}
        {routeInfo && (
          <div className="route-info-badge">
            🚗 {routeInfo.distanceKm} km • {routeInfo.durationMinutes} mins
          </div>
        )}

        {/* MAP COMPONENT */}
        <RouteMap
          startCoords={startCoords}
          destCoords={destCoords}
          onRouteCalculated={(info) => {
            if (info) setRouteInfo(info);
          }}
        />

        {/* CONFIRM BUTTON */}
        <div className="confirm-action-bar">
          <button
            type="button"
            className="confirm-route-btn"
            onClick={handleConfirmRoute}
          >
            Confirm
          </button>
        </div>
      </section>
    </div>
  );
};

export default RouteConfirmation;