import React from 'react';
import { 
  X, 
  User, 
  GraduationCap, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Layers, 
  Edit,
  Award,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeacherDetailsModal = ({ isOpen, onClose, teacher }) => {
  if (!isOpen || !teacher) return null;

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
    resigned: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  const assignedClassesStr = Array.isArray(teacher.assignedClasses) && teacher.assignedClasses.length > 0
    ? teacher.assignedClasses.join(', ')
    : 'None assigned';

  const assignedSectionsStr = Array.isArray(teacher.assignedSections) && teacher.assignedSections.length > 0
    ? teacher.assignedSections.join(', ')
    : 'None assigned';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              {teacher.firstName?.[0]}
              {teacher.lastName?.[0]}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">
                  {teacher.firstName} {teacher.lastName}
                </h3>
                <span
                  className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                    statusColors[teacher.employmentStatus] || statusColors.active
                  }`}
                >
                  {teacher.employmentStatus || 'Active'}
                </span>
              </div>
              <p className="text-xs text-indigo-200 font-mono mt-0.5">
                Employee ID: {teacher.employeeId}
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
          {/* Section 1: Professional & Teaching Profile */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70">
            <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-sm mb-3">
              <GraduationCap className="w-4 h-4" />
              <h4>Teaching & Academic Profile</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Subject / Specialization</span>
                <span className="font-semibold text-slate-800">{teacher.subject || teacher.specialization || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Qualification</span>
                <span className="font-semibold text-slate-800">{teacher.qualification || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Joining Date</span>
                <span className="font-semibold text-slate-800">{formatDate(teacher.joiningDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Assigned Classes</span>
                <span className="font-semibold text-slate-800">{assignedClassesStr}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Assigned Sections</span>
                <span className="font-semibold text-slate-800">{assignedSectionsStr}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Employment Status</span>
                <span className="font-semibold text-slate-800 capitalize">{teacher.employmentStatus || 'Active'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Personal Profile */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70">
            <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-sm mb-3">
              <User className="w-4 h-4" />
              <h4>Personal Details</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Gender</span>
                <span className="font-semibold text-slate-800 capitalize">{teacher.gender || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Date of Birth</span>
                <span className="font-semibold text-slate-800">{formatDate(teacher.dateOfBirth)}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Contact & Address */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70">
            <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-sm mb-3">
              <Mail className="w-4 h-4" />
              <h4>Contact & Location</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Email Address</span>
                <span className="font-semibold text-slate-800">{teacher.email || 'None provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone Number</span>
                <span className="font-semibold text-slate-800">{teacher.phone || 'None provided'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">Address</span>
                <span className="font-semibold text-slate-800">{teacher.address || 'None provided'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <Link
            to={`/academic/teachers/${teacher._id}/edit`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Teacher</span>
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailsModal;
