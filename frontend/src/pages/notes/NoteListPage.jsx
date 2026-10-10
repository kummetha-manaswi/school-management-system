import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  GraduationCap, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  Filter, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight,
  Tag
} from 'lucide-react';
import { 
  useNotes, 
  useNoteSummary, 
  useCreateNote, 
  useUpdateNote, 
  useDeleteNote 
} from '../../hooks/useNotes';
import { useStudents } from '../../hooks/useStudents';
import { useTeachers } from '../../hooks/useTeachers';
import NoteDetailsModal from '../../components/notes/NoteDetailsModal';
import NoteFormModal from '../../components/notes/NoteFormModal';
import NoteDeleteConfirmModal from '../../components/notes/NoteDeleteConfirmModal';

const CATEGORY_CONFIG = {
  academic_progress: {
    label: 'Academic Progress',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  classroom_participation: {
    label: 'Classroom Participation',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  behavior: {
    label: 'Behavior & Conduct',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  general_observation: {
    label: 'General Observation',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

export const NoteListPage = () => {
  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedNoteForView, setSelectedNoteForView] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Queries
  const { data: studentsData } = useStudents({ status: 'active' });
  const students = studentsData?.students || [];

  const { data: teachersData } = useTeachers({ employmentStatus: 'active' });
  const teachers = teachersData?.teachers || [];

  const {
    data: notesData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useNotes({
    search: searchTerm,
    category: categoryFilter,
    student: studentFilter,
    teacher: teacherFilter,
    date: dateFilter,
    className: classFilter,
    page,
    limit,
    sortBy: 'createdAt',
    order: 'desc',
  });

  const { data: summary, isLoading: isLoadingSummary } = useNoteSummary({
    student: studentFilter,
    teacher: teacherFilter,
    date: dateFilter,
    className: classFilter,
  });

  // Mutations
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  const notes = notesData?.notes || [];
  const totalNotes = notesData?.total || 0;
  const totalPages = notesData?.totalPages || 0;

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStudentFilter('');
    setTeacherFilter('');
    setDateFilter('');
    setClassFilter('');
    setPage(1);
  };

  const handleOpenCreate = () => {
    setEditingNote(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingNote) {
        await updateMutation.mutateAsync({ id: editingNote._id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setIsFormOpen(false);
      setEditingNote(null);
    } catch (err) {
      console.error('Form submission failed:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return;
    try {
      await deleteMutation.mutateAsync(noteToDelete._id);
      setNoteToDelete(null);
    } catch (err) {
      console.error('Delete note failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Academic & Parent Domain</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Teacher Notes</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record, review, and track individual student academic progress, behavior, and classroom observations.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-sm"
            title="Refresh notes"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Note</span>
          </button>
        </div>
      </div>

      {/* Sensitive Classification Notice Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start space-x-3">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Confidential Educational Records:</span> Observations in this module are classified as sensitive student records. In this development phase, authentication is in pass-through mode; production deployment requires full JWT signature validation and role-based permissions.
        </div>
      </div>

      {/* KPI Category Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 block">Total Notes</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {isLoadingSummary ? '...' : summary.total}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-blue-600 block">Academic Progress</span>
          <span className="text-2xl font-bold text-blue-700 mt-1 block">
            {isLoadingSummary ? '...' : summary.academic_progress}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-purple-600 block">Participation</span>
          <span className="text-2xl font-bold text-purple-700 mt-1 block">
            {isLoadingSummary ? '...' : summary.classroom_participation}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-amber-600 block">Behavior & Conduct</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">
            {isLoadingSummary ? '...' : summary.behavior}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-emerald-600 block">General Observations</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {isLoadingSummary ? '...' : summary.general_observation}
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
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title or content..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="academic_progress">Academic Progress</option>
            <option value="classroom_participation">Classroom Participation</option>
            <option value="behavior">Behavior & Conduct</option>
            <option value="general_observation">General Observation</option>
          </select>

          {/* Student Filter */}
          <select
            value={studentFilter}
            onChange={(e) => {
              setStudentFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Students</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.firstName} {s.lastName} ({s.admissionNumber})
              </option>
            ))}
          </select>

          {/* Teacher/Author Filter */}
          <select
            value={teacherFilter}
            onChange={(e) => {
              setTeacherFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Authors</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.firstName} {t.lastName} ({t.employeeId})
              </option>
            ))}
          </select>

          {/* Class Filter */}
          <input
            type="text"
            placeholder="Class (e.g. Grade 10)"
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />

          {/* Reset Filters */}
          <button
            onClick={handleResetFilters}
            className="w-full px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Notes List / Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading teacher observations...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center bg-rose-50/50">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-rose-900">Failed to load notes</h3>
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
        ) : notes.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No notes found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No observation notes match your selected criteria. Record a new note to start tracking observations.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Record First Note</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Category & Title</th>
                  <th className="py-3 px-4">Author / Teacher</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notes.map((note) => {
                  const categoryConfig =
                    CATEGORY_CONFIG[note.category] || CATEGORY_CONFIG.general_observation;

                  return (
                    <tr key={note._id} className="transition-colors hover:bg-slate-50/60">
                      {/* Student Info */}
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {note.student ? `${note.student.firstName} ${note.student.lastName}` : '—'}
                          </div>
                          {note.student && (
                            <div className="text-[11px] text-slate-400 font-mono">
                              Adm: {note.student.admissionNumber} • {note.student.className}{' '}
                              {note.student.section ? `(${note.student.section})` : ''}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Category & Title */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center space-x-1.5 mb-0.5">
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full font-semibold border ${categoryConfig.badge}`}
                          >
                            {categoryConfig.label}
                          </span>
                        </div>
                        <div
                          onClick={() => setSelectedNoteForView(note)}
                          className="font-semibold text-slate-800 text-xs truncate hover:text-indigo-600 cursor-pointer"
                          title={note.title}
                        >
                          {note.title}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate" title={note.content}>
                          {note.content}
                        </p>
                      </td>

                      {/* Teacher Author */}
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-medium text-xs">
                          {note.teacher ? `${note.teacher.firstName} ${note.teacher.lastName}` : '—'}
                        </div>
                        {note.teacher && (
                          <div className="text-[11px] text-slate-400">
                            {note.teacher.subject || note.teacher.specialization || 'Teacher'}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{note.dateString || note.date?.slice(0, 10)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setSelectedNoteForView(note)}
                            className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
                            title="View Note Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(note)}
                            className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Edit Note"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setNoteToDelete(note)}
                            className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Note"
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

        {/* Pagination & Summary Footer */}
        {totalNotes > 0 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>
              Showing <strong>{notes.length}</strong> of <strong>{totalNotes}</strong> notes
              {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
            </span>

            {totalPages > 1 && (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-medium">{page}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <NoteFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingNote(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingNote}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        error={createMutation.error || updateMutation.error}
      />

      <NoteDetailsModal
        isOpen={Boolean(selectedNoteForView)}
        onClose={() => setSelectedNoteForView(null)}
        note={selectedNoteForView}
        onEdit={handleOpenEdit}
      />

      <NoteDeleteConfirmModal
        isOpen={Boolean(noteToDelete)}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleDeleteConfirm}
        note={noteToDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default NoteListPage;
