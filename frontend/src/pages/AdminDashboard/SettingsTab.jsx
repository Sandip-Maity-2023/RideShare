import React, { useState } from 'react';
import { Save, Building, Fuel, DollarSign } from 'lucide-react';
import AdminMetricsHeader from '../../components/AdminMetricsHeader';

const SettingsTab = () => {
  const [config, setConfig] = useState({
    companyName: 'Odoo Pvt. Ltd.',
    registeredAddress: 'Anandnagar, Ahmedabad',
    industry: 'Software',
    adminContactEmail: 'admin@odoo.com',
    fuelCostPerLiter: 96.5,
    travelCostPerKm: 8.0,
    optionalTravelCost: 2.5,
  });

  const handleChange = (e) => {
  const { name, value, type } = e.target;
  setConfig((prev) => ({
    ...prev,
    [name]: type === 'number' ? parseFloat(value) || 0 : value,
  }));
};

  const handleSave = (e) => {
    e.preventDefault();
    alert('Organization Carpooling configurations saved successfully!');
  };

  return (
    <div className="space-y-6">
      <AdminMetricsHeader totalEmployees={48} registeredVehicles={22} ridesThisMonth={163} />

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        {/* Company Details Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Company Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={config.companyName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Industry</label>
              <input
                type="text"
                name="industry"
                value={config.industry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Registered Address</label>
              <input
                type="text"
                name="registeredAddress"
                value={config.registeredAddress}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Admin Contact Email</label>
              <input
                type="email"
                name="adminContactEmail"
                value={config.adminContactEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Carpooling Operational Configuration */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-2">
            <Fuel className="w-4 h-4 text-emerald-600" />
            <span>Carpooling Cost Configuration</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Fuel Cost / Liter (₹)</label>
              <input
                type="number"
                step="0.01"
                name="fuelCostPerLiter"
                value={config.fuelCostPerLiter}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Cost Per KM (₹)</label>
              <input
                type="number"
                step="0.01"
                name="travelCostPerKm"
                value={config.travelCostPerKm}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Travel Cost Operational (₹/km)</label>
              <input
                type="number"
                step="0.01"
                name="optionalTravelCost"
                value={config.optionalTravelCost}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition flex items-center space-x-2 text-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsTab;
