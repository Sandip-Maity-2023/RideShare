import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { GeoapifyContext, GeoapifyGeocoderAutocomplete } from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import { MapPin, Navigation, Search } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet marker icon issue in React
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

const customIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || 'https://api.geoapify.com/v1/geocode/autocomplete?text=Mosco&apiKey=f1ba5c5d75ab47909a12bab33f982ce4';

const FindRideFree = () => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  // Handle Autocomplete Selection
  const handleOriginSelect = (value) => {
    if (value?.geometry) {
      const [lng, lat] = value.geometry.coordinates;
      setOrigin({ lat, lng, name: value.properties.formatted });
    }
  };

  const handleDestinationSelect = (value) => {
    if (value?.geometry) {
      const [lng, lat] = value.geometry.coordinates;
      setDestination({ lat, lng, name: value.properties.formatted });
    }
  };

  // Calculate Route using Geoapify Routing API
  const calculateRoute = async (e) => {
    e.preventDefault();

    if (!origin || !destination) {
      alert('Please select both pickup and drop-off locations.');
      return;
    }

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/routing?waypoints=${origin.lat},${origin.lng}|${destination.lat},${destination.lng}&mode=drive&apiKey=${GEOAPIFY_KEY}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];

        // Extract coordinates array for polyline drawing
        const coordinates = feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
        setRoutePolyline(coordinates);

        // Calculate distance and duration
        const distanceKm = (feature.properties.distance / 1000).toFixed(2);
        const durationMin = Math.round(feature.properties.time / 60);

        setDistance(`${distanceKm} km`);
        setDuration(`${durationMin} mins`);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      alert('Could not calculate route.');
    }
  };

  return (
    <GeoapifyContext apiKey={GEOAPIFY_KEY}>
      <div className="min-h-screen bg-slate-900 text-white flex flex-col lg:flex-row">
        
        {/* Left Sidebar Form */}
        <div className="w-full lg:w-1/3 p-6 bg-slate-950 border-r border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <Navigation className="text-blue-500" /> Free Ride Finder
            </h2>

            <form onSubmit={calculateRoute} className="space-y-4">
              {/* Pickup Location */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">
                  PICKUP LOCATION
                </label>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-blue-400">
                  <GeoapifyGeocoderAutocomplete
                    placeholder="Search pickup point..."
                    placeSelect={handleOriginSelect}
                  />
                </div>
              </div>

              {/* Drop-off Location */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">
                  DROP-OFF LOCATION
                </label>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-blue-400">
                  <GeoapifyGeocoderAutocomplete
                    placeholder="Search destination..."
                    placeSelect={handleDestinationSelect}
                  />
                </div>
              </div>

              {/* Distance and Duration Summary */}
              {distance && duration && (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex justify-around text-center my-4">
                  <div>
                    <p className="text-xs text-slate-400">Distance</p>
                    <p className="text-lg font-bold text-blue-400">{distance}</p>
                  </div>
                  <div className="border-r border-slate-800" />
                  <div>
                    <p className="text-xs text-slate-400">Est. Duration</p>
                    <p className="text-lg font-bold text-emerald-400">{duration}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Search className="w-4 h-4" /> Calculate Route
              </button>
            </form>
          </div>

          <p className="text-xs text-slate-500 text-center mt-6">
            Powered by OpenStreetMap & Geoapify (No Billing Required)
          </p>
        </div>

        {/* Right Map Viewport */}
        <div className="w-full lg:w-2/3 h-[500px] lg:h-screen relative">
          <MapContainer
            center={[22.5726, 88.3639]}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Pickup Marker */}
            {origin && (
              <Marker position={[origin.lat, origin.lng]} icon={customIcon}>
                <Popup>Pickup: {origin.name}</Popup>
              </Marker>
            )}

            {/* Destination Marker */}
            {destination && (
              <Marker position={[destination.lat, destination.lng]} icon={customIcon}>
                <Popup>Destination: {destination.name}</Popup>
              </Marker>
            )}

            {/* Drawn Driving Route */}
            {routePolyline.length > 0 && (
              <Polyline positions={routePolyline} color="#3b82f6" weight={5} />
            )}
          </MapContainer>
        </div>

      </div>
    </GeoapifyContext>
  );
};

export default FindRideFree;