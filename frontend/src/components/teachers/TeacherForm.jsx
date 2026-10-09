import React, { useState, useEffect } from 'react';
import { 
  User, 
  GraduationCap, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Save, 
  ArrowLeft, 
  AlertCircle,
  Briefcase,
  Layers,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

const INITIAL_FORM_STATE = {
  employeeId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: 'male',
  dateOfBirth: '',
  qualification: '',
  subject: '',
  specialization: '',
  assignedClasses: '',
  assignedSections: '',
  joiningDate: new Date().toISOString().split('T')[0],
  employmentStatus: 'active',
  address: '',
};

export const TeacherForm = ({ initialData, onSubmit, isSubmitting, error, isEdit = false }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...INITIAL_FORM_STATE,
        ...initialData,
        subject: initialData.subject || initialData.specialization || '',
        specialization: initialData.specialization || initialData.subject || '',
        assignedClasses: Array.isArray(initialData.assignedClasses)
          ? initialData.assignedClasses.join(', ')
          : initialData.assignedClasses || '',
        assignedSections: Array.isArray(initialData.assignedSections)
          ? initialData.assignedSections.join(', ')
          : initialData.assignedSections || '',
        dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '',
        joiningDate: initialData.joiningDate ? initialData.joiningDate.split('T')[0] : '',
        employmentStatus: initialData.employmentStatus || initialData.status || 'active',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user modifies field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.employeeId.trim()) errors.employeeId = 'Employee ID is required';
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email address format';
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
            <p className="font-semibold">Unable to save teacher</p>
            <p className="text-xs text-rose-700 mt-0.5">
              {error.response?.data?.message || error.message || 'An error occurred while saving the record.'}
            </p>
          </div>
        </div>
      )}

      {/* 1. Employment & Academic Information */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100 text-indigo-600">
          <Briefcase className="w-5 h-5" />
          <h3 className="font-bold text-slate-800 text-base">Employment & Academic Role</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Employee ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="e.g. EMP-101"
              className={`w-full px-3 py-2 text-sm rounded-lg border uppercase ${
                validationErrors.employeeId ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {validationErrors.employeeId && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.employeeId}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Employment Status <span className="text-rose-500">*</span>
            </label>
            <select
              name="employmentStatus"
              value={formData.employmentStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="resigned">Resigned</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Joining Date</label>
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject / Specialization
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. Mathematics, Science"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              placeholder="e.g. M.Sc, B.Ed"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Classes <span className="text-slate-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              name="assignedClasses"
              value={formData.assignedClasses}
              onChange={handleChange}
              placeholder="e.g. Class 9, Class 10"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Sections <span className="text-slate-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              name="assignedSections"
              value={formData.assignedSections}
              onChange={handleChange}
              placeholder="e.g. A, B"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Personal Information */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100 text-indigo-600">
          <User className="w-5 h-5" />
          <h3 className="font-bold text-slate-800 text-base">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              First Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. Sarah"
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                validationErrors.firstName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {validationErrors.firstName && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Last Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g. Connor"
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                validationErrors.lastName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {validationErrors.lastName && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Contact & Address Details */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100 text-indigo-600">
          <MapPin className="w-5 h-5" />
          <h3 className="font-bold text-slate-800 text-base">Contact & Address Details</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. sarah.connor@school.edu"
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                validationErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {validationErrors.email && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +1 555-0199"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
            <textarea
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. 123 Education Lane, Springfield"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <Link
          to="/academic/teachers"
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
          <span>{isSubmitting ? 'Saving Teacher...' : isEdit ? 'Save Changes' : 'Register Teacher'}</span>
        </button>
      </div>
    </form>
  );
};

export default TeacherForm;
