import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  Filter, 
  RefreshCw, 
  ListOrdered, 
  Clock, 
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { useStudents } from '../../hooks/useStudents';
import { useAttendance, useAttendanceSummary } from '../../hooks/useAttendance';
import AttendanceSummaryCards from '../../components/attendance/AttendanceSummaryCards';
import AttendanceRosterTable from '../../components/attendance/AttendanceRosterTable';
import AttendanceHistoryTable from '../../components/attendance/AttendanceHistoryTable';

export const AttendancePage = () => {
  // Calendar date in YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('');
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'records'

  // Sub-filters for Records tab
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Students (active only) for the selected class and section
  const {
    data: studentsData,
    isLoading: isLoadingStudents,
    refetch: refetchStudents,
    isFetching: isFetchingStudents,
  } = useStudents({
    className: selectedClass,
    section: selectedSection,
    status: 'active', // Exclude inactive students by default
  });

  const students = studentsData?.students || [];

  // 2. Fetch existing attendance for this class/section and date
  const {
    data: attendanceData,
    isLoading: isLoadingAttendance,
    isError: isErrorAttendance,
    error: errorAttendance,
    refetch: refetchAttendance,
    isFetching: isFetchingAttendance,
  } = useAttendance({
    date: selectedDate,
    className: selectedClass,
    section: selectedSection,
    status: activeTab === 'records' ? statusFilter : undefined,
  });

  const attendanceRecords = attendanceData?.attendance || [];

  // 3. Fetch summary metrics for selected date, class, and section
  const {
    data: summary,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = useAttendanceSummary({
    date: selectedDate,
    className: selectedClass,
    section: selectedSection,
  });

  const handleRefreshAll = () => {
    refetchStudents();
    refetchAttendance();
    refetchSummary();
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Academic & Parent Domain</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Attendance Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record daily student attendance, monitor participation metrics, and audit past records.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefreshAll}
            disabled={isFetchingStudents || isFetchingAttendance}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-sm"
            title="Refresh All"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                isFetchingStudents || isFetchingAttendance ? 'animate-spin text-indigo-600' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Date, Class, and Section Selection Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center space-x-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Date:</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-800"
            />
            {selectedDate !== todayStr && (
              <button
                type="button"
                onClick={handleSetToday}
                className="text-[11px] px-2 py-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium transition"
              >
                Today
              </button>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

          {/* Class Filter */}
          <div className="flex items-center space-x-1.5">
            <label className="text-xs font-semibold text-slate-600">Class:</label>
            <input
              type="text"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              placeholder="e.g. Class 10"
              className="w-32 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          {/* Section Filter */}
          <div className="flex items-center space-x-1.5">
            <label className="text-xs font-semibold text-slate-600">Section:</label>
            <input
              type="text"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              placeholder="All or A, B"
              className="w-24 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white uppercase"
            />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'roster'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mark Roster
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'records'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Attendance Log
          </button>
        </div>
      </div>

      {/* Daily Summary Metric Cards */}
      <AttendanceSummaryCards summary={summary} isLoading={isLoadingSummary} />

      {/* Main Tab Content */}
      {activeTab === 'roster' ? (
        isLoadingStudents ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading class roster...</p>
          </div>
        ) : (
          <AttendanceRosterTable
            students={students}
            existingAttendance={attendanceRecords}
            date={selectedDate}
            className={selectedClass}
            section={selectedSection}
            onSaveSuccess={handleRefreshAll}
          />
        )
      ) : (
        <AttendanceHistoryTable
          attendance={attendanceRecords}
          isLoading={isLoadingAttendance}
          isError={isErrorAttendance}
          error={errorAttendance}
          refetch={refetchAttendance}
          isFetching={isFetchingAttendance}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      )}
    </div>
  );
};

export default AttendancePage;
