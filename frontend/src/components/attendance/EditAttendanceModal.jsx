import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useUpdateAttendance } from '../../hooks/useAttendance';

export const EditAttendanceModal = ({ isOpen, onClose, record }) => {
  const [status, setStatus] = useState('present');
  const [remarks, setRemarks] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const updateMutation = useUpdateAttendance();

  useEffect(() => {
    if (record) {
      setStatus(record.status || 'present');
      setRemarks(record.remarks || '');
      setErrorMsg('');
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await updateMutation.mutateAsync({
        id: record._id,
        data: { status, remarks },
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update record');
    }
  };

  const studentName = record.student
    ? `${record.student.firstName} ${record.student.lastName}`
    : 'Unknown Student';

  const admissionNo = record.student?.admissionNumber || 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Correct Attendance</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Date: {record.dateString || record.date?.slice(0, 10)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Student Info Card */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
            <p className="font-semibold text-slate-800 text-sm">{studentName}</p>
            <div className="flex items-center space-x-3 text-slate-500">
              <span>Adm No: <strong className="font-mono text-slate-700">{admissionNo}</strong></span>
              <span>Class: <strong className="text-slate-700">{record.className} {record.section ? `(${record.section})` : ''}</strong></span>
            </div>
          </div>

          {/* Status Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Attendance Status
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'present', label: 'Present', color: 'hover:border-emerald-500 peer-checked:bg-emerald-600 peer-checked:text-white' },
                { id: 'absent', label: 'Absent', color: 'hover:border-rose-500 peer-checked:bg-rose-600 peer-checked:text-white' },
                { id: 'late', label: 'Late', color: 'hover:border-amber-500 peer-checked:bg-amber-600 peer-checked:text-white' },
                { id: 'excused', label: 'Excused', color: 'hover:border-sky-500 peer-checked:bg-sky-600 peer-checked:text-white' },
              ].map((opt) => (
                <label key={opt.id} className="cursor-pointer">
                  <input
                    type="radio"
                    name="modalStatus"
                    value={opt.id}
                    checked={status === opt.id}
                    onChange={(e) => setStatus(e.target.value)}
                    className="sr-only peer"
                  />
                  <div className={`py-2 text-center text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 transition ${opt.color}`}>
                    {opt.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Remarks Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks / Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Doctor's appointment, Bus delay"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{updateMutation.isPending ? 'Updating...' : 'Save Correction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAttendanceModal;
