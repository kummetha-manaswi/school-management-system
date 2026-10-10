import React from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  GraduationCap, 
  Clock, 
  X, 
  Edit, 
  ShieldAlert,
  Tag
} from 'lucide-react';

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

export const NoteDetailsModal = ({ isOpen, onClose, note, onEdit }) => {
  if (!isOpen || !note) return null;

  const categoryConfig =
    CATEGORY_CONFIG[note.category] || CATEGORY_CONFIG.general_observation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 mt-1">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${categoryConfig.badge}`}
                >
                  {categoryConfig.label}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {note.dateString || note.date?.slice(0, 10)}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{note.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 overflow-y-auto space-y-5 text-sm">
          {/* Sensitivity Banner */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Confidential Student Record:</span> This note contains internal educational and behavioral observations intended strictly for authorized instructional and administrative staff.
            </div>
          </div>

          {/* Student & Teacher Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Student metadata */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs text-slate-400 font-medium block flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>Student</span>
              </span>
              <div className="font-bold text-slate-800 text-sm">
                {note.student ? `${note.student.firstName} ${note.student.lastName}` : '—'}
              </div>
              {note.student && (
                <p className="text-xs text-slate-500 font-mono">
                  Adm: {note.student.admissionNumber} • {note.student.className}{' '}
                  {note.student.section ? `(${note.student.section})` : ''}
                  {note.student.rollNumber ? ` • Roll ${note.student.rollNumber}` : ''}
                </p>
              )}
            </div>

            {/* Author / Teacher metadata */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs text-slate-400 font-medium block flex items-center space-x-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                <span>Author / Instructor</span>
              </span>
              <div className="font-bold text-slate-800 text-sm">
                {note.teacher ? `${note.teacher.firstName} ${note.teacher.lastName}` : '—'}
              </div>
              {note.teacher && (
                <p className="text-xs text-slate-500">
                  {note.teacher.subject || note.teacher.specialization || 'Teacher'} •{' '}
                  <span className="font-mono">{note.teacher.employeeId}</span>
                </p>
              )}
            </div>
          </div>

          {/* Observation Content */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Observation Details
            </h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
              {note.content}
            </div>
          </div>

          {/* Timestamps */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Recorded: {new Date(note.createdAt).toLocaleString()}</span>
            <span>Last Edited: {new Date(note.updatedAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onEdit(note);
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Note</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteDetailsModal;
