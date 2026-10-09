import React, { useState, useEffect } from 'react';
import { 
  User, 
  GraduationCap, 
  MapPin, 
  Users, 
  Save, 
  ArrowLeft, 
  AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const INITIAL_FORM_STATE = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'male',
  bloodGroup: '',
  admissionNumber: '',
  className: '',
  section: '',
  rollNumber: '',
  admissionDate: new Date().toISOString().split('T')[0],
  status: 'active',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  parentName: '',
  parentPhone: '',
  parentEmail: '',
};

export const StudentForm = ({ initialData, onSubmit, isSubmitting, error, isEdit = false }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...INITIAL_FORM_STATE,
        ...initialData,
        dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '',
        admissionDate: initialData.admissionDate ? initialData.admissionDate.split('T')[0] : '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.admissionNumber.trim()) errors.admissionNumber = 'Admission number is required';
    if (!formData.className.trim()) errors.className = 'Class is required';

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email address format';
    }
    if (formData.parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
      errors.parentEmail = 'Invalid parent email address format';
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
            <p className="font-semibold">Unable to save student</p>
            <p className="text-xs text-rose-700 mt-0.5">
              {error.response?.data?.message || error.message || 'An error occurred while saving the record.'}
            </p>
          </div>
        </div>
      )}

      {/* 1. Academic Information */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100 text-indigo-600">
          <GraduationCap className="w-5 h-5" />
          <h3 className="font-bold text-slate-800 text-base">Academic Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admission Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="admissionNumber"
              value={formData.admissionNumber}
              onChange={handleChange}
              placeholder="e.g. ADM-2026-001"
              className={`w-full px-3 py-2 text-sm rounded-lg border uppercase ${
                validationErrors.admissionNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {validationErrors.admissionNumber && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.admissionNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Class <span className="text-rose-500">*</span>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleChange}
              placeholder="e.g. A"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number</label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              placeholder="e.g. 101"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Date</label>
            <input
              type="date"
              name="admissionDate"
              value={formData.admissionDate}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Personal Information */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100 text-indigo-600">
          <User className="w-5 h-5" />
          <h3 className="font-bold text-slate-800 text-base">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              First Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. Aarav"
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
              placeholder="e.g. Sharma"
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                validationErrors.lastName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {validationErrors.lastName && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.lastName}</p>
            )}
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Select blood group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Parent / Guardian Information */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100 text-indigo-600">
          <Users className="w-5 h-5" />
          <h3 className="font-bold text-slate-800 text-base">Parent / Guardian Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Name</label>
            <input
              type="text"
              name="parentName"
              value={formData.parentName}
              onChange={handleChange}
              placeholder="e.g. Rajesh Sharma"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Phone</label>
            <input
              type="tel"
              name="parentPhone"
              value={formData.parentPhone}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Email</label>
            <input
              type="email"
              name="parentEmail"
              value={formData.parentEmail}
              onChange={handleChange}
              placeholder="e.g. rajesh@example.com"
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                validationErrors.parentEmail ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {validationErrors.parentEmail && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.parentEmail}</p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Contact & Address */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100 text-indigo-600">
          <MapPin className="w-5 h-5" />
          <h3 className="font-bold text-slate-800 text-base">Contact & Address</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Student Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Optional student phone"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Student Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@example.com"
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                validationErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {validationErrors.email && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="House/Plot No, Street, Landmark"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Hyderabad"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g. Telangana"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="e.g. 500001"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <Link
          to="/academic/students"
          className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : isEdit ? 'Update Student Record' : 'Register Student'}</span>
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
