import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw, 
  AlertCircle,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { useTeachers, useDeleteTeacher } from '../../hooks/useTeachers';
import TeacherDetailsModal from '../../components/teachers/TeacherDetailsModal';
import TeacherDeleteConfirmModal from '../../components/teachers/TeacherDeleteConfirmModal';

export const TeacherListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [selectedTeacherForView, setSelectedTeacherForView] = useState(null);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  // Queries & Mutations
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    isFetching 
  } = useTeachers({
    search: searchTerm,
    subject: subjectFilter,
    employmentStatus: statusFilter,
  });

  const deleteMutation = useDeleteTeacher();

  const teachers = data?.teachers || [];
  const totalCount = data?.total || 0;

  const handleDeleteConfirm = async () => {
    if (!teacherToDelete) return;
    try {
      await deleteMutation.mutateAsync(teacherToDelete._id);
      setTeacherToDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const statusBadges = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-700 border-slate-200',
    resigned: 'bg-amber-50 text-amber-700 border-amber-200',
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
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Teacher Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage faculty directory, teaching assignments, and teacher records.
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
            to="/academic/teachers/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Teacher</span>
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
            placeholder="Search by name, employee ID, or subject..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <input
            type="text"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            placeholder="Filter Subject"
            className="w-36 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
            <option value="resigned">Resigned</option>
          </select>

          {/* Reset button */}
          {(searchTerm || subjectFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSubjectFilter('');
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
            <p className="text-sm font-medium text-slate-600">Loading faculty directory...</p>
          </div>
        </div>
      ) : isError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-800">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">Failed to load teachers</h3>
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
      ) : teachers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No teachers found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || subjectFilter || statusFilter
              ? 'No teacher matches your current filter criteria. Try clearing filters.'
              : 'The faculty directory is currently empty. Register your first teacher to get started.'}
          </p>
          <div className="mt-5">
            <Link
              to="/academic/teachers/new"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New Teacher</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Header Summary */}
          <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-800">Faculty Members:</span>
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
                  <th className="px-6 py-3">Employee ID</th>
                  <th className="px-6 py-3">Teacher Name</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Qualification</th>
                  <th className="px-6 py-3">Assigned Classes</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((teacher) => {
                  const assignedClassesStr = Array.isArray(teacher.assignedClasses) && teacher.assignedClasses.length > 0
                    ? teacher.assignedClasses.join(', ')
                    : '-';

                  return (
                    <tr key={teacher._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Employee ID */}
                      <td className="px-6 py-3.5 font-mono font-medium text-slate-900">
                        {teacher.employeeId}
                      </td>

                      {/* Teacher Name */}
                      <td className="px-6 py-3.5 font-semibold text-slate-800">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                            {teacher.firstName?.[0]}
                            {teacher.lastName?.[0]}
                          </div>
                          <span>
                            {teacher.firstName} {teacher.lastName}
                          </span>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-6 py-3.5 text-slate-700 font-medium">
                        {teacher.subject || teacher.specialization || '-'}
                      </td>

                      {/* Qualification */}
                      <td className="px-6 py-3.5 text-slate-600">{teacher.qualification || '-'}</td>

                      {/* Assigned Classes */}
                      <td className="px-6 py-3.5 text-slate-600">{assignedClassesStr}</td>

                      {/* Contact */}
                      <td className="px-6 py-3.5 text-slate-600">
                        <div>{teacher.phone || teacher.email || '-'}</div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                            statusBadges[teacher.employmentStatus] || statusBadges.active
                          }`}
                        >
                          {teacher.employmentStatus || 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => setSelectedTeacherForView(teacher)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            to={`/academic/teachers/${teacher._id}/edit`}
                            className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Edit Teacher"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setTeacherToDelete(teacher)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Teacher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <TeacherDetailsModal
        isOpen={Boolean(selectedTeacherForView)}
        onClose={() => setSelectedTeacherForView(null)}
        teacher={selectedTeacherForView}
      />

      {/* Delete Confirmation Modal */}
      <TeacherDeleteConfirmModal
        isOpen={Boolean(teacherToDelete)}
        onClose={() => setTeacherToDelete(null)}
        onConfirm={handleDeleteConfirm}
        teacher={teacherToDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default TeacherListPage;
