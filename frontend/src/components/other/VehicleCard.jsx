import React from 'react';
import { Car, Users, CheckCircle, Clock, XCircle, Trash2, Edit } from 'lucide-react';

const VehicleCard = ({ vehicle, onEdit, onDelete, isAdminView = false, onToggleStatus }) => {
  const { registrationNumber, model, seatingCapacity, driverName, status } = vehicle;

  const statusBadge = (status) => {
    switch (status) {
      case 'Active':
      case 'Approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Active
          </span>
        );
      case 'PendingApproval':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> Pending Approval
          </span>
        );
      case 'Inactive':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" /> Inactive
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Car className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{model}</h3>
            <p className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">
              {registrationNumber}
            </p>
          </div>
        </div>
        <div>{statusBadge(status)}</div>
      </div>

      <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span>Seats: <strong className="text-gray-800">{seatingCapacity}</strong></span>
        </div>
        {driverName && (
          <div className="text-xs text-gray-500">
            Driver: <span className="font-medium text-gray-700">{driverName}</span>
          </div>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end space-x-2">
        {isAdminView ? (
          <button
            onClick={() => onToggleStatus(vehicle._id)}
            className="text-xs font-medium px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition"
          >
            {status === 'Active' ? 'Deactivate' : 'Approve / Activate'}
          </button>
        ) : (
          <>
            {onEdit && (
              <button
                onClick={() => onEdit(vehicle)}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(vehicle._id)}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
