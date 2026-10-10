import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2, 
  FileText, 
  Layers, 
  GraduationCap,
  Filter
} from 'lucide-react';
import { useAssignments, useAssignmentSummary, useDeleteAssignment } from '../../hooks/useAssignments';
import { useTeachers } from '../../hooks/useTeachers';
import AssignmentDetailsModal from '../../components/assignments/AssignmentDetailsModal';
import AssignmentDeleteConfirmModal from '../../components/assignments/AssignmentDeleteConfirmModal';

export const AssignmentListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [selectedAssignmentForView, setSelectedAssignmentForView] = useState(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);

  // Queries
  const { data: teachersData } = useTeachers({ employmentStatus: 'active' });
  const teachers = teachersData?.teachers || [];

  const {
    data: assignmentsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAssignments({
    search: searchTerm,
    className: classFilter,
    section: sectionFilter,
    subject: subjectFilter,
    teacher: teacherFilter,
    status: statusFilter === 'overdue' ? undefined : statusFilter,
    isOverdue: statusFilter === 'overdue' ? 'true' : undefined,
  });

  const { data: summary, isLoading: isLoadingSummary } = useAssignmentSummary({
    className: classFilter,
    section: sectionFilter,
    subject: subjectFilter,
    teacher: teacherFilter,
  });

  const deleteMutation = useDeleteAssignment();

  const assignments = assignmentsData?.assignments || [];
  const totalCount = assignmentsData?.total || 0;

  const handleDeleteConfirm = async () => {
    if (!assignmentToDelete) return;
    try {
      await deleteMutation.mutateAsync(assignmentToDelete._id);
      setAssignmentToDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const statusBadges = {
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    completed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    archived: 'bg-slate-200 text-slate-600 border-slate-300',
  };

  // Helper to calculate days remaining or overdue text
  const getDueBadge = (dueDateStr, isOverdue, status) => {
    if (status === 'completed' || status === 'archived') {
      return null;
    }
    const today = new Date(new Date().toISOString().slice(0, 10));
    const due = new Date(dueDateStr?.slice(0, 10));
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (isOverdue || diffDays < 0) {
      const absDays = Math.abs(diffDays);
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          <span>Overdue ({absDays}d ago)</span>
        </span>
      );
    }

    if (diffDays === 0) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Due today</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
        <Clock className="w-3 h-3 text-slate-400" />
        <span>Due in {diffDays}d</span>
      </span>
    );
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
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Assignments & Homework</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, monitor, and coordinate class assignments, projects, and homework coursework.
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
            to="/academic/assignments/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Assignment</span>
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Assignments</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">{summary?.total || 0}</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Published / Active</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">{summary?.published || 0}</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-600 uppercase">Overdue Coursework</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-600">{summary?.overdue || 0}</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Completed</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-700">{summary?.completed || 0}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, subject, or description..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              placeholder="Filter Class"
              className="w-28 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />

            <input
              type="text"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              placeholder="Section"
              className="w-20 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white uppercase"
            />

            <input
              type="text"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              placeholder="Subject"
              className="w-28 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />

            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700 max-w-[140px] truncate"
            >
              <option value="">All Teachers</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="overdue">Overdue Only</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>

            {(searchTerm || classFilter || sectionFilter || subjectFilter || teacherFilter || statusFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setClassFilter('');
                  setSectionFilter('');
                  setSubjectFilter('');
                  setTeacherFilter('');
                  setStatusFilter('');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading coursework...</p>
        </div>
      ) : isError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-800">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">Failed to load assignments</h3>
              <p className="text-xs text-rose-700 mt-1">
                {error?.response?.data?.message || error?.message || 'Could not connect to the backend API.'}
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
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No assignments found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || classFilter || sectionFilter || subjectFilter || teacherFilter || statusFilter
              ? 'No assignments match your current filter criteria. Try adjusting filters.'
              : 'No coursework has been created yet. Publish your first assignment to get started.'}
          </p>
          <div className="mt-5">
            <Link
              to="/academic/assignments/new"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Assignment</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-800">Total Coursework Items:</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono font-medium">
                {totalCount}
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">Academic Year 2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Assignment Title</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Class & Section</th>
                  <th className="px-6 py-3">Teacher</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((asgn) => {
                  const teacher = asgn.teacher;
                  const sectionLabel = asgn.section ? asgn.section : 'All Sections';
                  const dueBadge = getDueBadge(asgn.dueDate, asgn.isOverdue, asgn.status);

                  return (
                    <tr key={asgn._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Title & Attachments */}
                      <td className="px-6 py-3.5">
                        <div className="max-w-xs">
                          <p className="font-semibold text-slate-900 line-clamp-1">{asgn.title}</p>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                            {asgn.attachments?.length > 0 && (
                              <span className="inline-flex items-center space-x-0.5 text-indigo-600 font-medium">
                                <FileText className="w-3 h-3" />
                                <span>{asgn.attachments.length} link(s)</span>
                              </span>
                            )}
                            <span>Max: {asgn.maxMarks || 100} pts</span>
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-6 py-3.5">
                        <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {asgn.subject}
                        </span>
                      </td>

                      {/* Class & Section */}
                      <td className="px-6 py-3.5 text-slate-700">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-medium">{asgn.className}</span>
                          <span className="text-slate-400 font-mono text-[11px]">({sectionLabel})</span>
                        </div>
                      </td>

                      {/* Teacher */}
                      <td className="px-6 py-3.5">
                        {teacher ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[9px]">
                              {teacher.firstName?.[0]}
                              {teacher.lastName?.[0]}
                            </div>
                            <span className="text-slate-800 font-medium truncate max-w-[120px]">
                              {teacher.firstName} {teacher.lastName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>

                      {/* Due Date & Countdown */}
                      <td className="px-6 py-3.5">
                        <div className="space-y-0.5">
                          <p className="font-mono text-slate-700 font-medium">
                            {asgn.dueDateString || asgn.dueDate?.slice(0, 10)}
                          </p>
                          {dueBadge}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                            statusBadges[asgn.status] || statusBadges.published
                          }`}
                        >
                          {asgn.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => setSelectedAssignmentForView(asgn)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            to={`/academic/assignments/${asgn._id}/edit`}
                            className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Edit Assignment"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setAssignmentToDelete(asgn)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Assignment"
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
      <AssignmentDetailsModal
        isOpen={Boolean(selectedAssignmentForView)}
        onClose={() => setSelectedAssignmentForView(null)}
        assignment={selectedAssignmentForView}
      />

      {/* Delete Confirmation Modal */}
      <AssignmentDeleteConfirmModal
        isOpen={Boolean(assignmentToDelete)}
        onClose={() => setAssignmentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        assignment={assignmentToDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default AssignmentListPage;
