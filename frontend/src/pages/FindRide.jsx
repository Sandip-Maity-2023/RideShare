import React, { useState, useRef } from 'react';
import {
  useJsApiLoader,
  GoogleMap,
  Autocomplete,
  DirectionsRenderer,
  Marker,
} from '@react-google-maps/api';
import { MapPin, Navigation, Search, Calendar, Users } from 'lucide-react';

const LIBRARIES = ['places'];
const DEFAULT_CENTER = { lat: 22.5726, lng: 88.3639 }; // Default center (Kolkata)

const FindRide = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  });

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  const originRef = useRef(null);
  const destinationRef = useRef(null);

  // Calculate route between Origin & Destination
  const calculateRoute = async () => {
    if (!originRef.current?.value || !destinationRef.current?.value) return;

    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    });

    setDirectionsResponse(results);
    setDistance(results.routes[0].legs[0].distance.text);
    setDuration(results.routes[0].legs[0].duration.text);
  };

  const handlePlaceSelect = () => {
    if (originRef.current?.value && destinationRef.current?.value) {
      calculateRoute();
    }
  };

  if (loadError) {
    return <div className="p-8 text-red-500">Error loading Google Maps. Verify your API key.</div>;
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading Maps & Route Planner...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col lg:flex-row">
      {/* Left Input Control Sidebar */}
      <div className="w-full lg:w-1/3 p-6 bg-slate-950 border-r border-slate-800 flex flex-col justify-between z-10">
        <div>
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            <Navigation className="text-blue-500" /> Find a Commute
          </h2>

          <form onSubmit={(e) => { e.preventDefault(); calculateRoute(); }} className="space-y-4">
            {/* Origin Autocomplete Input */}
            <div className="relative">
              <label className="text-xs text-slate-400 font-medium mb-1 block">PICKUP LOCATION</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-emerald-400 w-5 h-5 z-10" />
                <Autocomplete onPlaceChanged={handlePlaceSelect}>
                  <input
                    type="text"
                    placeholder="Enter origin city or area..."
                    ref={originRef}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </Autocomplete>
              </div>
            </div>

            {/* Destination Autocomplete Input */}
            <div className="relative">
              <label className="text-xs text-slate-400 font-medium mb-1 block">DROP-OFF LOCATION</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-rose-500 w-5 h-5 z-10" />
                <Autocomplete onPlaceChanged={handlePlaceSelect}>
                  <input
                    type="text"
                    placeholder="Enter destination..."
                    ref={destinationRef}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </Autocomplete>
              </div>
            </div>

            {/* Travel Details Summary Card */}
            {distance && duration && (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex justify-around text-center my-4">
                <div>
                  <p className="text-xs text-slate-400">Total Distance</p>
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
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Search className="w-4 h-4" /> Search Available Rides
            </button>
          </form>
        </div>

        <p className="text-xs text-slate-500 text-center mt-6">
          Real-time route computation powered by Google Maps API
        </p>
      </div>

      {/* Right Map Viewport */}
      <div className="w-full lg:w-2/3 h-[500px] lg:h-screen relative">
        <GoogleMap
          center={DEFAULT_CENTER}
          zoom={12}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {/* Render Route Polyline once computed */}
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default FindRide;