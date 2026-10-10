import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  User, 
  GraduationCap, 
  Calendar, 
  Save, 
  X, 
  AlertCircle,
  Tag,
  Info
} from 'lucide-react';
import { useStudents } from '../../hooks/useStudents';
import { useTeachers } from '../../hooks/useTeachers';

const INITIAL_FORM_STATE = {
  title: '',
  content: '',
  category: 'academic_progress',
  student: '',
  teacher: '',
  date: new Date().toISOString().slice(0, 10),
};

const CATEGORIES = [
  { value: 'academic_progress', label: 'Academic Progress' },
  { value: 'classroom_participation', label: 'Classroom Participation' },
  { value: 'behavior', label: 'Behavior & Conduct' },
  { value: 'general_observation', label: 'General Observation' },
];

export const NoteFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
  error = null,
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [validationErrors, setValidationErrors] = useState({});

  // Query active students & teachers for selectors
  const { data: studentsData } = useStudents({ status: 'active' });
  const students = studentsData?.students || [];

  const { data: teachersData } = useTeachers({ employmentStatus: 'active' });
  const teachers = teachersData?.teachers || [];

  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        category: initialData.category || 'academic_progress',
        student: initialData.student?._id || initialData.student || '',
        teacher: initialData.teacher?._id || initialData.teacher || '',
        date:
          initialData.dateString ||
          (initialData.date ? initialData.date.slice(0, 10) : new Date().toISOString().slice(0, 10)),
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setValidationErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Note title is required';
    } else if (formData.title.trim().length > 200) {
      errors.title = 'Title cannot exceed 200 characters';
    }

    if (!formData.content.trim()) {
      errors.content = 'Note content is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.student) {
      errors.student = 'Student selection is required';
    }

    if (!formData.teacher) {
      errors.teacher = 'Teacher/Author selection is required';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      title: formData.title.trim(),
      content: formData.content.trim(),
    });
  };

  const serverErrorMessage = error?.response?.data?.message || error?.message || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5 text-indigo-600">
            <div className="p-2 rounded-xl bg-indigo-50">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEdit ? 'Edit Teacher Note' : 'Create Teacher Note'}
              </h3>
              <p className="text-xs text-slate-500">Record instructional or behavioral observations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="py-4 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Server Error Alert */}
          {serverErrorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Error saving note</p>
                <p>{serverErrorMessage}</p>
              </div>
            </div>
          )}

          {/* Development Author Notice */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start space-x-2">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Development Notice:</strong> Author identity is manually selected in this development phase. It will be automatically extracted from verified JWT claims in production.
            </span>
          </div>

          {/* Student Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Student <span className="text-rose-500">*</span>
            </label>
            <select
              name="student"
              value={formData.student}
              onChange={handleChange}
              disabled={isEdit} // keep student consistent on edit
              className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition ${
                validationErrors.student ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              } ${isEdit ? 'bg-slate-50 cursor-not-allowed text-slate-500' : ''}`}
            >
              <option value="">-- Select Student --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.lastName} ({s.admissionNumber}) — {s.className} {s.section ? `(${s.section})` : ''}
                </option>
              ))}
            </select>
            {validationErrors.student && (
              <p className="text-xs text-rose-600 mt-1">{validationErrors.student}</p>
            )}
          </div>

          {/* Author/Teacher & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Author / Teacher <span className="text-rose-500">*</span>
              </label>
              <select
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition ${
                  validationErrors.teacher ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              >
                <option value="">-- Select Teacher --</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.firstName} {t.lastName} ({t.employeeId}) — {t.subject || t.specialization || 'Teacher'}
                  </option>
                ))}
              </select>
              {validationErrors.teacher && (
                <p className="text-xs text-rose-600 mt-1">{validationErrors.teacher}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observation Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observation Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition ${
                validationErrors.date ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {validationErrors.date && (
              <p className="text-xs text-rose-600 mt-1">{validationErrors.date}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Note Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {formData.title.length}/200
              </span>
            </div>
            <input
              type="text"
              name="title"
              maxLength={200}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Rapid improvement in mental arithmetic"
              className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition ${
                validationErrors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {validationErrors.title && (
              <p className="text-xs text-rose-600 mt-1">{validationErrors.title}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Observation Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="content"
              rows={4}
              value={formData.content}
              onChange={handleChange}
              placeholder="Describe specific student behaviors, academic progress, interventions, or notes for instructional follow-up..."
              className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition ${
                validationErrors.content ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {validationErrors.content && (
              <p className="text-xs text-rose-600 mt-1">{validationErrors.content}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving Note...' : isEdit ? 'Update Note' : 'Create Note'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteFormModal;
