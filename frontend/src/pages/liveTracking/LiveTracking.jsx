import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./LiveTracking.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to dynamically fit map bounds to the road polyline
const AutoFitBounds = ({ routeCoordinates }) => {
  const map = useMap();
  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, routeCoordinates]);
  return null;
};

// Default fallback road path (Barrackpore -> Sodepur via BT Road)
const DEFAULT_ROAD_PATH = [
  [22.7635, 88.3697], // Barrackpore
  [22.7552, 88.3712],
  [22.7410, 88.3745], // Titagarh
  [22.7285, 88.3780], // Khardaha
  [22.7120, 88.3822],
  [22.6983, 88.3888], // Sodepur
];

const LiveTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: urlRideId } = useParams();

  // Extract initial state from router location
  const initialRideData = location.state?.rideData || {};
  const routeData = location.state?.routeData || {};

  const [rideDetails, setRideDetails] = useState(initialRideData);
  const [roadPath, setRoadPath] = useState(DEFAULT_ROAD_PATH);
  const [etaMinutes, setEtaMinutes] = useState(5);
  const [loadingRoute, setLoadingRoute] = useState(true);

  const rideId = rideDetails._id || rideDetails.id || urlRideId;

  // 1. Fetch exact ride and vehicle details from backend database if state is missing details
  useEffect(() => {
    const fetchRideFromBackend = async () => {
      if (!rideId) return;

      try {
        const response = await axios.get(`http://localhost:5000/api/rides/${rideId}`);
        if (response.data) {
          setRideDetails(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch ride details from backend:", err);
      }
    };

    // If vehicle/plate details are not in location state, fetch directly from backend
    if (!rideDetails.vehicle && !rideDetails.plateNumber && !rideDetails.carDetails) {
      fetchRideFromBackend();
    }
  }, [rideId]);

  // Extract Location Info
  const startLocation =
    rideDetails.pickupLocation || routeData.pickupLocation || "Barrackpore, Kolkata";
  const destLocation =
    rideDetails.destination || rideDetails.dropLocation || routeData.dropLocation || "Sodepur, Kolkata";

  // Extract Driver Info from Backend
  const driverName =
    rideDetails.driver?.name ||
    rideDetails.driverName ||
    rideDetails.user?.name ||
    "Driver";

  // Safely resolve vehicle details directly from backend response without hardcoded fake plates
  const getVehicleInfoFromBackend = () => {
    const v = rideDetails?.vehicle && typeof rideDetails.vehicle === "object" ? rideDetails.vehicle : {};
    const c = rideDetails?.carDetails && typeof rideDetails.carDetails === "object" ? rideDetails.carDetails : {};

    const model =
      v.model ||
      v.name ||
      c.model ||
      c.name ||
      rideDetails?.vehicleModel ||
      rideDetails?.carModel ||
      "Vehicle";

    // Strictly pull from registered DB fields (no hardcoded "GJ01AB1234")
    const plateNumber =
      v.plateNumber ||
      v.registrationNumber ||
      v.number ||
      v.vehicleNumber ||
      c.plateNumber ||
      c.registrationNumber ||
      c.number ||
      c.vehicleNumber ||
      rideDetails?.plateNumber ||
      rideDetails?.vehicleNumber ||
      rideDetails?.carNumber ||
      "N/A";

    return { model, plateNumber };
  };

  const { model: vehicleModel, plateNumber: vehiclePlate } = getVehicleInfoFromBackend();

  // Coordinates resolution
  const startCoords = routeData.startCoords || [22.7635, 88.3697];
  const destCoords = routeData.destCoords || [22.6983, 88.3888];

  // 2. Fetch driving road route from OSRM
  useEffect(() => {
    let isMounted = true;

    const fetchRoadRoute = async () => {
      try {
        setLoadingRoute(true);
        const url = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`;

        const res = await fetch(url);
        const data = await res.json();

        if (isMounted && data.code === "Ok" && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const fullPath = route.geometry.coordinates.map((c) => [c[1], c[0]]);
          setRoadPath(fullPath);

          const durationMin = Math.ceil(route.duration / 60);
          setEtaMinutes(durationMin > 0 ? durationMin : 5);
        } else if (isMounted) {
          setRoadPath(DEFAULT_ROAD_PATH);
        }
      } catch (err) {
        console.warn("Using default route path:", err);
        if (isMounted) {
          setRoadPath(DEFAULT_ROAD_PATH);
        }
      } finally {
        if (isMounted) setLoadingRoute(false);
      }
    };

    fetchRoadRoute();

    return () => {
      isMounted = false;
    };
  }, [startCoords, destCoords]);

  return (
    <div className="live-tracking-container">
      <div className="tracking-main-body">
        {/* LEFT SIDEBAR PANEL */}
        <aside className="tracking-side-panel">
          <button className="track-back-btn" onClick={() => navigate(-1)}>
            &lt; Track Ride
          </button>

          <div className="location-inputs-group">
            <div className="location-field">
              <label>Start Location</label>
              <div className="input-with-icon">
                <span className="icon">🔍</span>
                <input type="text" value={startLocation} readOnly />
              </div>
            </div>

            <div className="location-field">
              <label>Dest Location</label>
              <div className="input-with-icon">
                <span className="icon">📍</span>
                <input type="text" value={destLocation} readOnly />
              </div>
            </div>
          </div>

          <hr className="divider" />

          {/* DRIVER & BACKEND VEHICLE INFO */}
          <div className="trip-meta-info">
            <div className="meta-row">
              <span className="meta-icon">👤</span>
              <span className="meta-text">{driverName}</span>
            </div>
            <div className="meta-row">
              <span className="meta-icon">🚗</span>
              <span className="meta-text">{vehicleModel}</span>
            </div>
            <div className="meta-row plate-number-row">
              <span className="meta-text bold-plate">
                {vehiclePlate !== "N/A" ? vehiclePlate : "No Plate Registered"}
              </span>
            </div>
          </div>
        </aside>

        {/* MAP & ETA DISPLAY AREA */}
        <main className="map-display-wrapper">
          <div className="leaflet-map-frame">
            <MapContainer
              center={startCoords}
              zoom={13}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Source Marker */}
              <Marker position={startCoords}>
                <Popup>
                  <strong>Start:</strong> {startLocation}
                </Popup>
              </Marker>

              {/* Destination Marker */}
              <Marker position={destCoords}>
                <Popup>
                  <strong>Destination:</strong> {destLocation}
                </Popup>
              </Marker>

              {/* Road Route Polyline */}
              {roadPath.length > 0 && (
                <Polyline
                  positions={roadPath}
                  color="#2563eb"
                  weight={6}
                  opacity={0.85}
                  lineCap="round"
                  lineJoin="round"
                />
              )}

              {/* Auto bounds scaler */}
              <AutoFitBounds routeCoordinates={roadPath} />
            </MapContainer>
          </div>

          {/* BOTTOM ETA BANNER */}
          <div className="eta-bottom-bar">
            <h3>
              {loadingRoute
                ? "Calculating route along roads..."
                : `Coming in ${etaMinutes} Minutes`}
            </h3>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LiveTracking;