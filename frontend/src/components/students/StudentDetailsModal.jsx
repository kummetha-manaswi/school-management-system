import React from 'react';
import { 
  X, 
  User, 
  GraduationCap, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Heart, 
  Users, 
  Edit 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDetailsModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const statusColors = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-700 border-slate-200',
    graduated: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    transferred: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              {student.firstName?.[0]}
              {student.lastName?.[0]}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">
                  {student.firstName} {student.lastName}
                </h3>
                <span
                  className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                    statusColors[student.status] || statusColors.active
                  }`}
                >
                  {student.status || 'Active'}
                </span>
              </div>
              <p className="text-xs text-indigo-200 font-mono mt-0.5">
                Admission No: {student.admissionNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Academic Information */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70">
            <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-sm mb-3">
              <GraduationCap className="w-4 h-4" />
              <h4>Academic Information</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Class</span>
                <span className="font-semibold text-slate-800">{student.className || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Section</span>
                <span className="font-semibold text-slate-800">{student.section || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Roll Number</span>
                <span className="font-semibold text-slate-800">{student.rollNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Admission Date</span>
                <span className="font-semibold text-slate-800">{formatDate(student.admissionDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Current Status</span>
                <span className="font-semibold capitalize text-slate-800">{student.status}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Personal Information */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70">
            <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-sm mb-3">
              <User className="w-4 h-4" />
              <h4>Personal Information</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">First Name</span>
                <span className="font-semibold text-slate-800">{student.firstName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Last Name</span>
                <span className="font-semibold text-slate-800">{student.lastName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Date of Birth</span>
                <span className="font-semibold text-slate-800">{formatDate(student.dateOfBirth)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Gender</span>
                <span className="font-semibold capitalize text-slate-800">{student.gender || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Blood Group</span>
                <span className="font-semibold text-slate-800">{student.bloodGroup || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Parent / Guardian Information */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70">
            <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-sm mb-3">
              <Users className="w-4 h-4" />
              <h4>Parent / Guardian Details</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Parent Name</span>
                <span className="font-semibold text-slate-800">{student.parentName || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Parent Phone</span>
                <span className="font-semibold text-slate-800">{student.parentPhone || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Parent Email</span>
                <span className="font-semibold text-slate-800">{student.parentEmail || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Contact & Address */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70">
            <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-sm mb-3">
              <MapPin className="w-4 h-4" />
              <h4>Contact & Address</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Student Phone</span>
                <span className="font-semibold text-slate-800">{student.phone || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Student Email</span>
                <span className="font-semibold text-slate-800">{student.email || 'Not provided'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">Residential Address</span>
                <span className="font-semibold text-slate-800">
                  {[student.address, student.city, student.state, student.pincode].filter(Boolean).join(', ') || 'Not provided'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Created: {formatDate(student.createdAt)}
          </span>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-200 rounded-lg border border-slate-200 transition"
            >
              Close
            </button>
            <Link
              to={`/academic/students/${student._id}/edit`}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Student</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
