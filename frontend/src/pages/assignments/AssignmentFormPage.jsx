import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, RefreshCw } from 'lucide-react';
import { useAssignment, useCreateAssignment, useUpdateAssignment } from '../../hooks/useAssignments';
import AssignmentForm from '../../components/assignments/AssignmentForm';

export const AssignmentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Queries & Mutations
  const { data: assignment, isLoading, isError, error: fetchError } = useAssignment(id);
  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const submitError = createMutation.error || updateMutation.error;

  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      navigate('/academic/assignments');
    } catch (err) {
      console.error('Failed to submit assignment form:', err);
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading assignment details...</p>
      </div>
    );
  }

  if (isEdit && isError) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-800">
        <h3 className="text-sm font-bold">Failed to load assignment for editing</h3>
        <p className="text-xs text-rose-700 mt-1">
          {fetchError?.response?.data?.message || fetchError?.message || 'Record not found.'}
        </p>
        <Link
          to="/academic/assignments"
          className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Assignments</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            to="/academic/assignments"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-sm"
            title="Back to list"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Academic & Parent Domain</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
              {isEdit ? 'Edit Assignment' : 'Create New Assignment'}
            </h2>
          </div>
        </div>
      </div>

      {/* Form */}
      <AssignmentForm
        initialData={assignment}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={submitError}
        isEdit={isEdit}
      />
    </div>
  );
};

export default AssignmentFormPage;
