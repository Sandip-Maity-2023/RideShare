import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Auto-recenter map when coordinates change
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const RouteMap = ({
  startCoords = [23.0225, 72.5714], // Default Ahmedabad coordinates
  destCoords = [23.0300, 72.5800],
  liveVehicleCoords,
  routePolyline = []
}) => {
  const defaultCenter = liveVehicleCoords || startCoords;

  return (
    <div className="w-full h-full min-h-[350px] rounded-lg overflow-hidden border border-gray-300 relative">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={defaultCenter} />

        {/* Start / Pickup Marker */}
        {startCoords && (
          <Marker position={startCoords}>
            <Popup>
              <div className="font-semibold text-sm">Pickup Location</div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destCoords && (
          <Marker position={destCoords}>
            <Popup>
              <div className="font-semibold text-sm text-red-600">Destination Location</div>
            </Popup>
          </Marker>
        )}

        {/* Live Driver Tracking Marker */}
        {liveVehicleCoords && (
          <Marker position={liveVehicleCoords}>
            <Popup>
              <div className="font-semibold text-sm text-blue-600">Vehicle Live Location</div>
            </Popup>
          </Marker>
        )}

        {/* Route Line */}
        {(routePolyline.length > 0 || (startCoords && destCoords)) && (
          <Polyline
            positions={routePolyline.length > 0 ? routePolyline : [startCoords, destCoords]}
            color="#2563eb"
            weight={5}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default RouteMap;
