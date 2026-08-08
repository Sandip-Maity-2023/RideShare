import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, MapPin, Calendar, DollarSign, Users, PlusCircle } from 'lucide-react';

const OfferRide = ({ registeredVehicles = [] }) => {
  const navigate = useNavigate();
  const [startLocation, setStartLocation] = useState('');
  const [destLocation, setDestLocation] = useState('');
  const [dateTime, setDateTime] = useState('2026-08-09T17:12');
  const [availableSeats, setAvailableSeats] = useState(3);
  const [farePerSeat, setFarePerSeat] = useState(150);
  const [selectedVehicle, setSelectedVehicle] = useState(registeredVehicles[0]?._id || '');

  const handlePublish = (e) => {
    e.preventDefault();
    navigate('/route-confirmation', {
      state: {
        startLocation,
        destLocation,
        dateTime,
        availableSeats,
        farePerSeat,
        vehicleId: selectedVehicle,
        mode: 'offer',
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Navigation Switcher */}
      <div className="grid grid-cols-2 bg-gray-100 p-1.5 rounded-xl mb-6">
        <button
          onClick={() => navigate('/find-ride')}
          className="py-2.5 text-sm font-semibold rounded-lg text-gray-500 hover:text-gray-900 transition"
        >
          Find Ride
        </button>
        <button className="py-2.5 text-sm font-semibold rounded-lg bg-white text-blue-600 shadow-sm transition">
          Offer Ride
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-gray-900">Publish a Ride</h2>

        <form onSubmit={handlePublish} className="space-y-4">
          {/* Vehicle Selector */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-600">Select Registered Vehicle</label>
              <button
                type="button"
                onClick={() => navigate('/my-vehicles')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1"
              >
                <PlusCircle className="w-3 h-3" />
                <span>Add Vehicle</span>
              </button>
            </div>
            <div className="relative">
              <Car className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">-- Choose Vehicle --</option>
                {registeredVehicles.map((veh) => (
                  <option key={veh._id} value={veh._id}>
                    {veh.model} ({veh.registrationNumber}) - Capacity: {veh.seatingCapacity}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Pickup Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                required
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                placeholder="Enter exact pickup point"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Destination Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                required
                value={destLocation}
                onChange={(e) => setDestLocation(e.target.value)}
                placeholder="Enter drop-off destination"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Departure Time</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="datetime-local"
                  required
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Seats Offereable</label>
              <div className="relative">
                <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="6"
                  required
                  value={availableSeats}
                  onChange={(e) => setAvailableSeats(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Fare Per Seat (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  required
                  value={farePerSeat}
                  onChange={(e) => setFarePerSeat(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition mt-4"
          >
            Confirm Route & Publish
          </button>
        </form>
      </div>
    </div>
  );
};

export default OfferRide;
