
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

// Leaflet marker icons
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

/* =========================================================
   CUSTOM LEAFLET MARKER
========================================================= */

const customIcon = new L.Icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/* =========================================================
   MAP INVALIDATE SIZE
   Helps Leaflet correctly render when the map is inside
   a flex/container layout.
========================================================= */

const MapResizeHandler = () => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

/* =========================================================
   RECENTER MAP
========================================================= */

const RecenterMap = ({
  startCoords,
  destCoords,
  routePoints,
}) => {
  const map = useMap();

  useEffect(() => {
    if (routePoints && routePoints.length > 0) {
      const bounds = L.latLngBounds(routePoints);

      map.fitBounds(bounds, {
        padding: [60, 60],
      });

      return;
    }

    if (startCoords && destCoords) {
      const bounds = L.latLngBounds(
        [startCoords.lat, startCoords.lng],
        [destCoords.lat, destCoords.lng]
      );

      map.fitBounds(bounds, {
        padding: [60, 60],
      });

      return;
    }

    if (startCoords) {
      map.setView(
        [startCoords.lat, startCoords.lng],
        13
      );
    }
  }, [
    startCoords,
    destCoords,
    routePoints,
    map,
  ]);

  return null;
};

/* =========================================================
   ROUTE MAP
========================================================= */

const RouteMap = ({
  startCoords,
  destCoords,
  onRouteCalculated,
}) => {
  const [routeGeometry, setRouteGeometry] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  // Default Ahmedabad location
  const defaultCenter = [23.0225, 72.5714];

  /* =======================================================
     FETCH REAL ROAD ROUTE USING OSRM
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const getRoute = async () => {
      if (!startCoords || !destCoords) {
        setRouteGeometry([]);
        setRouteInfo(null);
        return;
      }

      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${startCoords.lng},${startCoords.lat};` +
          `${destCoords.lng},${destCoords.lat}` +
          `?overview=full&geometries=geojson`;

        console.log("🗺️ Fetching route:", url);

        const response = await axios.get(url, {
          timeout: 15000,
        });

        if (
          !response.data ||
          !response.data.routes ||
          response.data.routes.length === 0
        ) {
          throw new Error(
            "No route found between these locations."
          );
        }

        const route = response.data.routes[0];

        /* =================================================
           CONVERT GEOJSON COORDINATES

           OSRM:
           [longitude, latitude]

           Leaflet:
           [latitude, longitude]
        ================================================= */

        const points =
          route.geometry.coordinates.map(
            (coord) => [
              coord[1],
              coord[0],
            ]
          );

        if (!isMounted) return;

        setRouteGeometry(points);

        /* =================================================
           DISTANCE
        ================================================= */

        const distanceKm = (
          route.distance / 1000
        ).toFixed(1);

        /* =================================================
           DURATION
        ================================================= */

        const durationMinutes = Math.max(
          1,
          Math.round(route.duration / 60)
        );

        const info = {
          durationMinutes,
          distanceKm,
        };

        setRouteInfo(info);

        console.log(
          "✅ Route calculated:",
          info
        );

        if (onRouteCalculated) {
          onRouteCalculated(info);
        }
      } catch (error) {
        console.error(
          "❌ Failed to fetch route line:",
          error
        );

        if (!isMounted) return;

        /*
         * FALLBACK:
         * Draw straight line if OSRM fails.
         */

        const fallbackPoints = [
          [
            startCoords.lat,
            startCoords.lng,
          ],
          [
            destCoords.lat,
            destCoords.lng,
          ],
        ];

        setRouteGeometry(fallbackPoints);

        /*
         * Keep fallback route information so
         * the rest of the application continues
         * working.
         */

        const fallbackInfo = {
          durationMinutes: 30,
          distanceKm: "20",
        };

        setRouteInfo(fallbackInfo);

        if (onRouteCalculated) {
          onRouteCalculated(
            fallbackInfo
          );
        }
      }
    };

    getRoute();

    return () => {
      isMounted = false;
    };
  }, [
    startCoords,
    destCoords,
    onRouteCalculated,
  ]);

  /* =======================================================
     MAP
  ======================================================= */

  return (
    <div
      className="route-map-container"
      style={{
        height: "100%",
        width: "100%",
        minHeight: "450px",
        position: "relative",
      }}
    >
      <MapContainer
        center={
          startCoords
            ? [
                startCoords.lat,
                startCoords.lng,
              ]
            : defaultCenter
        }
        zoom={12}
        scrollWheelZoom={true}
        style={{
          height: "100%",
          width: "100%",
          minHeight: "450px",
        }}
      >
        {/* =================================================
            OPENSTREETMAP TILE LAYER
        ================================================= */}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* =================================================
            START MARKER
        ================================================= */}

        {startCoords && (
          <Marker
            position={[
              startCoords.lat,
              startCoords.lng,
            ]}
            icon={customIcon}
          >
            <Popup>
              <strong>
                Start Location
              </strong>
              <br />
              Pickup Location
            </Popup>
          </Marker>
        )}

        {/* =================================================
            DESTINATION MARKER
        ================================================= */}

        {destCoords && (
          <Marker
            position={[
              destCoords.lat,
              destCoords.lng,
            ]}
            icon={customIcon}
          >
            <Popup>
              <strong>
                Destination
              </strong>
              <br />
              Drop Location
            </Popup>
          </Marker>
        )}

        {/* =================================================
            REAL ROAD ROUTE
        ================================================= */}

        {routeGeometry.length > 0 && (
          <Polyline
            positions={routeGeometry}
            pathOptions={{
              color: "#3b82f6",
              weight: 6,
              opacity: 0.8,
            }}
          />
        )}

        {/* =================================================
            AUTOMATIC RECENTERING
        ================================================= */}

        <RecenterMap
          startCoords={startCoords}
          destCoords={destCoords}
          routePoints={routeGeometry}
        />

        {/* =================================================
            FIX MAP SIZE AFTER RENDER
        ================================================= */}

        <MapResizeHandler />
      </MapContainer>

      {/* ===================================================
          ROUTE INFO OVERLAY
      =================================================== */}

      {routeInfo && (
        <div
          className="route-map-info"
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            zIndex: 1000,
            background: "#ffffff",
            padding: "10px 16px",
            borderRadius: "10px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.15)",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          🚗 {routeInfo.distanceKm} km
          {" • "}
          {routeInfo.durationMinutes} mins
        </div>
      )}
    </div>
  );
};

export default RouteMap;

