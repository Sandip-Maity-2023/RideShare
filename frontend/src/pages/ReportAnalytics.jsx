import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Fuel, Award, Compass } from 'lucide-react';

const ReportsAnalytics = () => {
  const fuelEfficiencyData = [
    { month: 'Jan', fuelLitres: 420, totalKm: 5100 },
    { month: 'Feb', fuelLitres: 380, totalKm: 4800 },
    { month: 'Mar', fuelLitres: 450, totalKm: 5900 },
    { month: 'Apr', fuelLitres: 410, totalKm: 5300 },
    { month: 'May', fuelLitres: 490, totalKm: 6400 },
    { month: 'Jun', fuelLitres: 460, totalKm: 6100 },
  ];

  const vehicleCostData = [
    { vehicle: 'Swift Dzire', cost: 12400 },
    { vehicle: 'Honda City', cost: 18200 },
    { vehicle: 'Alto 800', cost: 8100 },
    { vehicle: 'Creta SUV', cost: 21000 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Operational Analytics</h1>
          <p className="text-sm text-gray-500">Monitor platform travel activity and fuel consumption metrics</p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Distance</p>
            <p className="text-xl font-bold text-gray-900">33,600 km</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Fuel Consumed</p>
            <p className="text-xl font-bold text-gray-900">2,610 L</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Cost Per KM</p>
            <p className="text-xl font-bold text-gray-900">₹8.00 / km</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">CO₂ Saved</p>
            <p className="text-xl font-bold text-gray-900">4.2 Tons</p>
          </div>
        </div>
      </div>

      {/* Charts Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Efficiency Trend */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Fuel Efficiency & Distance Trends
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fuelEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalKm" stroke="#2563eb" strokeWidth={3} name="Total KM" />
                <Line type="monotone" dataKey="fuelLitres" stroke="#059669" strokeWidth={3} name="Fuel (L)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle-wise Cost Analysis */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Vehicle-Wise Cost Analysis (₹)
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleCostData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="vehicle" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cost" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Operating Cost (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
