import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  BarChart2, 
  CheckCircle2, 
  FileText, 
  Filter,
  Users
} from 'lucide-react';
import { useExams, useExamSummary, useDeleteExam } from '../../hooks/useExams';
import { useTeachers } from '../../hooks/useTeachers';
import ExamDetailsModal from '../../components/exams/ExamDetailsModal';
import ExamDeleteConfirmModal from '../../components/exams/ExamDeleteConfirmModal';

const EXAM_TYPE_LABELS = {
  unit_test: 'Unit Test',
  midterm: 'Midterm',
  final: 'Final',
  quiz: 'Quiz',
  practical: 'Practical',
  other: 'Other',
};

const STATUS_BADGES = {
  scheduled: { label: 'Scheduled', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  ongoing: { label: 'Ongoing', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: 'Completed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const ExamListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');

  // Modals state
  const [selectedExamForView, setSelectedExamForView] = useState(null);
  const [examToDelete, setExamToDelete] = useState(null);

  // Queries
  const { data: teachersData } = useTeachers({ employmentStatus: 'active' });
  const teachers = teachersData?.teachers || [];

  const {
    data: examsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useExams({
    search: searchTerm,
    className: classFilter,
    section: sectionFilter,
    subject: subjectFilter,
    examType: typeFilter,
    status: statusFilter,
    teacher: teacherFilter,
  });

  const { data: summary, isLoading: isLoadingSummary } = useExamSummary({
    className: classFilter,
    section: sectionFilter,
    subject: subjectFilter,
  });

  const deleteMutation = useDeleteExam();

  const exams = examsData?.exams || [];
  const totalCount = examsData?.total || 0;

  const handleDeleteConfirm = async () => {
    if (!examToDelete) return;
    try {
      await deleteMutation.mutateAsync(examToDelete._id);
      setExamToDelete(null);
    } catch (err) {
      console.error('Delete exam failed:', err);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setClassFilter('');
    setSectionFilter('');
    setSubjectFilter('');
    setTypeFilter('');
    setStatusFilter('');
    setTeacherFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Academic & Parent Domain</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Exams & Results</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Schedule examinations, record student marks, and view class performance analytics.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-sm"
            title="Refresh examination list"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <Link
            to="/academic/exams/new"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Exam</span>
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 block">Total Exams</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {isLoadingSummary ? '...' : summary.total}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-blue-600 block">Scheduled</span>
          <span className="text-2xl font-bold text-blue-700 mt-1 block">
            {isLoadingSummary ? '...' : summary.scheduled}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-amber-600 block">Ongoing</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">
            {isLoadingSummary ? '...' : summary.ongoing}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-emerald-600 block">Completed</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {isLoadingSummary ? '...' : summary.completed}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-rose-600 block">Cancelled</span>
          <span className="text-2xl font-bold text-rose-700 mt-1 block">
            {isLoadingSummary ? '...' : summary.cancelled}
          </span>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-indigo-600" />
          <span>Filters & Search</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Class */}
          <input
            type="text"
            placeholder="Class (e.g. Grade 10)"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />

          {/* Section */}
          <input
            type="text"
            placeholder="Section (e.g. A, B)"
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value.toUpperCase())}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 uppercase"
          />

          {/* Subject */}
          <input
            type="text"
            placeholder="Subject (e.g. Mathematics)"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />

          {/* Exam Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Exam Types</option>
            <option value="unit_test">Unit Test</option>
            <option value="midterm">Midterm</option>
            <option value="final">Final Exam</option>
            <option value="quiz">Quiz</option>
            <option value="practical">Practical</option>
            <option value="other">Other</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Teacher */}
          <select
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Teachers</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.firstName} {t.lastName} ({t.employeeId})
              </option>
            ))}
          </select>

          {/* Reset button */}
          <button
            onClick={handleResetFilters}
            className="w-full px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading examinations...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center bg-rose-50/50">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-rose-900">Failed to load examinations</h3>
            <p className="text-xs text-rose-700 mt-1">
              {error?.response?.data?.message || error?.message || 'Network error occurred.'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        ) : exams.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No examinations found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no exams recorded matching your selected filters. Create a new exam schedule to get started.
            </p>
            <Link
              to="/academic/exams/new"
              className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Exam</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Title & Type</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Class & Section</th>
                  <th className="py-3 px-4">Exam Schedule</th>
                  <th className="py-3 px-3 text-center">Marks (Pass / Max)</th>
                  <th className="py-3 px-4">Teacher</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((exam) => {
                  const statusBadge = STATUS_BADGES[exam.status] || STATUS_BADGES.scheduled;
                  const examTypeLabel = EXAM_TYPE_LABELS[exam.examType] || exam.examType || 'Exam';

                  return (
                    <tr key={exam._id} className="transition-colors hover:bg-slate-50/60">
                      {/* Title & Type */}
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-bold text-slate-900 text-xs block hover:text-indigo-600 cursor-pointer" onClick={() => setSelectedExamForView(exam)}>
                            {exam.title}
                          </span>
                          <span className="inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {examTypeLabel}
                          </span>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {exam.subject}
                      </td>

                      {/* Class & Section */}
                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-semibold">{exam.className}</span>{' '}
                        <span className="text-slate-500 font-normal">
                          {exam.section ? `(Sec ${exam.section})` : '(All)'}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center space-x-1 font-mono text-[11px]">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{exam.examDateString || exam.examDate?.slice(0, 10)}</span>
                        </div>
                        {exam.startTime && (
                          <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{exam.startTime} ({exam.durationMinutes}m)</span>
                          </div>
                        )}
                      </td>

                      {/* Marks */}
                      <td className="py-3 px-3 text-center font-mono font-medium">
                        <span className="text-emerald-700 font-semibold">{exam.passingMarks}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-indigo-700 font-bold">{exam.maxMarks}</span>
                      </td>

                      {/* Teacher */}
                      <td className="py-3 px-4 text-slate-700 truncate max-w-[140px]">
                        {exam.teacher ? (
                          <span title={`${exam.teacher.firstName} ${exam.teacher.lastName}`}>
                            {exam.teacher.firstName} {exam.teacher.lastName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.bg}`}>
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setSelectedExamForView(exam)}
                            className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
                            title="View Exam Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/academic/exams/${exam._id}/results`}
                            className="p-1 rounded text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                            title="Enter / View Results"
                          >
                            <BarChart2 className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/academic/exams/${exam._id}/edit`}
                            className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Edit Exam"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setExamToDelete(exam)}
                            className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Exam"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {exams.length > 0 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Showing <strong>{exams.length}</strong> of <strong>{totalCount}</strong> examinations</span>
          </div>
        )}
      </div>

      {/* Modals */}
      <ExamDetailsModal
        isOpen={Boolean(selectedExamForView)}
        onClose={() => setSelectedExamForView(null)}
        exam={selectedExamForView}
      />

      <ExamDeleteConfirmModal
        isOpen={Boolean(examToDelete)}
        onClose={() => setExamToDelete(null)}
        onConfirm={handleDeleteConfirm}
        exam={examToDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default ExamListPage;
