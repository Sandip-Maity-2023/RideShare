import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, CheckCircle } from 'lucide-react';
import RouteMap from '../components/RouteMap';

const RouteConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeData = location.state || {
    startLocation: 'Satellite, Ahmedabad',
    destLocation: 'GIFT City, Gandhinagar',
    dateTime: '2026-08-09T17:12',
    mode: 'search',
  };

  const handleConfirm = () => {
    if (routeData.mode === 'offer') {
      alert('Ride published successfully!');
      navigate('/my-trips');
    } else {
      alert('Search confirmed! Showing matching rides.');
      navigate('/my-trips');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Confirm Calculated Route</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Summary Details */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Trip Summary
          </h2>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Pickup Location</p>
                <p className="text-sm font-semibold text-gray-800">{routeData.startLocation}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Destination Location</p>
                <p className="text-sm font-semibold text-gray-800">{routeData.destLocation}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-2 border-t border-gray-100">
              <Clock className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Schedule</p>
                <p className="text-sm font-semibold text-gray-800">
                  {new Date(routeData.dateTime).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Confirm Route</span>
          </button>
        </div>

        {/* Right Interactive Route Map Preview */}
        <div className="md:col-span-2 h-[400px]">
          <RouteMap
            startCoords={[23.0225, 72.5714]}
            destCoords={[23.1558, 72.6844]}
          />
        </div>
      </div>
    </div>
  );
};

export default RouteConfirmation;