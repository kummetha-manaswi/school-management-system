import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Edit, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import EditAttendanceModal from './EditAttendanceModal';

export const AttendanceHistoryTable = ({ 
  attendance = [], 
  isLoading, 
  isError, 
  error, 
  refetch, 
  isFetching,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm
}) => {
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState(null);

  const statusBadges = {
    present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    absent: 'bg-rose-50 text-rose-700 border-rose-200',
    late: 'bg-amber-50 text-amber-700 border-amber-200',
    excused: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  const filteredAttendance = attendance.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const student = item.student || {};
    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
    const admNo = (student.admissionNumber || '').toLowerCase();
    const rollNo = (student.rollNumber || '').toLowerCase();
    const remarks = (item.remarks || '').toLowerCase();

    return fullName.includes(term) || admNo.includes(term) || rollNo.includes(term) || remarks.includes(term);
  });

  return (
    <div className="space-y-4">
      {/* Sub-filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search recorded students by name, admission number, or remarks..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="excused">Excused</option>
          </select>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-sm"
            title="Refresh records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Records Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading attendance records...</p>
        </div>
      ) : isError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-800">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">Failed to load attendance records</h3>
              <p className="text-xs text-rose-700 mt-1">
                {error?.response?.data?.message || error?.message || 'Could not connect to backend API.'}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-3 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      ) : filteredAttendance.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No attendance records found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter
              ? 'No records match your search or status filter. Try clearing filters.'
              : 'No attendance records have been registered for this date and class yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-slate-700">
              Showing {filteredAttendance.length} records
            </span>
            <span className="text-[11px] text-slate-400">Sorted by Date (Newest first)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3">Admission No</th>
                  <th className="px-6 py-3">Class & Section</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Remarks</th>
                  <th className="px-6 py-3">Recorded Date</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendance.map((rec) => {
                  const student = rec.student || {};
                  return (
                    <tr key={rec._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Student Name */}
                      <td className="px-6 py-3.5 font-semibold text-slate-900">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                            {student.firstName?.[0]}
                            {student.lastName?.[0]}
                          </div>
                          <span>
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                      </td>

                      {/* Admission Number */}
                      <td className="px-6 py-3.5 font-mono text-slate-700">
                        {student.admissionNumber || '-'}
                      </td>

                      {/* Class & Section */}
                      <td className="px-6 py-3.5 text-slate-600">
                        {rec.className} {rec.section ? `(${rec.section})` : ''}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                            statusBadges[rec.status] || statusBadges.present
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>

                      {/* Remarks */}
                      <td className="px-6 py-3.5 text-slate-600 max-w-xs truncate">
                        {rec.remarks || <span className="text-slate-400 italic">None</span>}
                      </td>

                      {/* Recorded Date */}
                      <td className="px-6 py-3.5 font-mono text-slate-500">
                        {rec.dateString || rec.date?.slice(0, 10)}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedRecordForEdit(rec)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition border border-slate-200"
                          title="Edit / Correct"
                        >
                          <Edit className="w-3 h-3" />
                          <span className="text-[11px] font-medium">Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      <EditAttendanceModal
        isOpen={Boolean(selectedRecordForEdit)}
        onClose={() => setSelectedRecordForEdit(null)}
        record={selectedRecordForEdit}
      />
    </div>
  );
};

export default AttendanceHistoryTable;
