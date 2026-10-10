import React from 'react';
import { 
  X, 
  BookOpen, 
  Calendar, 
  Clock, 
  ExternalLink, 
  User, 
  FileText, 
  Edit, 
  Award,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AssignmentDetailsModal = ({ isOpen, onClose, assignment }) => {
  if (!isOpen || !assignment) return null;

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

  const statusBadges = {
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    completed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    archived: 'bg-slate-200 text-slate-600 border-slate-300',
  };

  const teacher = assignment.teacher;
  const isOverdue = assignment.isOverdue;
  const sectionText = assignment.section ? `Section ${assignment.section}` : 'All Sections';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white line-clamp-1">
                  {assignment.title}
                </h3>
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                    statusBadges[assignment.status] || statusBadges.published
                  }`}
                >
                  {assignment.status}
                </span>
                {isOverdue && (
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 mr-0.5" />
                    Overdue
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                {assignment.subject} • {assignment.className} ({sectionText})
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
          {/* Key Dates & Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Assigned Date</span>
              <div className="flex items-center space-x-1.5 mt-1 text-slate-800 text-xs font-semibold">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>{formatDate(assignment.assignedDate)}</span>
              </div>
            </div>

            <div className={`rounded-xl p-3 border ${isOverdue ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200/70'}`}>
              <span className={`text-[11px] font-semibold block uppercase ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`}>Due Date</span>
              <div className={`flex items-center space-x-1.5 mt-1 text-xs font-semibold ${isOverdue ? 'text-rose-900' : 'text-slate-800'}`}>
                <Clock className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-600' : 'text-indigo-600'}`} />
                <span>{formatDate(assignment.dueDate)}</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Max Marks</span>
              <div className="flex items-center space-x-1.5 mt-1 text-slate-800 text-xs font-semibold">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>{assignment.maxMarks || 100} Points</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Target Class</span>
              <div className="flex items-center space-x-1.5 mt-1 text-slate-800 text-xs font-semibold">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>{assignment.className}</span>
              </div>
            </div>
          </div>

          {/* Teacher Section */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-2">
              Instructor / Teacher
            </span>
            {teacher ? (
              <div className="flex items-center space-x-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                  {teacher.firstName?.[0]}
                  {teacher.lastName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {teacher.firstName} {teacher.lastName}
                  </p>
                  <p className="text-slate-500 font-mono text-[11px]">
                    ID: {teacher.employeeId} {teacher.email ? `• ${teacher.email}` : ''}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No specific teacher assigned</p>
            )}
          </div>

          {/* Description Section */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Instructions & Description
            </h4>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
              {assignment.description || <span className="text-slate-400 italic">No description provided for this coursework.</span>}
            </div>
          </div>

          {/* Attachments / Resource Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Coursework Resources & Links ({assignment.attachments?.length || 0})
            </h4>
            {assignment.attachments && assignment.attachments.length > 0 ? (
              <div className="space-y-2">
                {assignment.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition group text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span className="font-medium text-slate-800 group-hover:text-indigo-600 transition">
                        {att.title || att.url}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No external resource links attached.</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <Link
            to={`/academic/assignments/${assignment._id}/edit`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Assignment</span>
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

export default AssignmentDetailsModal;
