import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle,
  FileText,
  Layers,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTeachers } from '../../hooks/useTeachers';

const INITIAL_FORM_STATE = {
  title: '',
  description: '',
  subject: '',
  className: '',
  section: '',
  teacher: '',
  assignedDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  status: 'published',
  maxMarks: 100,
  attachments: [],
};

export const AssignmentForm = ({ initialData, onSubmit, isSubmitting, error, isEdit = false }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [validationErrors, setValidationErrors] = useState({});

  // Load teachers for the instructor select dropdown
  const { data: teachersData } = useTeachers({ employmentStatus: 'active' });
  const teachers = teachersData?.teachers || [];

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...INITIAL_FORM_STATE,
        ...initialData,
        teacher: initialData.teacher?._id || initialData.teacher || '',
        assignedDate: initialData.assignedDateString || initialData.assignedDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        dueDate: initialData.dueDateString || initialData.dueDate?.slice(0, 10) || '',
        attachments: Array.isArray(initialData.attachments) ? initialData.attachments : [],
        maxMarks: initialData.maxMarks !== undefined ? initialData.maxMarks : 100,
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

  const handleAddAttachment = () => {
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, { title: '', url: '' }],
    }));
  };

  const handleRemoveAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleAttachmentChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.attachments];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, attachments: updated };
    });
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Assignment title is required';
    if (!formData.subject.trim()) errors.subject = 'Subject is required';
    if (!formData.className.trim()) errors.className = 'Class is required';
    if (!formData.dueDate) errors.dueDate = 'Due date is required';

    if (formData.assignedDate && formData.dueDate) {
      if (formData.dueDate < formData.assignedDate) {
        errors.dueDate = 'Due date cannot be earlier than assigned date';
      }
    }

    // Validate attachment URLs
    if (formData.attachments && formData.attachments.length > 0) {
      for (let i = 0; i < formData.attachments.length; i++) {
        const item = formData.attachments[i];
        const url = (item.url || '').trim();
        if (!url) {
          errors[`attachment_${i}`] = 'Attachment URL cannot be empty';
        } else {
          try {
            const parsed = new URL(url);
            if (!['http:', 'https:'].includes(parsed.protocol)) {
              errors[`attachment_${i}`] = 'URL must start with http:// or https://';
            }
          } catch {
            errors[`attachment_${i}`] = 'Must be a valid web URL (e.g. https://...)';
          }
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Banner Error from API if any */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to save assignment</p>
            <p className="text-xs text-rose-700 mt-0.5">
              {error.response?.data?.message || error.message || 'An error occurred while saving the assignment.'}
            </p>
          </div>
        </div>
      )}

      {/* 1. Academic & Coursework Details */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100 text-indigo-600">
          <BookOpen className="w-5 h-5" />
          <h3 className="font-bold text-slate-800 text-base">Coursework Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assignment Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Unit 3: Quadratic Functions Problem Set"
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                validationErrors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {validationErrors.title && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.title}</p>
            )}
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
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                validationErrors.subject ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {validationErrors.subject && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.subject}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instructor / Teacher
            </label>
            <select
              name="teacher"
              value={formData.teacher}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Select Instructor (Optional)</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.firstName} {t.lastName} ({t.employeeId}) {t.subject ? `— ${t.subject}` : ''}
                </option>
              ))}
            </select>
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
              placeholder="e.g. Class 10"
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                validationErrors.className ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {validationErrors.className && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.className}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Section <span className="text-slate-400 font-normal">(Leave empty for All Sections)</span>
            </label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleChange}
              placeholder="e.g. A (or blank for All Sections)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
            />
          </div>
        </div>
      </div>

      {/* 2. Timeline, Status & Scoring */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100 text-indigo-600">
          <Calendar className="w-5 h-5" />
          <h3 className="font-bold text-slate-800 text-base">Timeline & Evaluation</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="assignedDate"
              value={formData.assignedDate}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Due Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm rounded-lg border font-mono ${
                validationErrors.dueDate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {validationErrors.dueDate && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.dueDate}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Max Marks / Score</label>
            <input
              type="number"
              name="maxMarks"
              min="0"
              value={formData.maxMarks}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. Description & Instructions */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100 text-indigo-600">
          <FileText className="w-5 h-5" />
          <h3 className="font-bold text-slate-800 text-base">Instructions & Content</h3>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Assignment Details & Submission Guidelines
          </label>
          <textarea
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder="Outline task objectives, questions, submission instructions, or required readings..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* 4. Coursework Attachments / Resource Links */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5 text-indigo-600">
            <LinkIcon className="w-5 h-5" />
            <h3 className="font-bold text-slate-800 text-base">Resource Links & Attachments</h3>
          </div>
          <button
            type="button"
            onClick={handleAddAttachment}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Resource Link</span>
          </button>
        </div>

        {formData.attachments.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            No resource links attached. Click "Add Resource Link" to attach Google Drive materials, reference PDFs, or worksheet URLs.
          </p>
        ) : (
          <div className="space-y-3">
            {formData.attachments.map((att, idx) => (
              <div key={idx} className="flex items-start space-x-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      value={att.title}
                      onChange={(e) => handleAttachmentChange(idx, 'title', e.target.value)}
                      placeholder="Resource Title (e.g. Worksheet PDF)"
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="url"
                      value={att.url}
                      onChange={(e) => handleAttachmentChange(idx, 'url', e.target.value)}
                      placeholder="https://example.com/file.pdf"
                      className={`w-full px-3 py-1.5 text-xs rounded-md border ${
                        validationErrors[`attachment_${idx}`] ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white`}
                    />
                    {validationErrors[`attachment_${idx}`] && (
                      <p className="text-[10px] text-rose-600 mt-1">{validationErrors[`attachment_${idx}`]}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition mt-0.5"
                  title="Remove link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <Link
          to="/academic/assignments"
          className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving Assignment...' : isEdit ? 'Save Changes' : 'Create Assignment'}</span>
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;
