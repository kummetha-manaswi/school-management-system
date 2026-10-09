import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw, 
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { useStudents, useDeleteStudent } from '../../hooks/useStudents';
import StudentDetailsModal from '../../components/students/StudentDetailsModal';
import DeleteConfirmModal from '../../components/students/DeleteConfirmModal';

export const StudentListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [selectedStudentForView, setSelectedStudentForView] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Queries & Mutations
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    isFetching 
  } = useStudents({
    search: searchTerm,
    className: classFilter,
    section: sectionFilter,
    status: statusFilter,
  });

  const deleteMutation = useDeleteStudent();

  const students = data?.students || [];
  const totalCount = data?.total || 0;

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      await deleteMutation.mutateAsync(studentToDelete._id);
      setStudentToDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const statusBadges = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-700 border-slate-200',
    graduated: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    transferred: 'bg-amber-50 text-amber-700 border-amber-200',
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
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Student Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student registrations, academic allocations, and profiles.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-sm"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <Link
            to="/academic/students/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, admission no, or roll no..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
          <input
            type="text"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            placeholder="Filter Class"
            className="w-32 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />

          {/* Section Filter */}
          <input
            type="text"
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            placeholder="Section"
            className="w-24 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white uppercase"
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
            <option value="transferred">Transferred</option>
          </select>

          {/* Reset button */}
          {(searchTerm || classFilter || sectionFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setClassFilter('');
                setSectionFilter('');
                setStatusFilter('');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
            <p className="text-sm font-medium text-slate-600">Loading student directory...</p>
          </div>
        </div>
      ) : isError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-800">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">Failed to load students</h3>
              <p className="text-xs text-rose-700 mt-1">
                {error?.response?.data?.message || error?.message || 'Could not connect to the backend API.'}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-3 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition"
              >
                Retry Request
              </button>
            </div>
          </div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No students found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || classFilter || sectionFilter || statusFilter
              ? 'No student matches your current filter criteria. Try clearing filters.'
              : 'The student directory is currently empty. Register your first student to get started.'}
          </p>
          <div className="mt-5">
            <Link
              to="/academic/students/new"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New Student</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Header Summary */}
          <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-800">Enrolled Students:</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono font-medium">
                {totalCount}
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">Academic Year 2026</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Admission No</th>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3">Class</th>
                  <th className="px-6 py-3">Section</th>
                  <th className="px-6 py-3">Roll No</th>
                  <th className="px-6 py-3">Parent Name</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Admission Number */}
                    <td className="px-6 py-3.5 font-mono font-medium text-slate-900">
                      {student.admissionNumber}
                    </td>

                    {/* Student Name */}
                    <td className="px-6 py-3.5 font-semibold text-slate-800">
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

                    {/* Class */}
                    <td className="px-6 py-3.5 text-slate-600 font-medium">{student.className}</td>

                    {/* Section */}
                    <td className="px-6 py-3.5 text-slate-600">{student.section || '-'}</td>

                    {/* Roll No */}
                    <td className="px-6 py-3.5 font-mono text-slate-600">{student.rollNumber || '-'}</td>

                    {/* Parent Name */}
                    <td className="px-6 py-3.5 text-slate-600">{student.parentName || '-'}</td>

                    {/* Status */}
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                          statusBadges[student.status] || statusBadges.active
                        }`}
                      >
                        {student.status || 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => setSelectedStudentForView(student)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/academic/students/${student._id}/edit`}
                          className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="Edit Student"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <StudentDetailsModal
        isOpen={Boolean(selectedStudentForView)}
        onClose={() => setSelectedStudentForView(null)}
        student={selectedStudentForView}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(studentToDelete)}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        student={studentToDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default StudentListPage;
