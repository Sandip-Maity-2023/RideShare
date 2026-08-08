import React, { useState } from 'react';
import { Phone, MessageSquare, ShieldCheck, Clock, MapPin } from 'lucide-react';
import RouteMap from '../components/RouteMap';
import ChatWindow from '../components/ChatWindow';

const LiveTracking = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [driverLocation] = useState([23.0500, 72.6000]); // Dynamic websocket coordinates

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 animate-pulse">
            Live Trip Tracking Active
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Trip #TRIP-8842</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Estimated Arrival (ETA)</p>
          <p className="text-xl font-bold text-blue-600">18 Mins</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Interactive Map Display */}
        <div className="lg:col-span-2 h-[480px]">
          <RouteMap
            startCoords={[23.0225, 72.5714]}
            destCoords={[23.1558, 72.6844]}
            liveVehicleCoords={driverLocation}
          />
        </div>

        {/* Live Trip Status Details Panel */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Participant Details
            </h2>

            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                R
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Raj Patel</h3>
                <p className="text-xs text-gray-500">Driver • Swift Dzire (GJ01AB1234)</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Departed at <strong>05:15 PM</strong></span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Next stop: <strong>Infocity Circle</strong></span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setChatOpen(true)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>In-Trip Chat</span>
            </button>

            <button
              onClick={() => alert('Dialing Driver...')}
              className="w-full py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition flex items-center justify-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>Voice Call</span>
            </button>
          </div>
        </div>
      </div>

      {chatOpen && (
        <ChatWindow
          tripId="TRIP-8842"
          currentUser={{ _id: 'usr123', name: 'Passenger User' }}
          participantName="Raj Patel (Driver)"
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
};

export default LiveTracking;