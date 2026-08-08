import React, { useState } from 'react';
import { Search, UserPlus, Shield, ShieldOff, Mail, CheckCircle, XCircle } from 'lucide-react';
import AdminMetricsHeader from '../../components/AdminMetricsHeader';

const EmployeesTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([
    {
      id: '1',
      name: 'Raj Patel',
      email: 'raj.patel@company.com',
      department: 'Engineering',
      manager: 'A. Rao',
      location: 'Ahmedabad',
      platformAccess: true,
    },
    {
      id: '2',
      name: 'Krupali Shah',
      email: 'krupali.shah@company.com',
      department: 'Sales',
      manager: 'B. Mehta',
      location: 'Ahmedabad',
      platformAccess: true,
    },
    {
      id: '3',
      name: 'Priya Dave',
      email: 'priya.dave@company.com',
      department: 'HR',
      manager: 'A. Rao',
      location: 'Gandhinagar',
      platformAccess: false,
    },
  ]);

  const toggleAccess = (id) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, platformAccess: !emp.platformAccess } : emp
      )
    );
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminMetricsHeader
        totalEmployees={employees.length}
        registeredVehicles={22}
        ridesThisMonth={163}
      />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        {/* Toolbar Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            onClick={() => alert('Add Employee Modal Trigger')}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Employee</span>
          </button>
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Manager</th>
                <th className="py-3 px-4">Office Location</th>
                <th className="py-3 px-4">Platform Access</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{emp.name}</div>
                    <div className="text-xs text-gray-400 flex items-center space-x-1">
                      <Mail className="w-3 h-3" />
                      <span>{emp.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{emp.department}</td>
                  <td className="py-3 px-4 text-gray-600">{emp.manager}</td>
                  <td className="py-3 px-4 text-gray-600">{emp.location}</td>
                  <td className="py-3 px-4">
                    {emp.platformAccess ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" /> Granted
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" /> Revoked
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleAccess(emp.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition inline-flex items-center space-x-1 ${
                        emp.platformAccess
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-green-200 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {emp.platformAccess ? (
                        <>
                          <ShieldOff className="w-3.5 h-3.5" />
                          <span>Revoke Access</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-3.5 h-3.5" />
                          <span>Grant Access</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeesTab;