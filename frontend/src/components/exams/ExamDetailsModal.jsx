import React from 'react';
import { 
  Award, 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  Layers, 
  X, 
  Edit, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  BarChart2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const EXAM_TYPE_LABELS = {
  unit_test: 'Unit Test',
  midterm: 'Midterm',
  final: 'Final Exam',
  quiz: 'Quiz',
  practical: 'Practical',
  other: 'Other',
};

const STATUS_BADGES = {
  scheduled: { label: 'Scheduled', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  ongoing: { label: 'Ongoing', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: 'Completed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const ExamDetailsModal = ({ isOpen, onClose, exam }) => {
  if (!isOpen || !exam) return null;

  const statusBadge = STATUS_BADGES[exam.status] || STATUS_BADGES.scheduled;
  const examTypeLabel = EXAM_TYPE_LABELS[exam.examType] || exam.examType || 'Exam';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 mt-1">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-indigo-100 text-indigo-800">
                  {examTypeLabel}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{exam.title}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{exam.subject}</p>
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
          {/* Key metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Target Class</span>
              <span className="text-slate-800 font-semibold mt-0.5 block">
                {exam.className} {exam.section ? `(Section ${exam.section})` : '(All Sections)'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Exam Date</span>
              <div className="flex items-center space-x-1.5 mt-0.5 text-slate-800 font-semibold font-mono text-xs">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>{exam.examDateString || exam.examDate?.slice(0, 10)}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Schedule / Duration</span>
              <div className="flex items-center space-x-1.5 mt-0.5 text-slate-800 font-semibold text-xs">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>{exam.startTime ? `${exam.startTime} (${exam.durationMinutes} min)` : `${exam.durationMinutes} min`}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Maximum Marks</span>
              <span className="text-indigo-700 font-bold text-base mt-0.5 block font-mono">
                {exam.maxMarks}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Passing Marks</span>
              <span className="text-emerald-700 font-bold text-base mt-0.5 block font-mono">
                {exam.passingMarks} ({((exam.passingMarks / exam.maxMarks) * 100).toFixed(0)}%)
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Assigned Teacher</span>
              <span className="text-slate-800 font-medium text-xs mt-0.5 block truncate">
                {exam.teacher
                  ? `${exam.teacher.firstName} ${exam.teacher.lastName}`
                  : 'Unassigned'}
              </span>
            </div>
          </div>

          {/* Instructions */}
          {exam.instructions && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Instructions & Guidelines</span>
              </h4>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {exam.instructions}
              </div>
            </div>
          )}

          {/* System metadata */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Created: {new Date(exam.createdAt).toLocaleDateString()}</span>
            <span>Last Updated: {new Date(exam.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Link
            to={`/academic/exams/${exam._id}/results`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Enter / View Results</span>
          </Link>

          <div className="flex items-center space-x-2">
            <Link
              to={`/academic/exams/${exam._id}/edit`}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Exam</span>
            </Link>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetailsModal;
