import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  AlertCircle, 
  Save, 
  RefreshCw, 
  UserCheck, 
  UserX,
  Search,
  Filter,
  Check,
  ShieldAlert
} from 'lucide-react';
import { useStudents } from '../../hooks/useStudents';

export const ExamResultRosterTable = ({
  exam,
  existingResults = [],
  onSaveBulk,
  isSaving,
  saveError,
}) => {
  // Query active students in exam class & section
  const {
    data: studentsData,
    isLoading: isLoadingStudents,
    isError: isStudentsError,
    error: studentsFetchError,
  } = useStudents({
    className: exam.className,
    section: exam.section || undefined,
    status: 'active',
  });

  const students = studentsData?.students || [];

  // Local state for results roster: studentId -> record
  const [rosterState, setRosterState] = useState({});
  const [allowCorrection, setAllowCorrection] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, recorded, unrecorded, pass, fail, absent
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Initialize/sync roster with existing results and active students
  useEffect(() => {
    if (!students || students.length === 0) return;

    // Create lookup for existing results by student ID
    const existingMap = new Map();
    existingResults.forEach((r) => {
      const sId = (r.student?._id || r.student)?.toString();
      if (sId) {
        existingMap.set(sId, r);
      }
    });

    const newRoster = {};
    students.forEach((s) => {
      const sId = s._id.toString();
      const existing = existingMap.get(sId);

      if (existing) {
        newRoster[sId] = {
          studentId: sId,
          marksObtained: existing.isAbsent ? 0 : existing.marksObtained,
          isAbsent: Boolean(existing.isAbsent),
          remarks: existing.remarks || '',
          percentage: existing.percentage || 0,
          status: existing.status || (existing.isAbsent ? 'absent' : 'pass'),
          hasExistingRecord: true,
          resultId: existing._id,
        };
      } else {
        newRoster[sId] = {
          studentId: sId,
          marksObtained: '',
          isAbsent: false,
          remarks: '',
          percentage: 0,
          status: 'unrecorded',
          hasExistingRecord: false,
        };
      }
    });

    setRosterState(newRoster);
  }, [students, existingResults]);

  // Handle Marks input change
  const handleMarksChange = (studentId, val) => {
    setSaveSuccessMessage('');
    const num = val === '' ? '' : Number(val);

    setRosterState((prev) => {
      const current = prev[studentId] || {};
      let percentage = 0;
      let status = 'unrecorded';

      if (num !== '') {
        const boundedMarks = Math.min(Math.max(0, num), exam.maxMarks);
        percentage = Number(((boundedMarks / exam.maxMarks) * 100).toFixed(1));
        status = boundedMarks >= exam.passingMarks ? 'pass' : 'fail';
      }

      return {
        ...prev,
        [studentId]: {
          ...current,
          marksObtained: num === '' ? '' : Math.min(Math.max(0, num), exam.maxMarks),
          isAbsent: false,
          percentage,
          status,
        },
      };
    });
  };

  // Handle Absent checkbox toggle
  const handleAbsentToggle = (studentId, isAbsent) => {
    setSaveSuccessMessage('');
    setRosterState((prev) => {
      const current = prev[studentId] || {};
      if (isAbsent) {
        return {
          ...prev,
          [studentId]: {
            ...current,
            isAbsent: true,
            marksObtained: 0,
            percentage: 0,
            status: 'absent',
          },
        };
      } else {
        const marks = current.marksObtained || 0;
        const percentage = Number(((marks / exam.maxMarks) * 100).toFixed(1));
        const status = marks >= exam.passingMarks ? 'pass' : 'fail';
        return {
          ...prev,
          [studentId]: {
            ...current,
            isAbsent: false,
            marksObtained: marks,
            percentage,
            status,
          },
        };
      }
    });
  };

  // Handle remarks change
  const handleRemarksChange = (studentId, text) => {
    setSaveSuccessMessage('');
    setRosterState((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        remarks: text,
      },
    }));
  };

  // Bulk quick helper: Mark all present & set passing marks
  const handleSetAllPassing = () => {
    setRosterState((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((sId) => {
        if (!updated[sId].isAbsent) {
          updated[sId].marksObtained = exam.passingMarks;
          updated[sId].percentage = Number(((exam.passingMarks / exam.maxMarks) * 100).toFixed(1));
          updated[sId].status = 'pass';
        }
      });
      return updated;
    });
  };

  // Form submission handler
  const handleSaveAll = async () => {
    setSaveSuccessMessage('');
    // Collect all entries that have either isAbsent=true OR valid numeric marksObtained
    const payloadResults = [];

    students.forEach((s) => {
      const record = rosterState[s._id.toString()];
      if (!record) return;

      if (record.isAbsent) {
        payloadResults.push({
          student: s._id,
          marksObtained: 0,
          isAbsent: true,
          remarks: record.remarks || '',
        });
      } else if (record.marksObtained !== '' && record.marksObtained !== undefined) {
        payloadResults.push({
          student: s._id,
          marksObtained: Number(record.marksObtained),
          isAbsent: false,
          remarks: record.remarks || '',
        });
      }
    });

    if (payloadResults.length === 0) {
      alert('No results entered to save. Please enter marks or mark students absent.');
      return;
    }

    try {
      await onSaveBulk({
        results: payloadResults,
        allowCorrection,
      });
      setSaveSuccessMessage(`Successfully saved results for ${payloadResults.length} student(s)!`);
    } catch (err) {
      console.error('Save results failed:', err);
    }
  };

  // Filter students based on search and status
  const filteredStudents = students.filter((s) => {
    const sId = s._id.toString();
    const record = rosterState[sId] || {};

    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    const adm = (s.admissionNumber || '').toLowerCase();
    const roll = (s.rollNumber || '').toLowerCase();
    const matchSearch =
      !searchTerm ||
      fullName.includes(searchTerm.toLowerCase()) ||
      adm.includes(searchTerm.toLowerCase()) ||
      roll.includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    if (statusFilter === 'recorded') return record.hasExistingRecord;
    if (statusFilter === 'unrecorded') return !record.hasExistingRecord;
    if (statusFilter === 'pass') return record.status === 'pass';
    if (statusFilter === 'fail') return record.status === 'fail';
    if (statusFilter === 'absent') return record.isAbsent;

    return true;
  });

  const existingCount = Object.values(rosterState).filter((r) => r.hasExistingRecord).length;
  const isConflictError = saveError?.response?.status === 409;
  const conflictMessage = saveError?.response?.data?.message || saveError?.message;

  if (isLoadingStudents) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading student roster for {exam.className}...</p>
      </div>
    );
  }

  if (isStudentsError) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-800">
        <h3 className="text-sm font-bold">Failed to load student roster</h3>
        <p className="text-xs text-rose-700 mt-1">
          {studentsFetchError?.response?.data?.message || studentsFetchError?.message || 'Error occurred.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Published Exam Notice Banner */}
      {exam.isResultPublished && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start space-x-3 text-indigo-950 text-sm">
          <ShieldAlert className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-bold">Results Published (Read-Only Mode)</h4>
            <p className="text-xs text-indigo-800 leading-relaxed">
              Results for this examination have been published. To record new scores or modify existing results, an administrator must unpublish the exam results first.
            </p>
          </div>
        </div>
      )}

      {/* Success banner */}
      {saveSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="font-medium">{saveSuccessMessage}</p>
        </div>
      )}

      {/* Conflict Error Notice */}
      {isConflictError && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start space-x-3 text-amber-900 text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-bold">Duplicate Records Detected (Conflict)</h4>
            <p className="text-xs leading-relaxed">{conflictMessage}</p>
            <div className="flex items-center space-x-2 pt-1">
              <label className="inline-flex items-center space-x-2 text-xs font-semibold text-amber-950 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-amber-300 shadow-sm">
                <input
                  type="checkbox"
                  checked={allowCorrection}
                  onChange={(e) => setAllowCorrection(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Enable "Allow Correction" to update existing student scores</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Other Error Notice */}
      {!isConflictError && saveError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Save Failed</h4>
            <p className="text-xs mt-0.5">{conflictMessage}</p>
          </div>
        </div>
      )}

      {/* Roster Controls & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student or roll #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">All Roster ({students.length})</option>
            <option value="recorded">Recorded ({existingCount})</option>
            <option value="unrecorded">Pending ({students.length - existingCount})</option>
            <option value="pass">Passed</option>
            <option value="fail">Failed</option>
            <option value="absent">Absent</option>
          </select>

          {/* Correction Toggle */}
          <label className="inline-flex items-center space-x-2 text-xs text-slate-700 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 select-none">
            <input
              type="checkbox"
              checked={allowCorrection}
              onChange={(e) => setAllowCorrection(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
            />
            <span className="font-medium">Allow Correction (Overwrite)</span>
          </label>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleSetAllPassing}
            disabled={exam.isResultPublished}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            title={exam.isResultPublished ? 'Results are published (read-only)' : 'Auto fill passing marks for active students'}
          >
            Quick Fill Passing Marks
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving || exam.isResultPublished}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={exam.isResultPublished ? 'Results are published. Unpublish results to modify.' : 'Save all results'}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save All Results</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-slate-500">
              {students.length === 0
                ? `No active students found in ${exam.className} ${exam.section ? `(Section ${exam.section})` : ''}.`
                : 'No students match current search or filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Roll #</th>
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-3 text-center">Absent?</th>
                  <th className="py-3 px-4">
                    Marks Obtained <span className="font-normal lowercase text-slate-400">(/ {exam.maxMarks})</span>
                  </th>
                  <th className="py-3 px-3 text-center">Percentage</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => {
                  const sId = s._id.toString();
                  const rec = rosterState[sId] || {
                    marksObtained: '',
                    isAbsent: false,
                    remarks: '',
                    percentage: 0,
                    status: 'unrecorded',
                    hasExistingRecord: false,
                  };

                  const isRowAbsent = rec.isAbsent;
                  const isPass = rec.status === 'pass';
                  const isFail = rec.status === 'fail';

                  return (
                    <tr
                      key={sId}
                      className={`transition-colors hover:bg-slate-50/60 ${
                        rec.hasExistingRecord ? 'bg-indigo-50/10' : ''
                      }`}
                    >
                      {/* Roll Number */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">
                        {s.rollNumber || '—'}
                      </td>

                      {/* Student info */}
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold text-slate-900 text-xs">
                            {s.firstName} {s.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Adm: {s.admissionNumber} • {s.className} {s.section ? `(${s.section})` : ''}
                          </div>
                        </div>
                      </td>

                      {/* Absent checkbox */}
                      <td className="py-3 px-3 text-center">
                        <label className="inline-flex items-center justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isRowAbsent}
                            disabled={exam.isResultPublished}
                            onChange={(e) => handleAbsentToggle(sId, e.target.checked)}
                            className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </label>
                      </td>

                      {/* Marks Input */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max={exam.maxMarks}
                            disabled={isRowAbsent || exam.isResultPublished}
                            value={isRowAbsent ? 0 : rec.marksObtained}
                            onChange={(e) => handleMarksChange(sId, e.target.value)}
                            placeholder="0"
                            className={`w-24 px-2.5 py-1 text-xs font-mono font-semibold rounded-lg border text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition ${
                              isRowAbsent || exam.isResultPublished
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                : rec.marksObtained !== '' && Number(rec.marksObtained) >= exam.passingMarks
                                ? 'border-emerald-300 bg-emerald-50/40 text-emerald-900'
                                : rec.marksObtained !== ''
                                ? 'border-rose-300 bg-rose-50/40 text-rose-900'
                                : 'border-slate-200 bg-white text-slate-800'
                            }`}
                          />
                          <span className="text-[11px] text-slate-400">/ {exam.maxMarks}</span>
                        </div>
                      </td>

                      {/* Percentage */}
                      <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                        {isRowAbsent
                          ? '0.0%'
                          : rec.marksObtained !== ''
                          ? `${rec.percentage}%`
                          : '—'}
                      </td>

                      {/* Calculated Status Badge */}
                      <td className="py-3 px-3 text-center">
                        {isRowAbsent ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                            Absent
                          </span>
                        ) : isPass ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Pass
                          </span>
                        ) : isFail ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                            Fail
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Remarks Input */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={rec.remarks || ''}
                          disabled={exam.isResultPublished}
                          onChange={(e) => handleRemarksChange(sId, e.target.value)}
                          placeholder="Optional remarks..."
                          className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Save Bar */}
      {filteredStudents.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">
            Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> enrolled students in roster.
          </div>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving || exam.isResultPublished}
            className="inline-flex items-center space-x-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={exam.isResultPublished ? 'Results are published. Unpublish results to modify.' : 'Save all results'}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Roster Results...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Results</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ExamResultRosterTable;
