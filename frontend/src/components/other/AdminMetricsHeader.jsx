import React from 'react';
import { Users, Car, Navigation } from 'lucide-react';

const AdminMetricsHeader = ({ totalEmployees = 0, registeredVehicles = 0, ridesThisMonth = 0 }) => {
  const metrics = [
    {
      id: 1,
      label: 'Total Employees',
      value: totalEmployees,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 2,
      label: 'Registered Vehicles',
      value: registeredVehicles,
      icon: Car,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      id: 3,
      label: 'Rides This Month',
      value: ridesThisMonth,
      icon: Navigation,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.id}
            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-4 shadow-sm"
          >
            <div className={`p-3 rounded-lg ${metric.bgColor} ${metric.color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {metric.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">
                {metric.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminMetricsHeader;