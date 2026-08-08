import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Navigation, CheckCircle2, ChevronRight } from 'lucide-react';

const MyTrips = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('active');

  const sampleTrips = [
    {
      id: 'TRIP-8842',
      driver: 'Raj Patel',
      vehicle: 'Swift Dzire (GJ01AB1234)',
      start: 'Satellite, Ahmedabad',
      dest: 'GIFT City, Gandhinagar',
      time: '2026-08-09 17:15',
      status: 'In Progress',
      fare: '₹150',
    },
    {
      id: 'TRIP-7721',
      driver: 'Priya Shah',
      vehicle: 'Honda City (GJ01CD5678)',
      start: 'Navrangpura',
      dest: 'SG Highway',
      time: '2026-08-08 09:00',
      status: 'Completed',
      fare: '₹90',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Commute Trips</h1>
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-md transition ${
              filter === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('history')}
            className={`px-3 py-1.5 rounded-md transition ${
              filter === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            History
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sampleTrips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono font-bold text-gray-400">{trip.id}</span>
                <h3 className="font-bold text-gray-900 text-base">{trip.driver}</h3>
                <p className="text-xs text-gray-500">{trip.vehicle}</p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  trip.status === 'In Progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {trip.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="truncate">From: <strong>{trip.start}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="truncate">To: <strong>{trip.dest}</strong></span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{trip.time}</span>
                </span>
                <span className="font-bold text-gray-900 text-sm">{trip.fare}</span>
              </div>

              {trip.status === 'In Progress' ? (
                <button
                  onClick={() => navigate('/live-tracking')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center space-x-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Track Live</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/wallet')}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition"
                >
                  View Payment
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTrips;