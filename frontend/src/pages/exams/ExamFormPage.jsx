import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Award, RefreshCw } from 'lucide-react';
import { useExam, useCreateExam, useUpdateExam } from '../../hooks/useExams';
import ExamForm from '../../components/exams/ExamForm';

export const ExamFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Queries & Mutations
  const { data: exam, isLoading, isError, error: fetchError } = useExam(id);
  const createMutation = useCreateExam();
  const updateMutation = useUpdateExam();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const submitError = createMutation.error || updateMutation.error;

  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      navigate('/academic/exams');
    } catch (err) {
      console.error('Failed to submit exam form:', err);
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading examination details...</p>
      </div>
    );
  }

  if (isEdit && isError) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-800">
        <h3 className="text-sm font-bold">Failed to load exam for editing</h3>
        <p className="text-xs text-rose-700 mt-1">
          {fetchError?.response?.data?.message || fetchError?.message || 'Record not found.'}
        </p>
        <Link
          to="/academic/exams"
          className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Exams</span>
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
            to="/academic/exams"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-sm"
            title="Back to examination list"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Academic & Parent Domain</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
              {isEdit ? 'Edit Examination' : 'Schedule New Examination'}
            </h2>
          </div>
        </div>
      </div>

      {/* Form */}
      <ExamForm
        initialData={exam}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={submitError}
        isEdit={isEdit}
      />
    </div>
  );
};

export default ExamFormPage;
