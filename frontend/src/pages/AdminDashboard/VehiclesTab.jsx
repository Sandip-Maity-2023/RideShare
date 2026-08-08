import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import AdminMetricsHeader from '../../components/AdminMetricsHeader';
import VehicleCard from '../../components/VehicleCard';

const VehiclesTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState([
    {
      _id: '1',
      registrationNumber: 'GJ01AB1234',
      model: 'Swift Dzire',
      seatingCapacity: 4,
      driverName: 'Raj Patel',
      status: 'Active',
    },
    {
      _id: '2',
      registrationNumber: 'GJ01CD5678',
      model: 'Alto 800',
      seatingCapacity: 4,
      driverName: 'Krupali Shah',
      status: 'Active',
    },
    {
      _id: '3',
      registrationNumber: 'GJ01EF9012',
      model: 'Creta SUV',
      seatingCapacity: 5,
      driverName: 'Priya Dave',
      status: 'Inactive',
    },
  ]);

  const handleToggleStatus = (id) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v._id === id
          ? { ...v, status: v.status === 'Active' ? 'Inactive' : 'Active' }
          : v
      )
    );
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminMetricsHeader
        totalEmployees={48}
        registeredVehicles={vehicles.length}
        ridesThisMonth={163}
      />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicle model or driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            onClick={() => alert('Add Vehicle Modal Trigger')}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Vehicle</span>
          </button>
        </div>

        {/* Vehicles Approval Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle._id}
              vehicle={vehicle}
              isAdminView={true}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehiclesTab;
