import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const NoteDeleteConfirmModal = ({ isOpen, onClose, onConfirm, note, isDeleting }) => {
  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5 text-rose-600">
            <div className="p-2 rounded-full bg-rose-50">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Observation Note</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 text-sm text-slate-600 space-y-3">
          <p>
            Are you sure you want to permanently delete this observation note?
          </p>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <p className="font-semibold text-slate-900 text-sm">{note.title}</p>
            <div className="flex items-center space-x-3 text-slate-500 pt-0.5">
              <span>Student: <strong className="text-slate-700">{note.student?.firstName} {note.student?.lastName}</strong></span>
              <span>Author: <strong className="text-slate-700">{note.teacher?.firstName} {note.teacher?.lastName}</strong></span>
            </div>
            <p className="text-slate-500">
              Date: <span className="font-mono text-slate-700">{note.dateString || note.date?.slice(0, 10)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-sm disabled:opacity-50"
          >
            {isDeleting ? (
              <span>Deleting...</span>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteDeleteConfirmModal;
