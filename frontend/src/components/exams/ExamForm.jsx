import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  Save, 
  AlertCircle,
  AlertTriangle,
  FileText,
  Layers,
  Percent
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTeachers } from '../../hooks/useTeachers';

const INITIAL_FORM_STATE = {
  title: '',
  examType: 'unit_test',
  subject: '',
  className: '',
  section: '',
  teacher: '',
  examDate: new Date().toISOString().slice(0, 10),
  startTime: '',
  durationMinutes: 60,
  maxMarks: 100,
  passingMarks: 35,
  instructions: '',
  status: 'scheduled',
};

const EXAM_TYPES = [
  { value: 'unit_test', label: 'Unit Test' },
  { value: 'midterm', label: 'Midterm Examination' },
  { value: 'final', label: 'Final Examination' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'practical', label: 'Practical / Lab' },
  { value: 'other', label: 'Other Assessment' },
];

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const ExamForm = ({ initialData, onSubmit, isSubmitting, error, isEdit = false }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [validationErrors, setValidationErrors] = useState({});

  // Teachers query for dropdown
  const { data: teachersData } = useTeachers({ employmentStatus: 'active' });
  const teachers = teachersData?.teachers || [];

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...INITIAL_FORM_STATE,
        ...initialData,
        teacher: initialData.teacher?._id || initialData.teacher || '',
        examDate:
          initialData.examDateString ||
          (initialData.examDate ? initialData.examDate.slice(0, 10) : new Date().toISOString().slice(0, 10)),
        durationMinutes: initialData.durationMinutes !== undefined ? initialData.durationMinutes : 60,
        maxMarks: initialData.maxMarks !== undefined ? initialData.maxMarks : 100,
        passingMarks: initialData.passingMarks !== undefined ? initialData.passingMarks : 35,
        section: initialData.section || '',
        startTime: initialData.startTime || '',
        instructions: initialData.instructions || '',
      });
    }
  }, [initialData]);

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
    if (!formData.title.trim()) errors.title = 'Exam title is required';
    if (!formData.subject.trim()) errors.subject = 'Subject is required';
    if (!formData.className.trim()) errors.className = 'Class is required';
    if (!formData.examDate) errors.examDate = 'Exam date is required';

    const max = Number(formData.maxMarks);
    const pass = Number(formData.passingMarks);

    if (isNaN(max) || max <= 0) {
      errors.maxMarks = 'Maximum marks must be greater than zero';
    }
    if (isNaN(pass) || pass < 0) {
      errors.passingMarks = 'Passing marks cannot be negative';
    } else if (pass > max) {
      errors.passingMarks = `Passing marks (${pass}) cannot exceed maximum marks (${max})`;
    }

    const dur = Number(formData.durationMinutes);
    if (isNaN(dur) || dur < 1) {
      errors.durationMinutes = 'Duration must be at least 1 minute';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      title: formData.title.trim(),
      subject: formData.subject.trim(),
      className: formData.className.trim(),
      section: formData.section.trim().toUpperCase(),
      teacher: formData.teacher || null,
      durationMinutes: Number(formData.durationMinutes),
      maxMarks: Number(formData.maxMarks),
      passingMarks: Number(formData.passingMarks),
      startTime: formData.startTime.trim(),
      instructions: formData.instructions.trim(),
    };

    onSubmit(payload);
  };

  // Determine server error message
  const serverErrorMessage = error?.response?.data?.message || error?.message || null;
  const isConflictError = error?.response?.status === 409;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Server Error Alert */}
      {serverErrorMessage && (
        <div
          className={`p-4 rounded-xl border flex items-start space-x-3 ${
            isConflictError
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {isConflictError ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="text-sm">
            <h4 className="font-bold">
              {isConflictError ? 'Conflict: Results Incompatibility' : 'Failed to save examination'}
            </h4>
            <p className="mt-0.5 text-xs">{serverErrorMessage}</p>
          </div>
        </div>
      )}

      {/* Section 1: Basic Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 text-slate-800 font-semibold text-sm">
          <Award className="w-4 h-4 text-indigo-600" />
          <span>Exam Overview</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Exam Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Midterm Mathematics Exam 2026"
              className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition ${
                validationErrors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {validationErrors.title && (
              <p className="text-xs text-rose-600 mt-1">{validationErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Exam Type <span className="text-rose-500">*</span>
            </label>
            <select
              name="examType"
              value={formData.examType}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition bg-white"
            >
              {EXAM_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. Mathematics, Science, English"
              className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition ${
                validationErrors.subject ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {validationErrors.subject && (
              <p className="text-xs text-rose-600 mt-1">{validationErrors.subject}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Class <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="className"
              value={formData.className}
              onChange={handleChange}
              placeholder="e.g. Grade 10, Class 8"
              className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition ${
                validationErrors.className ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {validationErrors.className && (
              <p className="text-xs text-rose-600 mt-1">{validationErrors.className}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Section <span className="text-slate-400 font-normal">(Optional - leave blank for all sections)</span>
            </label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleChange}
              placeholder="e.g. A, B, or blank for all"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition uppercase"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Schedule & Instructor */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 text-slate-800 font-semibold text-sm">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>Schedule & Instructor</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Exam Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="examDate"
              value={formData.examDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition ${
                validationErrors.examDate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {validationErrors.examDate && (
              <p className="text-xs text-rose-600 mt-1">{validationErrors.examDate}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Start Time <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              placeholder="e.g. 09:30 AM"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Duration (Minutes) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="durationMinutes"
              min="1"
              value={formData.durationMinutes}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition ${
                validationErrors.durationMinutes ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {validationErrors.durationMinutes && (
              <p className="text-xs text-rose-600 mt-1">{validationErrors.durationMinutes}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supervising Teacher <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <select
              name="teacher"
              value={formData.teacher}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition bg-white"
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.firstName} {t.lastName} ({t.employeeId}) - {t.subject || t.specialization || 'Teacher'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Exam Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition bg-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Grading & Marks Thresholds */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 text-slate-800 font-semibold text-sm">
          <Percent className="w-4 h-4 text-indigo-600" />
          <span>Grading & Marks Thresholds</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Maximum Marks <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="maxMarks"
              min="1"
              value={formData.maxMarks}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition ${
                validationErrors.maxMarks ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {validationErrors.maxMarks && (
              <p className="text-xs text-rose-600 mt-1">{validationErrors.maxMarks}</p>
            )}
            {isEdit && (
              <p className="text-[11px] text-slate-400 mt-1">
                Note: Cannot be set lower than any existing recorded student score.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Passing Marks <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="passingMarks"
              min="0"
              value={formData.passingMarks}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition ${
                validationErrors.passingMarks ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {validationErrors.passingMarks && (
              <p className="text-xs text-rose-600 mt-1">{validationErrors.passingMarks}</p>
            )}
            {Number(formData.maxMarks) > 0 && (
              <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                Passing percentage threshold: {((Number(formData.passingMarks) / Number(formData.maxMarks)) * 100).toFixed(1)}%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: Instructions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 text-slate-800 font-semibold text-sm">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Instructions & Remarks</span>
        </div>

        <div>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows="3"
            placeholder="Add examination instructions, permissible equipment (calculators, log tables), or guidelines for students..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <Link
          to="/academic/exams"
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving Examination...' : isEdit ? 'Update Examination' : 'Create Examination'}</span>
        </button>
      </div>
    </form>
  );
};

export default ExamForm;
