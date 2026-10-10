import React, { useState, useEffect } from 'react';
import { 
  Check, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle, 
  Save, 
  AlertTriangle, 
  AlertCircle, 
  RefreshCw,
  Users,
  CheckCheck
} from 'lucide-react';
import { useBulkMarkAttendance } from '../../hooks/useAttendance';

export const AttendanceRosterTable = ({ 
  students = [], 
  existingAttendance = [], 
  date, 
  className, 
  section,
  onSaveSuccess 
}) => {
  const [roster, setRoster] = useState({});
  const [allowCorrection, setAllowCorrection] = useState(false);
  const [notification, setNotification] = useState(null);
  const [conflictError, setConflictError] = useState(null);

  const bulkMutation = useBulkMarkAttendance();

  // Map of studentId -> existing attendance record
  const existingMap = new Map(
    existingAttendance.map((rec) => [
      (rec.student?._id || rec.student).toString(),
      rec,
    ])
  );

  const hasPreviouslySavedRecords = existingAttendance.length > 0;

  // Initialize or update roster when students or existing records change
  useEffect(() => {
    const initial = {};
    students.forEach((student) => {
      const existing = existingMap.get(student._id.toString());
      if (existing) {
        initial[student._id] = {
          status: existing.status || 'present',
          remarks: existing.remarks || '',
          hasExisting: true,
          originalStatus: existing.status,
        };
      } else {
        initial[student._id] = {
          status: 'present',
          remarks: '',
          hasExisting: false,
          originalStatus: null,
        };
      }
    });
    setRoster(initial);
    setNotification(null);
    setConflictError(null);
  }, [students, existingAttendance]);

  const handleStatusChange = (studentId, status) => {
    setRoster((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setRoster((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const setAllStatus = (newStatus) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = {
        ...roster[s._id],
        status: newStatus,
      };
    });
    setRoster(updated);
  };

  const handleSaveAttendance = async () => {
    setNotification(null);
    setConflictError(null);

    const records = students.map((s) => ({
      student: s._id,
      status: roster[s._id]?.status || 'present',
      remarks: roster[s._id]?.remarks || '',
    }));

    if (records.length === 0) return;

    try {
      const res = await bulkMutation.mutateAsync({
        date,
        records,
        allowCorrection,
      });

      const { created = 0, updated = 0, total = 0 } = res?.data || {};
      setNotification({
        type: 'success',
        message: `Attendance successfully saved for ${total} student(s) (${created} created, ${updated} updated).`,
      });

      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictError(
          err.response.data?.message ||
          'Attendance was already saved for one or more students. Enable "Allow corrections" to update previously saved attendance.'
        );
      } else {
        setNotification({
          type: 'error',
          message: err.response?.data?.message || err.message || 'Failed to save attendance.',
        });
      }
    }
  };

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No active students found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No enrolled students match {className ? `class "${className}"` : 'the selected criteria'}
          {section ? ` and section "${section}"` : ''}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Banner Notifications */}
      {notification && (
        <div
          className={`p-4 border-b flex items-center justify-between text-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {conflictError && (
        <div className="p-4 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Attendance Already Recorded</p>
              <p className="text-amber-700 mt-0.5">{conflictError}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setAllowCorrection(true);
              setConflictError(null);
            }}
            className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition flex-shrink-0"
          >
            Enable Correction & Retry
          </button>
        </div>
      )}

      {/* Roster Controls Header */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Class Roster:</span>{' '}
            <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
              {students.length} students
            </span>
            {hasPreviouslySavedRecords && (
              <span className="ml-2 font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                {existingAttendance.length} previously recorded
              </span>
            )}
          </div>
        </div>

        {/* Quick Batch Actions & Correction Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-500 text-[11px] font-semibold uppercase">Batch:</span>
            <button
              type="button"
              onClick={() => setAllStatus('present')}
              className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 transition text-xs"
            >
              All Present
            </button>
            <button
              type="button"
              onClick={() => setAllStatus('absent')}
              className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200 transition text-xs"
            >
              All Absent
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

          {/* Correction Checkbox */}
          <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allowCorrection}
              onChange={(e) => setAllowCorrection(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
            />
            <span className="font-medium">Allow corrections</span>
          </label>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveAttendance}
            disabled={bulkMutation.isPending}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            {bulkMutation.isPending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{bulkMutation.isPending ? 'Saving...' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/60 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 w-16">Roll</th>
              <th className="px-6 py-3">Admission No</th>
              <th className="px-6 py-3">Student Name</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3">Remarks / Note</th>
              <th className="px-6 py-3 text-right">Saved State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => {
              const currentStatus = roster[student._id]?.status || 'present';
              const currentRemarks = roster[student._id]?.remarks || '';
              const hasExisting = roster[student._id]?.hasExisting;
              const originalStatus = roster[student._id]?.originalStatus;

              return (
                <tr key={student._id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Roll Number */}
                  <td className="px-6 py-3.5 font-mono text-slate-500">
                    {student.rollNumber || '-'}
                  </td>

                  {/* Admission Number */}
                  <td className="px-6 py-3.5 font-mono font-medium text-slate-800">
                    {student.admissionNumber}
                  </td>

                  {/* Student Name */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                        {student.firstName?.[0]}
                        {student.lastName?.[0]}
                      </div>
                      <span className="font-semibold text-slate-900">
                        {student.firstName} {student.lastName}
                      </span>
                    </div>
                  </td>

                  {/* Status Selection Buttons */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-center space-x-1">
                      {[
                        {
                          id: 'present',
                          label: 'Present',
                          short: 'P',
                          activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-sm',
                          inactiveClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
                        },
                        {
                          id: 'absent',
                          label: 'Absent',
                          short: 'A',
                          activeClass: 'bg-rose-600 text-white border-rose-600 shadow-sm',
                          inactiveClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
                        },
                        {
                          id: 'late',
                          label: 'Late',
                          short: 'L',
                          activeClass: 'bg-amber-600 text-white border-amber-600 shadow-sm',
                          inactiveClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
                        },
                        {
                          id: 'excused',
                          label: 'Excused',
                          short: 'E',
                          activeClass: 'bg-sky-600 text-white border-sky-600 shadow-sm',
                          inactiveClass: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
                        },
                      ].map((item) => {
                        const isSelected = currentStatus === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleStatusChange(student._id, item.id)}
                            title={item.label}
                            className={`px-3 py-1 rounded-md text-xs font-semibold border transition ${
                              isSelected ? item.activeClass : item.inactiveClass
                            }`}
                          >
                            <span className="hidden sm:inline">{item.label}</span>
                            <span className="sm:hidden">{item.short}</span>
                          </button>
                        );
                      })}
                    </div>
                  </td>

                  {/* Remarks Input */}
                  <td className="px-6 py-3.5">
                    <input
                      type="text"
                      value={currentRemarks}
                      onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                      placeholder="Optional note..."
                      className="w-full px-2.5 py-1 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                    />
                  </td>

                  {/* Saved State Indicator */}
                  <td className="px-6 py-3.5 text-right">
                    {hasExisting ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="capitalize">{originalStatus}</span>
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
                        New
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceRosterTable;
